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


// Create an organization
router.post("/", authMiddleware, createOrganization);

// Invite a member to the organization
router.post("/invite", authMiddleware, inviteMember);

// Get current user's org members
router.get("/:orgId/members", authMiddleware, getMembers);

// Remove a member from org (admin only or owner)
router.delete("/:orgId/members/:memberId", authMiddleware, removeMember);

// Update org details (name, bio, etc.)
router.put("/:orgId", authMiddleware, updateOrganization);

// Leave organization (if user is a member)
router.post("/leave/:orgId", authMiddleware, leaveOrganization);

module.exports = router;