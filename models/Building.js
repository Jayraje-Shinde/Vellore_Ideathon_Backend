const mongoose = require("mongoose");

const buildingSchema = new mongoose.Schema(
  {
    builder_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    building_name: {
      type: String,
      required: [true, "Building name is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 4, // Only 1-4 star buildings need consultation
      required: [true, "Current certificate rating is required"],
    },
    description: {
      type: String,
      default: "",
    },
    // Certificate file
    certificate_file: {
      type: String,
      default: null,
    },
    certificate_public_id: {
      type: String,
      default: null,
    },
    // Building photos array
    photos: [
      {
        url: { type: String },
        public_id: { type: String },
      },
    ],
    // Assigned consultant
    consultant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // Consultation status
    status: {
      type: String,
      enum: ["pending", "in_consultation", "completed"],
      default: "pending",
    },
    // Consultant notes/suggestions
    consultant_notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Building", buildingSchema);
