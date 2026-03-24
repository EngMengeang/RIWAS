import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { uploadResume } from "../../server/userResumeAPI";

const UploadCV = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  const validateAndSet = (file) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file only");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }
    setSelectedFile(file);
  };

  const handleFileChange = (e) => validateAndSet(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    validateAndSet(e.dataTransfer.files[0]);
  };

  const handleContinue = async () => {
    if (!selectedFile) { alert("Please select a CV file"); return; }
    setUploading(true);
    try {
      await uploadResume(selectedFile);
      setSelectedFile(null);
      // Navigate to notifications and auto-open the Recommended tab
      // so the candidate immediately sees ML-based job matches from their resume
      navigate("/notifications", { state: { tab: 'recommended' } });
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to upload CV");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">

      {/* Header with logo */}
      <div className="flex justify-center items-center py-5 border-b-2 border-green-500">
        <img src="./biglogo.png" alt="RIWAS Logo" className="h-20 object-contain" />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center pt-16 pb-10 px-4">

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-10">
          Input Your Resume
        </h1>

        {/* Drop zone */}
        <div className="w-full max-w-md mb-3">
          <div
            onClick={() => fileInputRef.current.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`
              w-full border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-2.5 cursor-pointer transition-all duration-200
              ${dragging || selectedFile
                ? "border-green-500 bg-green-50"
                : "border-gray-300 bg-gray-50 hover:border-green-400 hover:bg-green-50"
              }
            `}
          >
            {/* Icon circle */}
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-1 ${selectedFile ? "bg-green-100" : "bg-gray-100"}`}>
              {selectedFile ? (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>

            {selectedFile ? (
              <>
                <p className="m-0 text-base font-semibold text-green-700">{selectedFile.name}</p>
                <p className="m-0 text-xs text-gray-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB · Click to change file
                </p>
              </>
            ) : (
              <>
                <p className="m-0 text-base font-semibold text-gray-700">Click to upload or drag & drop</p>
                <p className="m-0 text-xs text-gray-400">PDF only · Max 5MB</p>
              </>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-6 mt-7 w-full max-w-md">
          <button
            onClick={() => navigate("/login")}
            className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold text-base rounded-lg transition-colors cursor-pointer"
          >
            Back
          </button>
          <button
            onClick={handleContinue}
            disabled={uploading || !selectedFile}
            className={`flex-1 py-3 text-white font-semibold text-base rounded-lg transition-colors
              ${uploading || !selectedFile
                ? "bg-green-300 cursor-not-allowed opacity-60"
                : "bg-green-500 hover:bg-green-600 cursor-pointer"
              }
            `}
          >
            {uploading ? "Uploading..." : "Continue"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default UploadCV;