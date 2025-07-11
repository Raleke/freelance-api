
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const messageUploadDir = path.join(__dirname, "../messages");

// Ensure the directory exists
if (!fs.existsSync(messageUploadDir)) {
  fs.mkdirSync(messageUploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, messageUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = `msg-${Date.now()}${ext}`;
    cb(null, unique);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|pdf|doc|docx|mp4|mov|webm/;
  const isMimeValid = allowed.test(file.mimetype);
  const isExtValid = allowed.test(path.extname(file.originalname).toLowerCase());

  if (isMimeValid && isExtValid) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"));
  }
};

const messageUpload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 20 }, // 20MB max
  fileFilter,
});

module.exports = messageUpload;