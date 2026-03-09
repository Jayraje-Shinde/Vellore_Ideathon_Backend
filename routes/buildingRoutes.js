const express = require("express");
const router = express.Router();
const {
  createBuilding,
  getAllBuildings,
  getMyBuildings,
  getBuildingById,
  assignConsultant,
  completeConsultation,
} = require("../controllers/buildingController");
const { protect, builderOnly, consultantOnly } = require("../middleware/authMiddleware");
const { uploadBuildingPhotos, uploadCertificate } = require("../config/cloudinary");
const multer = require("multer");

// Multi-field upload handler (certificate + photos)
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { cloudinary } = require("../config/cloudinary");

const buildingUploadStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    if (file.fieldname === "certificate") {
      return { folder: "civilbuild/certificates", resource_type: "auto" };
    }
    return { folder: "civilbuild/buildings", transformation: [{ width: 1200, quality: "auto" }] };
  },
});

const uploadFields = multer({ storage: buildingUploadStorage }).fields([
  { name: "certificate", maxCount: 1 },
  { name: "photos", maxCount: 10 },
]);

// POST   /buildings         → Create building (builder only)
router.post("/", protect, builderOnly, uploadFields, createBuilding);

// GET    /buildings         → Get all buildings (consultant only)
router.get("/", protect, consultantOnly, getAllBuildings);

// GET    /buildings/my      → Get builder's own buildings
router.get("/my", protect, builderOnly, getMyBuildings);

// GET    /buildings/:id     → Get single building
router.get("/:id", protect, getBuildingById);

// POST   /buildings/:id/assign   → Consultant takes the building
router.post("/:id/assign", protect, consultantOnly, assignConsultant);

// PUT    /buildings/:id/complete → Mark consultation as done
router.put("/:id/complete", protect, consultantOnly, completeConsultation);

module.exports = router;
