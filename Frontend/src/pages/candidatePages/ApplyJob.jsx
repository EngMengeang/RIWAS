import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobsData } from '../../data/jobsData';

const ApplyJob = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [selectedCV, setSelectedCV] = useState('');
  const [cvFile, setCvFile] = useState(null);

  // Find the specific job
  const job = jobsData.find((j) => j.id === parseInt(jobId));

  if (!job) {
    return (
      <div className="min-h-screen  justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h2>
          <button
            onClick={() => navigate('/view-jobs')}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  const handleCVUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCvFile(file);
    }
  };

  const handleSubmit = () => {
    // Store application in localStorage or state management
    const application = {
      jobId: job.id,
      jobTitle: job.title,
      appliedDate: new Date().toLocaleDateString('en-GB'),
      status: 'Application',
      cv: selectedCV || cvFile?.name
    };

    // Get existing applications
    const existingApplications = JSON.parse(localStorage.getItem('applications') || '[]');
    
    // Check if already applied
    const alreadyApplied = existingApplications.some(app => app.jobId === job.id);
    
    if (alreadyApplied) {
      alert('You have already applied for this position!');
      navigate('/application');
      return;
    }

    // Add new application
    existingApplications.push(application);
    localStorage.setItem('applications', JSON.stringify(existingApplications));

    // Navigate to application page
    navigate('/application');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
       
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Title */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">Apply for {job.title}</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Left Side - Job Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{job.title}</h3>
                <p className="text-gray-600 mb-4">
                  <span className="font-medium">Department:</span> {job.department}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{job.jobType}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{job.location}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Salary Range</label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{job.salaryRange}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Application Deadline</label>
                    <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{job.deadline}</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Posted Date</label>
                    <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{job.postedDate}</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Job Description</h4>
                <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-700 text-sm">
                  {job.description}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Requirements</h4>
                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                    {job.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Responsibilities</h4>
                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                    {job.responsibilities.slice(0, 3).map((resp, index) => (
                      <li key={index}>{resp}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Right Side - Resume Selection */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Select Your Resume</h3>

                <div className="space-y-4">
                  {/* Select from existing CV */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Select Your CV</label>
                    <div className="relative">
                      <select
                        value={selectedCV}
                        onChange={(e) => {
                          setSelectedCV(e.target.value);
                          setCvFile(null);
                        }}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none cursor-pointer text-gray-700"
                      >
                        <option value="">Select Your CV</option>
                        <option value="Eng_Mengeang_Resume.pdf">Eng_Mengeang_Resume.pdf</option>
                        <option value="John_Doe_CV.pdf">John_Doe_CV.pdf</option>
                        <option value="Jane_Smith_Resume.pdf">Jane_Smith_Resume.pdf</option>
                      </select>
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setSelectedCV('');
                        setCvFile(null);
                      }}
                      className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Back
                    </button>
                    <label className="flex-1 cursor-pointer">
                      <input
                        type="file"
                        onChange={handleCVUpload}
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                      />
                      <div className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-center font-medium">
                        {cvFile ? cvFile.name.substring(0, 15) + '...' : 'Apply'}
                      </div>
                    </label>
                  </div>

                  {/* File Upload Info */}
                  {cvFile && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800 font-medium">File Selected:</p>
                      <p className="text-sm text-green-700 mt-1">{cvFile.name}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  {(selectedCV || cvFile) && (
                    <button
                      onClick={handleSubmit}
                      className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-bold text-lg shadow-lg"
                    >
                      Submit Application
                    </button>
                  )}
                </div>
              </div>

              {/* Additional Info Card */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-xl">💡</span>
                  Application Tips
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Ensure your CV is up to date</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Highlight relevant skills and experience</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Double-check all information before submitting</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyJob;
