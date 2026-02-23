import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import CVinput from "../../components/CVinput";

const UploadCV = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      if (file.type !== "application/pdf") {
        alert("Please upload a PDF file only");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleContinue = async () => {
    if (!selectedFile) {
      alert("Please select a CV file");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("cv", selectedFile);

      // TODO: Replace with your actual API endpoint
      const response = await fetch("/api/upload-cv", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload CV");
      }

      alert("CV uploaded successfully!");
      navigate("/view-jobs"); // Redirect to view jobs after upload
    } catch (err) {
      alert(err.message || "Failed to upload CV");
    } finally {
      setUploading(false);
    }
  };

  const handleBack = () => {
    navigate("/login");
  };

  return (
    <div className="w-full min-h-screen flex">
      {/* Left Section */}
      <div className="flex-1 flex flex-col m-2">
        <div className="p-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 border border-gray-300 bg-white rounded-full px-6 py-3 text-base font-sans hover:bg-gray-100 hover:-translate-x-0.5 transition-all"
          >
            ← Back
          </button>
        </div>
        <div className="flex-1 flex justify-center items-center h-full">
          <img
            src="./biglogo.png"
            alt="Logo"
            className="max-w-[80%] object-contain"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex-1 flex flex-col items-center border-l border-gray-200 shadow-lg px-8 py-8">
        <p className="mt-12 mb-12 font-semibold text-2xl">Input Your Resume</p>

        <div className="flex-1 w-full max-w-[450px] flex flex-col justify-center">
          {/* File Input Component */}
          <div className="mb-8">
            <CVinput onChange={handleFileChange} />
            {selectedFile && (
              <p className="text-sm text-green-600 mt-3 text-center">
                ✓ {selectedFile.name}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-4 justify-center mt-auto">
            <button
              onClick={handleBack}
              className="px-8 py-3 bg-white border border-gray-300 text-gray-800 rounded-lg font-semibold text-base hover:bg-gray-100 hover:-translate-y-0.5 hover:shadow-[0_4px_8px_rgba(0,0,0,0.1)] transition-all"
            >
              Back
            </button>
            <button
              onClick={handleContinue}
              disabled={uploading || !selectedFile}
              className="px-8 py-3 bg-green-500 text-white rounded-lg font-semibold text-base hover:bg-green-600 hover:-translate-y-0.5 hover:shadow-[0_4px_8px_rgba(66,133,244,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? "Uploading..." : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadCV;
