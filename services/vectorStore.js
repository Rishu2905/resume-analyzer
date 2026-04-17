const fs = require("fs");

const saveChunks = (data) => {
    fs.writeFileSync("./data/resumeChunks.json", JSON.stringify(data));
};

const loadChunks = () => {
    return JSON.parse(fs.readFileSync("./data/resumeChunks.json"));
};

module.exports = { saveChunks, loadChunks };