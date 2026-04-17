const express = require("express");
const getEmbedding = require("../services/embeddingService");
const { loadChunks } = require("../services/vectorStore");
const askLLM = require("../services/llmService");

const router = express.Router();

const similarity = (queryVec, chunkVec) => {
    let score = 0;

    for (let word in queryVec) {
        if (chunkVec[word]) {
            score += queryVec[word] * chunkVec[word];
        }
    }

    return score;
};

router.post("/", async (req, res) => {
    const { question } = req.body;

    const questionEmbedding = await getEmbedding(question);
    const chunks = loadChunks();

    const scored = chunks.map(c => ({
        ...c,
        score: similarity(questionEmbedding, c.embedding)
    }));

    const topChunks = scored
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(c => c.chunk)
        .join("\n");

    const answer = await askLLM(topChunks, question);

    res.json({ answer });
});

module.exports = router;