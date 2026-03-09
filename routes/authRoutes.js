const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { uploadCertificate } = require("../config/cloudinary");

// POST /auth/register  (with optional certification file for consultants)
router.post("/register", uploadCertificate.single("certification_file"), register);

// POST /auth/login
router.post("/login", login);

// GET /auth/me
router.get("/me", protect, getMe);

module.exports = router;
