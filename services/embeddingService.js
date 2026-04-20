const { HfInference } = require("@huggingface/inference");

const hf = new HfInference(process.env.HF_API_KEY);

async function getEmbedding(text) {
    try{const response = await hf.featureExtraction({
        model: "sentence-transformers/all-MiniLM-L6-v2",
        inputs: text,
        provider: "hf-inference"  // explicitly set provider
    });

    // handle nested arrays - model sometimes returns [[...]] instead of [...]
    const flat = Array.isArray(response[0]) ? response[0] : response;
    return Array.from(flat);}
    catch(err){console.log("error msg: ",err.message);
        throw err;
    }
}

module.exports = { getEmbedding };