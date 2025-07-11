const User = require("../models/User");
const multer = require("../utils/multerConfig");
const fs = require("fs");
const path = require("path");
const logger = require("../utils/logger");


const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      logger.warn(`User not found: ${req.user.id}`);
      return res.status(404).json({ msg: "User not found" });
    }

    logger.info(`Fetched profile for user ${req.user.id}`);
    res.json(user);
  } catch (err) {
    logger.error("Error fetching user profile", err);
    next(err);
  }
};


const updateUserProfile = async (req, res, next) => {
  try {
    let updates = req.body;
    if (updates == null || typeof updates !== 'object' || Array.isArray(updates)) {
      logger.warn(`Invalid update data for user: ${req.user.id}`);
      return res.status(400).json({ msg: "Invalid update data" });
    }

    if (Object.keys(updates).length === 0) {
      updates = {};
    }
    const user = await User.findById(req.user.id);

    if (!user) {
      logger.warn(`User not found for update: ${req.user.id}`);
      return res.status(404).json({ msg: "User not found" });
    }

    const allowedFields = ["name", "email", "bio", "skills", "title", "hourlyRate", "location"];
    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) user[field] = updates[field];
    });

    if (req.file) {
      if (user.image) {
        fs.unlink(path.join(__dirname, "..", "uploads", user.image), () => {});
      }
      user.image = req.file.filename;
    }

    await user.save();
    logger.info(`Updated profile for user ${req.user.id}`);
    res.json({ msg: "Profile updated", user });
  } catch (err) {
    logger.error("Error updating user profile", err);
    next(err);
  }
};


const deleteUserAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      logger.warn(`User not found for deletion: ${req.user.id}`);
      return res.status(404).json({ msg: "User not found" });
    }

    await user.deleteOne();
    logger.info(`Deleted account for user ${req.user.id}`);
    res.json({ msg: "Account deleted" });
  } catch (err) {
    logger.error("Error deleting user account", err);
    next(err);
  }
};


const getAllFreelancers = async (req, res, next) => {
  try {
    const { skill, location } = req.query;

    const query = { role: "freelancer" };
    if (skill) query.skills = { $in: [skill] };
    if (location) query.location = location;

    const freelancers = await User.find(query).select("-password");
    logger.info(`Fetched ${freelancers.length} freelancers`);
    res.json({ freelancers });
  } catch (err) {
    logger.error("Error fetching freelancers", err);
    next(err);
  }
};


const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");
    if (!user) {
      logger.warn(`User not found by ID: ${req.params.userId}`);
      return res.status(404).json({ msg: "User not found" });
    }

    logger.info(`Fetched user by ID: ${req.params.userId}`);
    res.json(user);
  } catch (err) {
    logger.error("Error fetching user by ID", err);
    next(err);
  }
};


const uploadAssets = multer.fields([
  { name: "image", maxCount: 1 },
  { name: "cv", maxCount: 1 },
]);

const uploadUserAssets = async (req, res, next) => {
  try {
    console.log("req.files:", req.files);

    const user = await User.findById(req.user.id);
    if (!user) {
      logger.warn(`User not found during asset upload: ${req.user.id}`);
      return res.status(404).json({ msg: "User not found" });
    }

    if (req.files?.image?.[0]) {
      user.image = req.files.image[0].filename;
      logger.info(`User ${req.user.id} uploaded profile image`);
    }

    if (req.files?.cv?.[0]) {
      user.cv = req.files.cv[0].filename;
      logger.info(`User ${req.user.id} uploaded CV`);
    }

    await user.save();

    res.json({
      msg: "Assets uploaded",
      image: user.image,
      cv: user.cv,
    });
  } catch (err) {
    logger.error("Error uploading user assets", err);
    next(err);
  }
};

const updateUserAssets = (req, res, next) => {
  uploadAssets(req, res, async (err) => {
    if (err) {
      logger.error("Multer error during asset update", err);
      return next(err);
    }

    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        logger.warn(`User not found during asset update: ${req.user.id}`);
        return res.status(404).json({ msg: "User not found" });
      }

      if (req.files?.image?.[0]) {
        if (user.image) {
          const oldImagePath = require("path").join(__dirname, "..", "uploads", user.image);
          require("fs").unlink(oldImagePath, (unlinkErr) => {
            if (unlinkErr) logger.error("Error deleting old image", unlinkErr);
          });
        }
        user.image = req.files.image[0].filename;
        logger.info(`User ${req.user.id} updated profile image`);
      }

      if (req.files?.cv?.[0]) {
        if (user.cv) {
          const oldCvPath = require("path").join(__dirname, "..", "uploads", user.cv);
          require("fs").unlink(oldCvPath, (unlinkErr) => {
            if (unlinkErr) logger.error("Error deleting old CV", unlinkErr);
          });
        }
        user.cv = req.files.cv[0].filename;
        logger.info(`User ${req.user.id} updated CV`);
      }

      await user.save();

      res.json({
        msg: "Assets updated",
        image: user.image,
        cv: user.cv,
      });
    } catch (err) {
      logger.error("Error updating user assets", err);
      next(err);
    }
  });
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
  getAllFreelancers,
  getUserById,
  uploadUserAssets,
  updateUserAssets,
};
