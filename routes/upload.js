const express = require("express");
const multer = require("multer");
const { parsePDF } = require("../services/pdfParser");
const { chunkWithLLM }= require("../utils/chunkText");
const getEmbedding = require("../services/embeddingService");
const { saveChunks } = require("../services/vectorStore");
const resumeId = require("crypto").randomUUID();

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("resume"), async (req, res) => {
    try {
         const resumeId = require("crypto").randomUUID();
        // Step 1 — parse PDF to raw text
        const rawText = await parsePDF(req.file.path);

        // Step 2 — Gemini chunks and structures it
        const structuredData = await chunkWithLLM(rawText);

        // Step 3 — structured JSON → embeddings → ChromaDB ← was missing
        const result = await saveChunks(structuredData, resumeId);

        res.json({
            success: true,
            resumeId,
            chunksStored: result.saved,
            data: structuredData
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


module.exports = router;