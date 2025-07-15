const express = require("express");
const router = express.Router();

const {
  createOrganization,
  inviteMember,
  getMembers,
  removeMember,
  updateOrganization,
  leaveOrganization,
} = require("../controllers/organizationController");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

/**
 * @swagger
 * tags:
 *   name: Organizations
 *   description: Organization management and membership
 */

/**
 * @swagger
 * /organizations:
 *   post:
 *     summary: Create an organization
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Organization data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Acme Corp"
 *               bio:
 *                 type: string
 *                 example: "A group of creative freelancers"
 *     responses:
 *       201:
 *         description: Organization created successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/", authMiddleware, createOrganization);

/**
 * @swagger
 * /organizations/invite:
 *   post:
 *     summary: Invite a member to the organization
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Invitation data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orgId
 *               - email
 *             properties:
 *               orgId:
 *                 type: string
 *                 example: "64b3e9f7b034d73257aa1d23"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "newuser@example.com"
 *     responses:
 *       200:
 *         description: Invitation sent
 *       401:
 *         description: Unauthorized
 */
router.post("/invite", authMiddleware, inviteMember);

/**
 * @swagger
 * /organizations/{orgId}/members:
 *   get:
 *     summary: Get members of an organization
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         description: Organization ID
 *         schema:
 *           type: string
 *           example: "64b3e9f7b034d73257aa1d23"
 *     responses:
 *       200:
 *         description: List of members
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: string
 *                   role:
 *                     type: string
 *       401:
 *         description: Unauthorized
 */
router.get("/:orgId/members", authMiddleware, getMembers);

/**
 * @swagger
 * /organizations/{orgId}/members/{memberId}:
 *   delete:
 *     summary: Remove a member from the organization (admin or owner only)
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         description: Organization ID
 *         schema:
 *           type: string
 *       - in: path
 *         name: memberId
 *         required: true
 *         description: Member's User ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Member removed
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Member not found
 */
router.delete("/:orgId/members/:memberId", authMiddleware, removeMember);

/**
 * @swagger
 * /organizations/{orgId}:
 *   put:
 *     summary: Update organization details
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         description: Organization ID
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Updated organization details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Organization Name"
 *               bio:
 *                 type: string
 *                 example: "New mission statement for the org"
 *     responses:
 *       200:
 *         description: Organization updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Organization not found
 */
router.put("/:orgId", authMiddleware, updateOrganization);

/**
 * @swagger
 * /organizations/leave/{orgId}:
 *   post:
 *     summary: Leave the organization
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         description: Organization ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully left the organization
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Organization not found
 */
router.post("/leave/:orgId", authMiddleware, leaveOrganization);

module.exports = router;