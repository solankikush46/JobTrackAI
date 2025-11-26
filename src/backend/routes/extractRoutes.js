const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { extractJobDetails } = require("../services/aiService");

const router = express.Router();

router.use(authMiddleware);

// POST /api/extract - Extract job details from text
router.post("/", async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ message: "Text is required" });
        }

        const extractedData = await extractJobDetails(text);
        res.json(extractedData);
    } catch (err) {
        console.error("Extraction error:", err);
        res.status(500).json({ message: "Failed to extract data" });
    }
});

module.exports = router;
