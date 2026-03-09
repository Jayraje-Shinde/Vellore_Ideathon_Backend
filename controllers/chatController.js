const Message = require("../models/Message");
const Building = require("../models/Building");

// @desc    Send a message
// @route   POST /chat/send
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { building_id, message_text } = req.body;

    if (!building_id) {
      return res.status(400).json({ message: "building_id is required" });
    }

    if (!message_text && !req.file) {
      return res.status(400).json({ message: "Message text or image is required" });
    }

    // Verify user is part of this building's consultation
    const building = await Building.findById(building_id);
    if (!building) {
      return res.status(404).json({ message: "Building not found" });
    }

    const isBuilder = building.builder_id.toString() === req.user._id.toString();
    const isConsultant =
      building.consultant_id &&
      building.consultant_id.toString() === req.user._id.toString();

    if (!isBuilder && !isConsultant) {
      return res.status(403).json({ message: "Not authorized to chat in this room" });
    }

    // Determine message type
    let messageType = "text";
    if (req.file && message_text) messageType = "mixed";
    else if (req.file) messageType = "image";

    const messageData = {
      building_id,
      sender_id: req.user._id,
      message_text: message_text || "",
      message_type: messageType,
    };

    if (req.file) {
      messageData.image_url = req.file.path;
      messageData.image_public_id = req.file.filename;
    }

    const message = await Message.create(messageData);
    await message.populate("sender_id", "name role");

    res.status(201).json({ message: "Message sent", data: message });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ message: "Server error sending message" });
  }
};

// @desc    Get all messages for a building chat room
// @route   GET /chat/:buildingId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { buildingId } = req.params;

    // Verify access
    const building = await Building.findById(buildingId);
    if (!building) {
      return res.status(404).json({ message: "Building not found" });
    }

    const isBuilder = building.builder_id.toString() === req.user._id.toString();
    const isConsultant =
      building.consultant_id &&
      building.consultant_id.toString() === req.user._id.toString();

    if (!isBuilder && !isConsultant) {
      return res.status(403).json({ message: "Not authorized to view this chat" });
    }

    const messages = await Message.find({ building_id: buildingId })
      .populate("sender_id", "name role")
      .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      { building_id: buildingId, sender_id: { $ne: req.user._id }, is_read: false },
      { is_read: true }
    );

    res.status(200).json({ count: messages.length, messages });
  } catch (error) {
    res.status(500).json({ message: "Server error fetching messages" });
  }
};

module.exports = { sendMessage, getMessages };
