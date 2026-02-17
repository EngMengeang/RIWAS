import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaFileAlt, FaBriefcase, FaBell, FaSignOutAlt } from 'react-icons/fa';
import { jobsData } from '../../data/jobsData';

const ViewJobs = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('view-jobs');

  const handleJobView = (jobId) => {
    navigate(`/job-details/${jobId}`);
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">View Jobs</h1>

          {/* Jobs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {jobsData.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden"
              >
                {/* Card Image/Illustration */}
                <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-6 flex items-center justify-center h-57">
                  <div className="relative">
                    <div className="w-24 h-24 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center">
                      <FaBriefcase className="text-4xl text-blue-600" />
                    </div>
                    
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{job.title}</h3>
                  <div className="space-y-1 mb-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Department:</span> {job.department}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Posted date:</span> {job.postedDate}
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleJobView(job.id)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                      View
                    </button>
                    <button
                      onClick={() => navigate(`/apply-job/${job.id}`)}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
  );
};

export default ViewJobs;
