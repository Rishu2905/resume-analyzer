const getEmbedding = async (text) => {
    // simple word frequency vector
    const words = text.toLowerCase().split(/\W+/);
    const freq = {};

    words.forEach(word => {
        if (word) {
            freq[word] = (freq[word] || 0) + 1;
        }
    });

    return freq;
};

module.exports = getEmbedding;