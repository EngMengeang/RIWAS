import React from "react";

const CvInput = ({ onChange }) => {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
      <input
        type="file"
        id="cv"
        className="hidden"
        onChange={onChange}
      />

      <label
        htmlFor="cv"
        className="cursor-pointer text-blue-600 font-medium hover:underline"
      >
        Upload your CV
      </label>

      <p className="text-xs text-gray-500 mt-2">
        PDF only, max 5MB
      </p>
    </div>
  );
};

export default CvInput;
