const express = require("express");
const router = express.Router();

const {
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
  getAllFreelancers,
  getUserById,
  uploadUserAssets,
  updateUserAssets,
} = require("../controllers/userController");

const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload"); 

//  Get your own profile
router.get("/profile", authMiddleware, getUserProfile);

//  Update your profile
router.put("/profile", authMiddleware, updateUserProfile);

//  Delete your account
router.delete("/profile", authMiddleware, deleteUserAccount);

// Upload CV/image etc
router.post(
  "/assets",
  authMiddleware,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "cv", maxCount: 1 },
  ]),
  uploadUserAssets
);


// Update CV/image etc
router.put("/assets", authMiddleware, upload.fields([
  { name: "image", maxCount: 1 },
  { name: "cv", maxCount: 1 },
]), updateUserAssets);

// List all freelancers
router.get("/freelancers", authMiddleware, getAllFreelancers);

// Get any user by ID (admin/client viewing freelancer, etc)
router.get("/:userId", authMiddleware, getUserById);

module.exports = router;