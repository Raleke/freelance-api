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

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile and asset management
 */

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get your own profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *       404:
 *         description: User not found
 */
router.get("/profile", authMiddleware, getUserProfile);

/**
 * @swagger
 * /users/profile:
 *   put:
 *     summary: Update your profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Profile update data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               bio:
 *                 type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               title:
 *                 type: string
 *               hourlyRate:
 *                 type: number
 *               location:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 *       400:
 *         description: Invalid update data
 *       404:
 *         description: User not found
 */
router.put("/profile", authMiddleware, updateUserProfile);

/**
 * @swagger
 * /users/profile:
 *   delete:
 *     summary: Delete your account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted
 *       404:
 *         description: User not found
 */
router.delete("/profile", authMiddleware, deleteUserAccount);

/**
 * @swagger
 * /users/assets:
 *   post:
 *     summary: Upload user assets (CV/image)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               cv:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Assets uploaded
 *       404:
 *         description: User not found
 */
router.post(
  "/assets",
  authMiddleware,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "cv", maxCount: 1 },
  ]),
  uploadUserAssets
);

/**
 * @swagger
 * /users/assets:
 *   put:
 *     summary: Update uploaded CV/image
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               cv:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Assets updated
 *       404:
 *         description: User not found
 */
router.put(
  "/assets",
  authMiddleware,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "cv", maxCount: 1 },
  ]),
  updateUserAssets
);

/**
 * @swagger
 * /users/freelancers:
 *   get:
 *     summary: Get all freelancers
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: skill
 *         schema:
 *           type: string
 *         description: Filter by skill
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *     responses:
 *       200:
 *         description: List of freelancers
 */
router.get("/freelancers", authMiddleware, getAllFreelancers);

/**
 * @swagger
 * /users/{userId}:
 *   get:
 *     summary: Get user by ID (client/admin viewing freelancer, etc)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID of the user
 *         schema:
 *           type: string
 *           example: 64b1a47e527a60b6c8e5a9f1
 *     responses:
 *       200:
 *         description: User data
 *       404:
 *         description: User not found
 */
router.get("/:userId", authMiddleware, getUserById);

module.exports = router;