const pdfParse = require("pdf-parse");
const fs = require("fs");

async function parsePDF(filePath) {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text; // raw text, passed to chunkText.js
}

module.exports = { parsePDF };