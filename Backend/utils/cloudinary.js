// import { v2 as cloudinary } from "cloudinary";
// import dotenv from "dotenv";

// dotenv.config();

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });
// export { cloudinary };
// export const uploadImage = (fileBuffer, folder = "profiles") => {
//   return new Promise((resolve, reject) => {
//     const stream = cloudinary.uploader.upload_stream(
//       { folder, resource_type: "auto" },
//       (error, result) => {
//         if (error) reject(error);
//         else resolve(result);
//       }
//     );

//     stream.end(fileBuffer);
//   });
// };

// export const deleteImage = async (publicId) => {
//   return cloudinary.uploader.destroy(publicId);
// };


import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };


export const uploadImage = (fileBuffer, folder = "profiles") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image", 
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(fileBuffer);
  });
};


// Upload PDF or other raw file

export const uploadPDF = (fileBuffer, folder = "applications") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "raw", 
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(fileBuffer);
  });
};


// Delete image OR PDF safely

export const deleteImage = async (publicId, type = "image") => {
  try {
    return await cloudinary.uploader.destroy(publicId, {
      resource_type: type === "pdf" ? "raw" : "image",
    });
  } catch (err) {
    console.error("Delete failed:", err);
    throw err;
  }
};
