import { createRequire } from "module";
const require = createRequire(import.meta.url);

import axios from "axios";
import FormData from "form-data";

import { UserResume } from "../models/UserResume.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import { uploadPDF, cloudinary } from "../utils/cloudinary.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// Function to call Python service for PDF/DOCX text extraction
async function extractTextWithPython(file) {
  const form = new FormData();
  form.append("resume", file.buffer, file.originalname);

  const response = await axios.post("http://127.0.0.1:5001/extract", form, {
    headers: form.getHeaders(),
    maxBodyLength: Infinity,
  });

  return response.data || {};
}

// ===================== UPLOAD NEW RESUME =====================
export const uploadUserResume = asyncHandler(async (req, res) => {
  const resumeFile = req.file; // <-- single file
  if (!resumeFile) return res.status(400).json({ error: "Resume file is required" });

  // Upload PDF to Cloudinary
  const uploadResult = await uploadPDF(resumeFile.buffer, "user-resumes");

  // Extract text using Python service
  let extractedTexts = {};
  try {
    extractedTexts = await extractTextWithPython(resumeFile);
  } catch (err) {
    console.warn("Text extraction failed:", err.message);
  }
  const resumeText = extractedTexts.resume || "";

  // AI analysis - structured JSON by main CV sections
  let aiResult = {};
  try {
    const prompt = `
You are analyzing a candidate's CV. Extract only the main sections and ignore any extra informational text. 
Organize the information in the following JSON format:

{
  "personalInformation": {
    "fullName": "",
    "title": "",
    "email": "",
    "phone": "",
    "dateOfBirth": "",
    "address": ""
  },
  "professionalSummary": "",
  "education": [
    {
      "degree": "",
      "school": "",
      "year": ""
    }
  ],
  "achievements": ["list of achievements"],
  "experience": [
    {
      "position": "",
      "company": "",
      "startDate": "",
      "endDate": "",
      "description": ""
    }
  ],
  "projects": [
    {
      "name": "",
      "description": ""
    }
  ],
  "skills": {
    "programming": [],
    "frameworks": [],
    "tools": [],
    "softSkills": []
  },
  "certifications": ["list of certifications"],
  "extracurricular": [
    {
      "role": "",
      "organization": "",
      "year": "",
      "description": ""
    }
  ],
  "languages": [
    {
      "name": "",
      "level": ""
    }
  ],
  "raw": "full text analysis from resume"
}

Here is the resume text:

${resumeText}

Return only valid JSON. Do not include extra explanations.
`;

    const response = await axios.post(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      contents: [{ parts: [{ text: prompt }] }],
    });

    const geminiText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (geminiText) {
      try {
        aiResult = JSON.parse(geminiText);
      } catch {
        aiResult = { raw: geminiText };
      }
    }
  } catch (err) {
    console.error("Gemini AI analysis failed:", err.message);
    aiResult = { raw: "AI analysis failed" };
  }

  // Save to DB
  const userResume = await UserResume.create({
    user_id: req.user.id,
    resume: uploadResult.secure_url,
    resumePublicId: uploadResult.public_id,
    extracted_text: resumeText,
    ai_analysis: aiResult,
    uploaded_at: new Date(),
  });

  res
    .status(201)
    .json({ message: "Resume uploaded and analyzed successfully", data: userResume });
});

// ===================== UPDATE EXISTING RESUME =====================
// Update resume: new file OR manual AI JSON update
export const updateUserResume = asyncHandler(async (req, res) => {
  const resumeId = req.params.id;
  const resume = await UserResume.findByPk(resumeId);

  if (!resume || resume.user_id !== req.user.id)
    return res.status(404).json({ error: "Resume not found or not authorized" });

  const resumeFile = req.files?.resume?.[0];
  const { ai_analysis } = req.body;

  // Option 1: Upload new resume file
  if (resumeFile) {
    // Upload PDF to Cloudinary
    const uploadResult = await uploadPDF(resumeFile.buffer, "user-resumes");

    // Extract text using Python service
    let extractedTexts = {};
    try {
      extractedTexts = await extractTextWithPython({ resume: resumeFile });
    } catch (err) {
      console.warn("Text extraction failed:", err.message);
    }
    const resumeText = extractedTexts.resume || "";

    // AI analysis automatically
    let aiResult = {};
    try {
      const prompt = `
You are analyzing a candidate's CV. Extract only the main sections and ignore any extra informational text. 
Organize the information in JSON format (personalInformation, professionalSummary, education, experience, projects, skills, certifications, extracurricular, languages, raw):

${resumeText}

Return only valid JSON.`;
      const response = await axios.post(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
        contents: [{ parts: [{ text: prompt }] }],
      });

      const geminiText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (geminiText) {
        try {
          aiResult = JSON.parse(geminiText);
        } catch {
          aiResult = { raw: geminiText };
        }
      }
    } catch (err) {
      console.error("Gemini AI analysis failed:", err.message);
      aiResult = { raw: "AI analysis failed" };
    }

    await resume.update({
      resume: uploadResult.secure_url,
      resumePublicId: uploadResult.public_id,
      extracted_text: resumeText,
      ai_analysis: aiResult,
      uploaded_at: new Date(),
    });

    return res.status(200).json({ message: "Resume updated with new file and AI analysis", data: resume });
  }

  // Option 2: Manual AI JSON update without new file
  if (ai_analysis) {
    await resume.update({
      ai_analysis,
      updatedAt: new Date(),
    });

    return res.status(200).json({ message: "AI analysis updated manually", data: resume });
  }

  // If neither file nor AI JSON provided
  res.status(400).json({ error: "Please provide a resume file or AI analysis JSON to update" });
});

// ===================== GET ALL RESUMES =====================

export const getUserResumes = asyncHandler(async (req, res) => {
  const resumes = await UserResume.findAll({
    where: { user_id: req.user.id },
    order: [["uploaded_at", "DESC"]],
  });
  res.status(200).json({ data: resumes });
});

// ===================== GET SINGLE RESUME URL =====================
export const getUserResumeUrl = asyncHandler(async (req, res) => {
  const resume = await UserResume.findByPk(req.params.id);
  if (!resume || resume.user_id !== req.user.id)
    return res.status(404).json({ error: "Resume not found" });

  try {
    const url = cloudinary.url(resume.resumePublicId, { resource_type: "raw" });
    res.json({ url });
  } catch (err) {
    console.error("Failed to get resume URL:", err.message);
    res.status(500).json({ error: "Failed to load resume" });
  }
});

// ===================== DELETE RESUME =====================
export const deleteUserResume = asyncHandler(async (req, res) => {
  const resume = await UserResume.findByPk(req.params.id);
  if (!resume || resume.user_id !== req.user.id)
    return res.status(404).json({ error: "Resume not found" });

  await resume.destroy();
  res.status(200).json({ message: "Resume deleted successfully" });
});
