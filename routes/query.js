const express = require("express");
const { queryChunks } = require("../services/vectorStore");
const { askLLM } = require("../services/llmService");

const router = express.Router();
function detectSection(question) {
    const q = question.toLowerCase();
    if (q.includes("skill") || q.includes("tools") || q.includes("technology")) return "skills";
    if (q.includes("experience") || q.includes("intern")) return "experience";
    if (q.includes("project")) return "projects";
    if (q.includes("education") || q.includes("degree")) return "education";
    if (q.includes("contact") || q.includes("email") || q.includes("phone")) return "contact";
    return null;
}

router.post("/", async (req, res) => {
    try {
        const { question } = req.body;
        const section = detectSection(question);
        console.log("Detected section:", section); // ← debug log

        const results = await queryChunks(question, 5, section);
        const chunks = results.documents[0];

        console.log("Chunks sent to LLM:\n", chunks.map((c, i) => `[${i+1}] ${c}`).join("\n\n"));

        const answer = await askLLM(chunks, question);

        res.json({
            success: true,
            question,
            answer,
            chunksUsed: chunks.length
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});
module.exports = router;