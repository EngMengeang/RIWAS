// testing.js
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse"); // CommonJS import in ESM

import fs from "fs";
import path from "path";

// Path to your PDF file
const pdfPath = path.resolve("./Pov_Yanghai_CV.pdf"); // put your PDF here

try {
  const pdfBuffer = fs.readFileSync(pdfPath);

  pdfParse(pdfBuffer)
    .then(data => {
      console.log("=== PDF Text Extracted ===");
      console.log(data.text); // extracted text
    })
    .catch(err => {
      console.error("Failed to extract PDF text:", err.message);
    });
} catch (err) {
  console.error("Failed to read PDF file:", err.message);
}
