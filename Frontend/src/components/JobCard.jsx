import React from "react";

export default function JobCard({ job }) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden w-60">
      {/* Image */}
      <div className="h-30 w-full">
        <img
          src={job.image}
          alt={job.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <h2 className="text-sm font-bold">{job.title}</h2>
        <p className="text-sm text-gray-700">
          Applicants: {job.applicants}
        </p>
        <p className="text-sm text-gray-500">
          Posted date: {job.postedDate}
        </p>

        {/* Buttons */}
        <div className="flex space-x-2 mt-4">
          <button className="flex-1 border border-gray-400 rounded-full py-2 hover:bg-gray-100">
            View
          </button>
          <button className="flex-1 bg-green-400 text-white rounded-full py-2 hover:bg-green-500">
            Edit
          </button>
          <button className="flex-1 bg-red-500 text-white rounded-full py-2 hover:bg-red-600">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
