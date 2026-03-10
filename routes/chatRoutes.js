const express = require("express");
const router = express.Router();
const { sendMessage, getMessages } = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");
const { uploadChatImage } = require("../config/cloudinary");

router.post("/send", protect, (req, res, next) => {
  uploadChatImage.single("image")(req, res, (err) => {
    if (err) return res.status(400).json({ message: "Image upload failed: " + err.message });
    next();
  });
}, sendMessage);

router.get("/:buildingId", protect, getMessages);

module.exports = router;