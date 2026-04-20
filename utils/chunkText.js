const Groq = require("groq-sdk");

async function chunkWithLLM(rawText) {
    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const response = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{
            role: "user",
            content: `Extract structured JSON from this resume.
            Return ONLY valid JSON, no markdown, no backticks.

            JSON structure to follow:
            {
                "contact": { "name": "", "email": "", "phone": "", "location": "" },
                "summary": "",
                "experience": [{ "company": "", "role": "", "duration": "", "bullets": [], "technologies": [] }],
                "projects": [{ "name": "", "bullets": [], "technologies": [] }],
                "skills": { "proficient": [], "tools_and_libraries": [] },
                "education": [{ "degree": "", "institution": "", "year": "" }]
            }

            Resume:
            ${rawText}`
        }]
    });

    return safeParseJSON(response.choices[0].message.content);
}

function safeParseJSON(text) {
    const cleaned = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
    return JSON.parse(cleaned);
}

module.exports = { chunkWithLLM };