import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getJobs } from '../../server/jobsAPI';

const ViewJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await getJobs({ page: 1, limit: 20 });
        setJobs(res.data || []);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || 'Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div className="p-8 bg-gray-50 min-h-screen" style={{ fontFamily: "'Roboto', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
      <div className="max-w-7xl mx-auto">

        {/* Page title + green underline */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">View Jobs</h1>
          <div className="mt-2 h-0.5 w-full bg-green-500 rounded" />
        </div>

        {/* State: loading / error / empty */}
        {loading && (
          <p className="text-gray-500 text-sm">Loading jobs...</p>
        )}
        {!loading && error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
        {!loading && !error && jobs.length === 0 && (
          <p className="text-gray-500 text-sm">No jobs available.</p>
        )}

        {/* Jobs grid — 4 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-200 overflow-hidden"
            >
              {/* Illustration area */}
              <div className="relative h-44 bg-gradient-to-br from-blue-100 to-purple-100 overflow-hidden">
                <img
                  src="/postImage.png"
                  alt="Job illustration"
                  className="w-full h-full object-cover"
                  onError={e => { e.target.style.display = "none"; }}
                />
                {/* Frosted label at bottom like the image */}
                <div className="absolute bottom-0 left-0 right-0 px-3 py-1.5 bg-white/60 backdrop-blur-sm text-xs text-gray-500 font-medium">
                  {job.department || job.location || "User interface design"}
                </div>
              </div>

              {/* Card content */}
              <div className="p-4">
                <h3 className="font-bold text-gray-900 text-base mb-2">
                  {job.title}
                </h3>
                <p className="text-sm text-gray-600 mb-0.5">
                  Applicants: {job.applicants ?? '—'}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Posted date: {new Date(job.createdAt || job.postedDate).toLocaleDateString()}
                </p>

                {/* Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/job-details/${job.id}`)}
                    className="flex-1 py-2 text-sm font-semibold border border-gray-300 text-gray-700 rounded-full bg-white hover:bg-gray-50 transition-colors"
                  >
                    View
                  </button>
                  <button
                    onClick={() => navigate(`/apply-job/${job.id}`)}
                    className="flex-1 py-2 text-sm font-semibold bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
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