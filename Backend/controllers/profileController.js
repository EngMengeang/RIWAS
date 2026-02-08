import { Profile } from "../models/Profile.js";
import { User } from "../models/User.js";
import { Candidate } from "../models/Candidate.js";
import { Recruiter } from "../models/Recruiter.js";
import { asyncHandler } from "../middlewares/errorHandler.js";

//Create Profile
export const createProfile = asyncHandler(async (req, res) => {
  // Check if profile already exists
  const existingProfile = await Profile.findOne({
    where: { user_id: req.user.id },
  });

  if (existingProfile) {
    return res.status(409).json({ error: "Profile already exists" });
  }

  // Create base profile
  const profile = await Profile.create({
    user_id: req.user.id,
    role: req.user.role,
    bio: req.body.bio || null,
    avatarUrl: req.file ? req.file.path : null,
    headline: req.body.headline || null,
    about: req.body.about || null,
    experience: req.body.experience || 0,
    websiteUrl: req.body.websiteUrl || null,
    github: req.body.github || null,
    linkedin: req.body.linkedin || null,
    twitter: req.body.twitter || null,
  });

  // Create candidate info (if role is candidate)
  if (req.user.role === "candidate") {
    await Candidate.create({
      user_id: req.user.id,      
      profile_id: profile.id,
      resumeUrl: req.body.candidateInfo?.resumeUrl || null,
      education: req.body.candidateInfo?.education || null,
      experience: req.body.candidateInfo?.experience || 0,
      summary: req.body.candidateInfo?.summary || null,
    });
  }

  // Create recruiter info (if role is recruiter)
  if (req.user.role === "recruiter") {
    await Recruiter.create({
      user_id: req.user.id,       
      profile_id: profile.id,
      department: req.body.recruiterInfo?.department || null,
      positionTitle: req.body.recruiterInfo?.position_title || null,
      workEmail: req.body.recruiterInfo?.work_email || null,
      phoneExtension: req.body.recruiterInfo?.phone_extension || null,
      notes: req.body.recruiterInfo?.notes || null,
    });
  }

  // Load full profile with relations
  const fullProfile = await Profile.findOne({
    where: { id: profile.id },
    include: [
      { model: Candidate, as: "candidateInfo" },
      { model: Recruiter, as: "recruiterInfo" },
    ],
  });

  res.status(201).json({
    message: "Profile created successfully",
    data: fullProfile,
  });
});

// Get Profile by User ID 
export const getProfile = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({
    where: { user_id: req.params.userId },
    include: [
      { model: User, as: "user", attributes: { exclude: ["password"] } },
      { model: Candidate, as: "candidateInfo" },
      { model: Recruiter, as: "recruiterInfo" },
    ],
  });

  if (!profile) {
    return res.status(404).json({ error: "Profile not found" });
  }

  res.status(200).json({ data: profile });
});

// Update Profile
export const updateProfile = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({
    where: { user_id: req.user.id },
  });

  if (!profile) {
    return res.status(404).json({ error: "Profile not found" });
  }

  // Only allow profile fields to be updated
  const allowedProfileFields = [
    "bio",
    "headline",
    "about",
    "experience",
    "websiteUrl",
    "github",
    "linkedin",
    "twitter",
  ];

  const profileUpdates = Object.fromEntries(
    Object.entries(req.body).filter(([key]) =>
      allowedProfileFields.includes(key)
    )
  );

  if (req.file) {
    profileUpdates.avatarUrl = req.file.path;
  }

  await profile.update(profileUpdates);

  // Update candidate info
  if (req.user.role === "candidate" && req.body.candidateInfo) {
    const candidate = await Candidate.findOne({ where: { profile_id: profile.id } });
    if (candidate) {
      await candidate.update({
        resumeUrl: req.body.candidateInfo?.resumeUrl || candidate.resumeUrl,
        education: req.body.candidateInfo?.education || candidate.education,
        experience: req.body.candidateInfo?.experience ?? candidate.experience,
        summary: req.body.candidateInfo?.summary || candidate.summary,
      });
    } else {
      // If candidate record doesn't exist yet, create it
      await Candidate.create({
        user_id: req.user.id,
        profile_id: profile.id,
        resumeUrl: req.body.candidateInfo?.resumeUrl || null,
        education: req.body.candidateInfo?.education || null,
        experience: req.body.candidateInfo?.experience || 0,
        summary: req.body.candidateInfo?.summary || null,
      });
    }
  }

  // Update recruiter info
  if (req.user.role === "recruiter" && req.body.recruiterInfo) {
    const recruiter = await Recruiter.findOne({ where: { profile_id: profile.id } });
    if (recruiter) {
      await recruiter.update({
        department: req.body.recruiterInfo?.department || recruiter.department,
        positionTitle: req.body.recruiterInfo?.position_title || recruiter.positionTitle,
        workEmail: req.body.recruiterInfo?.work_email || recruiter.workEmail,
        phoneExtension: req.body.recruiterInfo?.phone_extension || recruiter.phoneExtension,
        notes: req.body.recruiterInfo?.notes || recruiter.notes,
      });
    } else {
      await Recruiter.create({
        user_id: req.user.id,
        profile_id: profile.id,
        department: req.body.recruiterInfo?.department || null,
        positionTitle: req.body.recruiterInfo?.position_title || null,
        workEmail: req.body.recruiterInfo?.work_email || null,
        phoneExtension: req.body.recruiterInfo?.phone_extension || null,
        notes: req.body.recruiterInfo?.notes || null,
      });
    }
  }

  // Reload full profile
  const updatedProfile = await Profile.findOne({
    where: { id: profile.id },
    include: [
      { model: Candidate, as: "candidateInfo" },
      { model: Recruiter, as: "recruiterInfo" },
    ],
  });

  res.status(200).json({
    message: "Profile updated successfully",
    data: updatedProfile,
  });
});

// Increment Profile Views 
export const incrementProfileViews = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({
    where: { user_id: req.params.userId },
  });

  if (!profile) {
    return res.status(404).json({ error: "Profile not found" });
  }

  await profile.increment("views");

  res.status(200).json({ message: "Profile view counted" });
});
