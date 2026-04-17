const express = require("express");
const multer = require("multer");
const parsePDF = require("../services/pdfParser");
const chunkText = require("../utils/chunkText");
const getEmbedding = require("../services/embeddingService");
const { saveChunks } = require("../services/vectorStore");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("resume"), async (req, res) => {
    const text = await parsePDF(req.file.path);
    const chunks = chunkText(text);

    const embeddedChunks = [];

    for (let chunk of chunks) {
        const embedding = await getEmbedding(chunk);
        embeddedChunks.push({ chunk, embedding });
    }

    saveChunks(embeddedChunks);

    res.json({ message: "Resume processed successfully" });
});

module.exports = router;