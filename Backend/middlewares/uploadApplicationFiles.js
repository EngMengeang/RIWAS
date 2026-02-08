import multer from "multer";
// use memory storage so we can send the pdf buffer to germiniAPI 
const upload = multer({ storage: multer.memoryStorage() });

export default upload;