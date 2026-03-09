const Building = require("../models/Building");

// @desc    Upload / create a building
// @route   POST /buildings
// @access  Private (Builder only)
const createBuilding = async (req, res) => {
  try {
    const { building_name, location, rating, description } = req.body;

    if (!building_name || !location || !rating) {
      return res.status(400).json({ message: "Building name, location, and rating are required" });
    }

    if (rating < 1 || rating > 4) {
      return res.status(400).json({ message: "Rating must be between 1 and 4 stars" });
    }

    const buildingData = {
      builder_id: req.user._id,
      building_name,
      location,
      rating: Number(rating),
      description: description || "",
    };

    // Handle certificate file upload
    if (req.files && req.files.certificate) {
      buildingData.certificate_file = req.files.certificate[0].path;
      buildingData.certificate_public_id = req.files.certificate[0].filename;
    }

    // Handle building photos upload (multiple)
    if (req.files && req.files.photos) {
      buildingData.photos = req.files.photos.map((file) => ({
        url: file.path,
        public_id: file.filename,
      }));
    }

    const building = await Building.create(buildingData);
    await building.populate("builder_id", "name email");

    res.status(201).json({
      message: "Building uploaded successfully",
      building,
    });
  } catch (error) {
    console.error("Create building error:", error);
    res.status(500).json({ message: "Server error while creating building" });
  }
};

// @desc    Get all buildings (for consultants)
// @route   GET /buildings
// @access  Private (Consultant only)
const getAllBuildings = async (req, res) => {
  try {
    const { status, rating } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (rating) filter.rating = Number(rating);

    const buildings = await Building.find(filter)
      .populate("builder_id", "name email")
      .populate("consultant_id", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ count: buildings.length, buildings });
  } catch (error) {
    res.status(500).json({ message: "Server error fetching buildings" });
  }
};

// @desc    Get buildings uploaded by logged-in builder
// @route   GET /buildings/my
// @access  Private (Builder only)
const getMyBuildings = async (req, res) => {
  try {
    const buildings = await Building.find({ builder_id: req.user._id })
      .populate("consultant_id", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ count: buildings.length, buildings });
  } catch (error) {
    res.status(500).json({ message: "Server error fetching your buildings" });
  }
};

// @desc    Get single building by ID
// @route   GET /buildings/:id
// @access  Private
const getBuildingById = async (req, res) => {
  try {
    const building = await Building.findById(req.params.id)
      .populate("builder_id", "name email")
      .populate("consultant_id", "name email");

    if (!building) {
      return res.status(404).json({ message: "Building not found" });
    }

    // Builders can only see their own buildings
    if (
      req.user.role === "builder" &&
      building.builder_id._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized to view this building" });
    }

    res.status(200).json({ building });
  } catch (error) {
    res.status(500).json({ message: "Server error fetching building" });
  }
};

// @desc    Assign consultant to a building
// @route   POST /buildings/:id/assign
// @access  Private (Consultant only)
const assignConsultant = async (req, res) => {
  try {
    const building = await Building.findById(req.params.id);

    if (!building) {
      return res.status(404).json({ message: "Building not found" });
    }

    if (building.status !== "pending") {
      return res.status(400).json({ message: "Building is already assigned or completed" });
    }

    building.consultant_id = req.user._id;
    building.status = "in_consultation";
    await building.save();

    await building.populate("builder_id", "name email");
    await building.populate("consultant_id", "name email");

    res.status(200).json({
      message: "Consultation started successfully",
      building,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error assigning consultant" });
  }
};

// @desc    Mark consultation as completed
// @route   PUT /buildings/:id/complete
// @access  Private (Consultant only)
const completeConsultation = async (req, res) => {
  try {
    const building = await Building.findById(req.params.id);

    if (!building) {
      return res.status(404).json({ message: "Building not found" });
    }

    if (building.consultant_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    building.status = "completed";
    building.consultant_notes = req.body.consultant_notes || "";
    await building.save();

    res.status(200).json({ message: "Consultation marked as completed", building });
  } catch (error) {
    res.status(500).json({ message: "Server error completing consultation" });
  }
};

module.exports = {
  createBuilding,
  getAllBuildings,
  getMyBuildings,
  getBuildingById,
  assignConsultant,
  completeConsultation,
};
