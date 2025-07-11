const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/heic",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];

const fileFilter = (req, file, cb) => {
  const extnameValid = /\.(jpeg|jpg|png|heic|pdf|doc|docx)$/i.test(file.originalname);
  const mimetypeValid = allowedMimeTypes.includes(file.mimetype);

  if (extnameValid && mimetypeValid) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.originalname} (${file.mimetype})`));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});

module.exports = upload;