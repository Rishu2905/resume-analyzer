const { ChromaClient } = require("chromadb");
const { getEmbedding } = require("./embeddingService");
const fs = require("fs");
const path = require("path");

const client = new ChromaClient({ path: "http://localhost:8000" });

// dummy function — stops ChromaDB from complaining
const noEmbedding = { generate: async (texts) => texts.map(() => []) };

async function getCollection() {
    return await client.getOrCreateCollection({
        name: "resumes",
        embeddingFunction: noEmbedding
    });
}

async function saveChunks(structuredData, resumeId) {
    const collection = await getCollection();
    const chunks = buildChunks(structuredData, resumeId);

    for (const chunk of chunks) {
        console.log(`Embedding chunk: ${chunk.id}`);
        const embedding = await getEmbedding(chunk.text);
        console.log(`Embedding length: ${embedding.length}`);

        await collection.add({
            ids:        [chunk.id],
            embeddings: [embedding],  // ← raw vectors, bypasses ChromaDB embedding
            documents:  [chunk.text],
            metadatas:  [chunk.metadata]
        });
    }

    // backup to JSON
    const filePath = path.join(__dirname, "../data/resumeChunks.json");
    let existing = [];
    if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, "utf-8").trim();
    existing = content ? JSON.parse(content) : []; // ← handle empty file
}
    existing.push({ resumeId, structuredData, chunks });
    fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));

    return { saved: chunks.length };
}

async function queryChunks(queryText, nResults = 5) {
    const collection = await getCollection();
    const queryEmbedding = await getEmbedding(queryText);

    const results = await collection.query({
        queryEmbeddings: [queryEmbedding],  // ← raw vector
        nResults,
    });

    return results;
}

function buildChunks(data, resumeId) {
    const chunks = [];

    chunks.push({
        id: `${resumeId}_contact`,
        text: `Name: ${data.contact.name}, Email: ${data.contact.email}, Phone: ${data.contact.phone}, Location: ${data.contact.location}`,
        metadata: { resumeId, section: "contact", name: data.contact.name }
    });

    if (data.summary) {
        chunks.push({
            id: `${resumeId}_summary`,
            text: data.summary,
            metadata: { resumeId, section: "summary", name: data.contact.name }
        });
    }

    data.experience.forEach((exp, i) => {
        chunks.push({
            id: `${resumeId}_exp_${i}`,
            text: `${exp.role} at ${exp.company} (${exp.duration}): ${exp.bullets.join(". ")}`,
            metadata: { resumeId, section: "experience", company: exp.company, name: data.contact.name }
        });
    });

    data.projects.forEach((proj, i) => {
        chunks.push({
            id: `${resumeId}_proj_${i}`,
            text: `Project: ${proj.name}. ${proj.bullets.join(". ")} Technologies: ${proj.technologies.join(", ")}`,
            metadata: { resumeId, section: "projects", name: data.contact.name }
        });
    });

    chunks.push({
        id: `${resumeId}_skills`,
        text: `Skills: ${data.skills.proficient.join(", ")}. Tools: ${data.skills.tools_and_libraries.join(", ")}`,
        metadata: { resumeId, section: "skills", name: data.contact.name }
    });

    data.education.forEach((edu, i) => {
        chunks.push({
            id: `${resumeId}_edu_${i}`,
            text: `${edu.degree} from ${edu.institution} (${edu.year})`,
            metadata: { resumeId, section: "education", name: data.contact.name }
        });
    });

    return chunks;
}

module.exports = { saveChunks, queryChunks };