import multer from "multer";

// Shared uploader (memory storage for AI / Python services)
const upload = multer({
  storage: multer.memoryStorage(),
});

export default upload;
