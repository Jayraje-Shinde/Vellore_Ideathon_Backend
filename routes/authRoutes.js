const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { uploadCertificate } = require("../config/cloudinary");

// POST /auth/register  (with optional certification file for consultants)
router.post("/register", (req, res, next) => {
  uploadCertificate.single("certification_file")(req, res, (err) => {
    if (err) {
      console.error("Upload error:", err)
      return res.status(400).json({ message: "File upload failed: " + err.message })
    }
    next()
  })
}, register)

// POST /auth/login
router.post("/login", login);

// GET /auth/me
router.get("/me", protect, getMe);

module.exports = router;
