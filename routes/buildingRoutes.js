const express = require("express");
const router = express.Router();
const { createBuilding, getAllBuildings, getMyBuildings, getBuildingById, assignConsultant, completeConsultation } = require("../controllers/buildingController");
const { protect, builderOnly, consultantOnly } = require("../middleware/authMiddleware");
const multer = require("multer");
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

const handleUpload = (req, res, next) => {
  uploadFields(req, res, (err) => {
    if (err) return res.status(400).json({ message: "File upload failed: " + err.message });
    next();
  });
};

router.post("/", protect, builderOnly, handleUpload, createBuilding);
router.get("/", protect, consultantOnly, getAllBuildings);
router.get("/my", protect, builderOnly, getMyBuildings);
router.get("/:id", protect, getBuildingById);
router.post("/:id/assign", protect, consultantOnly, assignConsultant);
router.put("/:id/complete", protect, consultantOnly, completeConsultation);

module.exports = router;