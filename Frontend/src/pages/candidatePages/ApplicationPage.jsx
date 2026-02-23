import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaFileAlt, FaBriefcase, FaBell, FaEnvelope } from 'react-icons/fa';

const MyApplication = () => {
  const [activeTab, setActiveTab] = useState('application');
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    // Load applications from localStorage
    const storedApplications = JSON.parse(localStorage.getItem('applications') || '[]');
    setApplications(storedApplications);
  }, []);

  const stages = [
    { name: 'Application', completed: true },
    { name: 'Screening', completed: false },
    { name: 'Interview', completed: false },
    { name: 'Assessment', completed: false },
    { name: 'References', completed: false },
    { name: 'Decision', completed: false },
    { name: 'Job Offer', completed: false }
  ];

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Application</h1>

          {applications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="text-gray-400 mb-4">
                <FaBriefcase className="text-6xl mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Applications Yet</h3>
              <p className="text-gray-600 mb-6">You haven't applied for any jobs yet.</p>
              <Link
                to="/view-jobs"
                className="inline-block px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                Browse Jobs
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {applications.map((application, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  {/* Application Header */}
                  <div className="border-b border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          {application.jobTitle}
                        </h2>
                        <p className="text-gray-600">
                          <span className="font-medium">Stage:</span> {application.status}
                        </p>
                      </div>
                      <button className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
                        <FaEnvelope />
                        View Email
                      </button>
                    </div>
                  </div>

                  {/* Progress Tracker */}
                  <div className="p-8">
                    <div className="relative">
                      {/* Progress Line */}
                      <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200">
                        <div
                          className="h-full bg-purple-500 transition-all duration-500"
                          style={{ width: `${(1 / stages.length) * 100}%` }}
                        />
                      </div>

                      {/* Stages */}
                      <div className="relative flex justify-between">
                        {stages.map((stage, stageIndex) => {
                          const isActive = stageIndex === 0;
                          const isCompleted = stage.completed;
                          const isFuture = !isActive && !isCompleted;

                          return (
                            <div key={stageIndex} className="flex flex-col items-center">
                              {/* Circle */}
                              <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                                  isActive
                                    ? 'bg-purple-500 text-white shadow-lg scale-110'
                                    : isCompleted
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-200 text-gray-400'
                                }`}
                              >
                                {isCompleted ? '✓' : stageIndex === 0 ? '📝' : ''}
                              </div>

                              {/* Label */}
                              <div
                                className={`mt-3 text-center min-w-[80px] ${
                                  isActive
                                    ? 'text-purple-600 font-bold'
                                    : isCompleted
                                    ? 'text-green-600 font-medium'
                                    : 'text-gray-400'
                                }`}
                              >
                                <p className="text-xs leading-tight">{stage.name}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Application Details */}
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                        <p className="text-sm text-blue-700 font-medium mb-1">Applied Date</p>
                        <p className="text-lg font-bold text-blue-900">{application.appliedDate}</p>
                      </div>

                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                        <p className="text-sm text-purple-700 font-medium mb-1">Current Stage</p>
                        <p className="text-lg font-bold text-purple-900">{application.status}</p>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                        <p className="text-sm text-green-700 font-medium mb-1">Resume</p>
                        <p className="text-lg font-bold text-green-900 truncate">
                          {application.cv || 'Resume.pdf'}
                        </p>
                      </div>
                    </div>

                    {/* Action Info */}
                    <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">ℹ️</span>
                        <div>
                          <p className="font-bold text-yellow-900 mb-1">Next Steps</p>
                          <p className="text-sm text-yellow-800">
                            Your application is being reviewed by our recruitment team. We will notify you once 
                            it moves to the screening stage. Please check your email regularly for updates.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
  );
};

export default MyApplication;
