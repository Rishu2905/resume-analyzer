const askLLM = async (context, question) => {
    return `Based on the resume, here is the relevant information:\n\n${context}`;
};

module.exports = askLLM;