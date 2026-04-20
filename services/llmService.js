const askLLM = async (context, question) => {
    const q = question.toLowerCase();

    if (
    q.includes("skills") ||
    q.includes("interest") ||
    q.includes("technology") ||
    q.includes("tech") ||
    q.includes("tools")
) {
        return extractSection(context, {
            start: ["skills", "proficient", "proficiency", "tools", "libraries","intrests"],
            stop: ["project", "experience", "education"]
        }, "Skills");
    }

    if (q.includes("project")) {
        return extractSection(context, {
            start: ["project"],
            stop: ["experience", "education", "skills"]
        }, "Projects");
    }

    if (q.includes("experience") || q.includes("intern") || q.includes("internship")) {
        return extractSection(context, {
            start: ["experience", "intern"],
            stop: ["project", "education", "skills"]
        }, "Experience");
    }

    return `Relevant Information:\n\n${context}`;
};


// 🔥 smarter section extractor
const extractSection = (text, { start, stop }, title) => {
    const lines = text.split("\n");

    let capture = false;
    let result = [];

    for (let line of lines) {
        const lower = line.toLowerCase().trim();

        // ✅ STRICT START CONDITION (only headers)
        if (!capture && isSectionHeader(lower, start)) {
            capture = true;
            continue; // skip header line itself
        }

        // ✅ STOP only AFTER capture has started
        if (capture && isSectionHeader(lower, stop)) {
            break;
        }

        if (capture && isValidLine(lower)) {
            result.push(cleanLine(line));
        }
    }

    return formatList(title, result);
};
const isSectionHeader = (line, keywords) => {
    return keywords.some(k => {
        // ✅ match full section titles, not random words
        return (
            line === k ||
            line.includes(`${k} &`) ||
            line.includes(`${k}:`) ||
            line.startsWith(k + " ")
        );
    });
};


// 🔍 filter out junk lines
const isValidLine = (line) => {
    if (!line) return false;

    // remove garbage lines
    if (line.length < 3) return false;
    if (/^[^a-zA-Z0-9]+$/.test(line)) return false;

    return true;
};


// ✨ clean formatting
const cleanLine = (line) => {
    return line.replace(/•/g, "").trim();
};


// helper function
const formatList = (title, items) => {
    const unique = [...new Set(items)];

    if (!unique.length) return `${title}: Not found`;

    return `${title}:\n` + unique.map(i => `- ${i}`).join("\n");
};

module.exports = askLLM;