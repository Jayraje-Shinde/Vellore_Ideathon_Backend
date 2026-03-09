const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for building photos
const buildingPhotoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "civilbuild/buildings",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1200, quality: "auto" }],
  },
});

// Storage for certificates (PDFs + images)
const certificateStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "civilbuild/certificates",
    allowed_formats: ["jpg", "jpeg", "png", "pdf"],
    resource_type: "auto",
  },
});

// Storage for chat images
const chatImageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "civilbuild/chat",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const uploadBuildingPhotos = multer({ storage: buildingPhotoStorage });
const uploadCertificate = multer({ storage: certificateStorage });
const uploadChatImage = multer({ storage: chatImageStorage });

module.exports = {
  cloudinary,
  uploadBuildingPhotos,
  uploadCertificate,
  uploadChatImage,
};
