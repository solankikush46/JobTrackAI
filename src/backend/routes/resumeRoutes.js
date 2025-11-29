const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const authMiddleware = require('../middleware/authMiddleware');
const resumeModel = require('../models/resumeModel');
const applicationModel = require('../models/applicationModel');
const { calculateMatchScore } = require('../services/aiService');

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads/resumes');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed!'), false);
        }
    }
});

// Upload Resume
router.post('/', authMiddleware, upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const resume = await resumeModel.createResume(req.user.id, req.file.filename, req.file.originalname);
        res.status(201).json(resume);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get All Resumes
router.get('/', authMiddleware, async (req, res) => {
    try {
        const resumes = await resumeModel.getResumesByUserId(req.user.id);
        res.json(resumes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Set Primary Resume
router.put('/:id/primary', authMiddleware, async (req, res) => {
    try {
        await resumeModel.setPrimaryResume(req.user.id, req.params.id);
        res.json({ message: 'Primary resume updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete Resume
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const resume = await resumeModel.getResumeById(req.user.id, req.params.id);
        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        // Delete file from filesystem
        const filePath = path.join(__dirname, '../uploads/resumes', resume.file_name);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await resumeModel.deleteResume(req.user.id, req.params.id);
        res.json({ message: 'Resume deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Download/View Resume
router.get('/:id/download', authMiddleware, async (req, res) => {
    try {
        const resume = await resumeModel.getResumeById(req.user.id, req.params.id);
        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }
        const filePath = path.join(__dirname, '../uploads/resumes', resume.file_name);
        res.download(filePath, resume.original_name);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Match Resume with Job Details
router.post('/:id/match', authMiddleware, async (req, res) => {
    try {
        const { jobDetails } = req.body;
        if (!jobDetails) {
            return res.status(400).json({ message: 'Job details are required' });
        }

        const resume = await resumeModel.getResumeById(req.user.id, req.params.id);
        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        const filePath = path.join(__dirname, '../uploads/resumes', resume.file_name);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'Resume file not found' });
        }

        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(dataBuffer);
        const resumeText = pdfData.text;

        const matchResult = await calculateMatchScore(resumeText, jobDetails);

        // If applicationId is provided, update the application with the score
        if (req.body.applicationId) {
            const appId = req.body.applicationId;
            const existingApp = await applicationModel.getApplicationById(req.user.id, appId);
            if (existingApp) {
                await applicationModel.updateApplication(appId, req.user.id, {
                    ...existingApp,
                    jobTitle: existingApp.job_title, // Map DB fields to model expected fields
                    companyDescription: existingApp.company_description,
                    requiredQualifications: existingApp.required_qualifications,
                    preferredQualifications: existingApp.preferred_qualifications,
                    appliedDate: existingApp.applied_date,
                    jobLink: existingApp.job_link,
                    resumeMatchScore: matchResult.score
                });
            }
        }

        res.json(matchResult);

    } catch (err) {
        console.error("Match error:", err);
        res.status(500).json({ message: 'Server error during analysis' });
    }
});

module.exports = router;
