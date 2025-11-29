const fs = require("fs");

// Groq API URL (OpenAI compatible)
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

async function extractJobDetails(text) {
    // Check for GROQ_API_KEY first, then fallback to HUGGINGFACE_API_KEY if user just swapped the value
    const apiKey = process.env.GROQ_API_KEY || process.env.HUGGINGFACE_API_KEY;

    if (!apiKey) {
        console.error("API Key is missing (GROQ_API_KEY or HUGGINGFACE_API_KEY).");
        return getMockData(text);
    }

    console.log("API Key loaded:", apiKey.substring(0, 5) + "...");

    // Construct the prompt
    const systemPrompt = `You are a helpful assistant that extracts job details from text.
Return ONLY a JSON object with the following keys:
- company (string)
- jobTitle (string)
- jobPostingId (string, or null if not found)
- location (string)
- status (string, default to "Applied")
- descriptionSummary (string, max 200 chars)
- companyDescription (string, max 300 chars)
- responsibilities (string, bullet points or paragraph)
- requiredQualifications (string, bullet points or paragraph)
- preferredQualifications (string, bullet points or paragraph, or null if not found)

Do not include any markdown formatting or explanation. Just the JSON.`;

    const userPrompt = `Extract details from this job posting:\n${text.substring(0, 4000)}`;

    try {
        const response = await fetch(GROQ_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant", // Updated to newer model
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                temperature: 0.1,
                response_format: { type: "json_object" } // Groq supports JSON mode
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Groq API Error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const result = await response.json();
        const generatedContent = result.choices[0]?.message?.content;

        if (!generatedContent) {
            throw new Error("No output from AI");
        }

        return JSON.parse(generatedContent);

    } catch (error) {
        console.error("AI Extraction Error:", error.message);

        // Log error to file
        try {
            fs.writeFileSync("ai_service_error.log", error.message);
        } catch (e) { }

        // Fallback to mock data on error
        return getMockData(text);
    }
}

async function calculateMatchScore(resumeText, jobDetails) {
    const apiKey = process.env.GROQ_API_KEY || process.env.HUGGINGFACE_API_KEY;

    if (!apiKey) {
        console.error("API Key is missing.");
        return { score: 0, reasoning: "API Key missing. Cannot analyze." };
    }

    const systemPrompt = `You are an expert HR recruiter. Compare the candidate's resume with the job description.
Return ONLY a JSON object with:
- score (number, 0-100)
- reasoning (string, max 300 chars, explaining the score)

Be strict but fair. High scores (80+) require strong matching of skills and experience.`;

    const userPrompt = `
JOB DETAILS:
Title: ${jobDetails.jobTitle}
Company: ${jobDetails.company}
Description: ${jobDetails.companyDescription}
Responsibilities: ${jobDetails.responsibilities}
Qualifications: ${jobDetails.requiredQualifications}

RESUME CONTENT:
${resumeText.substring(0, 4000)}
`;

    try {
        const response = await fetch(GROQ_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                temperature: 0.1,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            throw new Error(`Groq API Error: ${response.status}`);
        }

        const result = await response.json();
        const content = result.choices[0]?.message?.content;
        return JSON.parse(content);

    } catch (error) {
        console.error("AI Match Error:", error);
        return { score: 0, reasoning: "AI analysis failed." };
    }
}

function getMockData(text) {
    // Simple heuristic to make mock data look slightly real
    const companyMatch = text.match(/(?:at|for) ([A-Z][a-z]+(?: [A-Z][a-z]+)*)/);
    const titleMatch = text.match(/(?:looking for a|hiring a) ([A-Z][a-z]+(?: [A-Z][a-z]+)*)/i);

    return {
        company: companyMatch ? companyMatch[1] : "Example Corp (Mock)",
        jobTitle: titleMatch ? titleMatch[1] : "Software Engineer (Mock)",
        jobPostingId: "MOCK-GROQ-FAIL",
        location: "Remote (Mock)",
        status: "Applied",
        descriptionSummary: "Groq extraction failed. Using mock data.",
        companyDescription: "Mock company description.",
        responsibilities: "- Mock responsibility 1\n- Mock responsibility 2",
        requiredQualifications: "- Mock qualification 1",
        preferredQualifications: "- Mock preferred qualification 1"
    };
}

module.exports = {
    extractJobDetails,
    calculateMatchScore
};
