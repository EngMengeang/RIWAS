import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaBriefcase } from 'react-icons/fa';
import { jobsData } from '../../data/jobsData';

const JobDetails = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  // Find the specific job
  const job = jobsData.find((j) => j.id === parseInt(jobId));

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Job Details</h1>
          <button
            onClick={() => navigate('/view-jobs')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Close
          </button>
        </div>

        {/* Job Details Card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Job Header with Apply Button */}
          <div className="border-b border-gray-200 p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h2>
              <p className="text-gray-600">
                <span className="font-medium">Department:</span> {job.department}
              </p>
            </div>
            <button
              onClick={() => navigate(`/apply-job/${job.id}`)}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
            >
              Apply
            </button>
          </div>

          {/* Job Information Grid */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Posted Date</label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{job.postedDate}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Application Deadline</label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{job.deadline}</div>
              </div>
            </div>

            {/* Job Description */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Job Description</h3>
              <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-700">
                {job.description}
              </div>
            </div>

            {/* Requirements */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Requirements</h3>
              <div className="px-4 py-3 bg-gray-50 rounded-lg">
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {job.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Responsibilities */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Responsibilities</h3>
              <div className="px-4 py-3 bg-gray-50 rounded-lg">
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {job.responsibilities.map((resp, index) => (
                    <li key={index}>{resp}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
