const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  createApplication,
  getApplicationsForUser,
  getApplicationById,
  updateApplication,
  deleteApplication,
} = require("../models/applicationModel");

const router = express.Router();

router.use(authMiddleware);

// GET to list all the aplications for a logged in USER.
router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const apps = await getApplicationsForUser(userId);
    res.json(apps);
  } catch (err) {
    console.error("Get applications error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET to list a single application by id (if it belongs to user)
router.get("/:id", async (req, res) => {
  try {
    const userId = req.user.id;
    const appId = req.params.id;

    const app = await getApplicationById(userId, appId);
    if (!app) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json(app);
  } catch (err) {
    console.error("Get application by id error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST to create a new application
router.post("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      company,
      jobTitle,
      location,
      status,
      source,
      appliedDate,
      jobLink,
      notes,
    } = req.body;

    if (!company || !jobTitle) {
      return res
        .status(400)
        .json({ message: "Company and jobTitle are required" });
    }

    const app = await createApplication(userId, {
      company,
      jobTitle,
      location,
      status,
      source,
      appliedDate,
      jobLink,
      notes,
    });

    res.status(201).json(app);
  } catch (err) {
    console.error("Create application error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT for updating an existing application
router.put("/:id", async (req, res) => {
  try {
    const userId = req.user.id;
    const appId = req.params.id;
    const {
      company,
      jobTitle,
      location,
      status,
      source,
      appliedDate,
      jobLink,
      notes,
    } = req.body;

    if (!company || !jobTitle) {
      return res
        .status(400)
        .json({ message: "Company and jobTitle are required" });
    }

    const existing = await getApplicationById(userId, appId);
    if (!existing) {
      return res.status(404).json({ message: "Application not found" });
    }

    const updated = await updateApplication(userId, appId, {
      company,
      jobTitle,
      location,
      status,
      source,
      appliedDate,
      jobLink,
      notes,
    });

    res.json(updated);
  } catch (err) {
    console.error("Update application error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE for Deleting an application
router.delete("/:id", async (req, res) => {
  try {
    const userId = req.user.id;
    const appId = req.params.id;

    const deleted = await deleteApplication(userId, appId);
    if (!deleted) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json({ message: "Application deleted" });
  } catch (err) {
    console.error("Delete application error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;