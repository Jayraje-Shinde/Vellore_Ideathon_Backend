const express = require("express");
const router = express.Router();
const { sendMessage, getMessages } = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");
const { uploadChatImage } = require("../config/cloudinary");

// POST /chat/send    → Send message (with optional image)
router.post("/send", protect, uploadChatImage.single("image"), sendMessage);

// GET  /chat/:buildingId  → Get all messages for a building
router.get("/:buildingId", protect, getMessages);

module.exports = router;
