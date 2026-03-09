const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    building_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Building",
      required: true,
    },
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message_text: {
      type: String,
      default: "",
    },
    image_url: {
      type: String,
      default: null,
    },
    image_public_id: {
      type: String,
      default: null,
    },
    // Message type: text or image
    message_type: {
      type: String,
      enum: ["text", "image", "mixed"],
      default: "text",
    },
    is_read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
