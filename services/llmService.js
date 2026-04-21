const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function askLLM(chunks, question) {
    // build context from retrieved chunks
    const context = chunks
        .map((chunk, i) => `[Chunk ${i + 1}] ${chunk}`)
        .join("\n\n");

    const prompt = `
        You are a resume analyzer assistant.
        Answer the user's question using ONLY the resume information provided below.
        If the answer is not in the context, say "I could not find this information in the resume."
        
        Resume Context:
        ${context}
        
        User Question: ${question}
        
        Answer:
    `;

    const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3  // lower = more factual, less creative
    });

    return response.choices[0].message.content;
}

module.exports = { askLLM };