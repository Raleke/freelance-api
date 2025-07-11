const Organization = require("../models/Organization");
const User = require("../models/User");
const sendEmail = require("../utils/mailer");
const logger = require("../utils/logger");


const createOrganization = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const org = await Organization.create({
      name,
      description,
      owner: req.user.id,
      members: [{ user: req.user.id, role: "admin" }],
    });

    logger.info(`Organization "${name}" created by user ${req.user.id}`);

    //  Check if current user was invited to other orgs via email and auto-add them
    const currentUser = await User.findById(req.user.id);
    if (currentUser?.email) {
      const invitedOrgs = await Organization.find({ pendingInvites: currentUser.email });

      for (const invitedOrg of invitedOrgs) {
        invitedOrg.members.push({ user: currentUser._id, role: "member" });
        invitedOrg.pendingInvites = invitedOrg.pendingInvites.filter(
          email => email !== currentUser.email
        );
        await invitedOrg.save();

        logger.info(`User ${currentUser._id} auto-added to org ${invitedOrg._id} on org creation`);
      }
    }

    res.status(201).json({ msg: "Organization created", organization: org });
  } catch (err) {
    logger.error("Error creating organization", err);
    next(err);
  }
};


const inviteMember = async (req, res, next) => {
  try {
    const { organizationId, email } = req.body;

    const org = await Organization.findById(organizationId);
    if (!org) return res.status(404).json({ msg: "Organization not found" });

    if (!org.owner.equals(req.user.id)) {
      return res.status(403).json({ msg: "Only the owner can invite members" });
    }

    const user = await User.findOne({ email });

    if (user) {
      if (org.members.includes(user._id)) {
        return res.status(400).json({ msg: "User is already a member" });
      }

      org.members.push(user._id);
      await org.save();

      await sendEmail({
        to: email,
        subject: "You’ve been added to an organization",
        text: `You've been added to the organization "${org.name}".`,
      });

      logger.info(`User ${user._id} invited to org ${organizationId} by ${req.user.id}`);
      return res.json({ msg: "Member invited and added", organization: org });

    } else {
      
      if (org.pendingInvites.includes(email)) {
        return res.status(400).json({ msg: "This email has already been invited." });
      }

      org.pendingInvites.push(email);
      await org.save();

      await sendEmail({
        to: email,
        subject: "You're invited to join an organization on Rolo",
        text: `You've been invited to join the organization "${org.name}". Create your account using this email to be added automatically.`,
      });

      logger.info(`Email ${email} added to pending invites for org ${organizationId}`);
      return res.json({ msg: "Invitation email sent", organization: org });
    }

  } catch (err) {
    logger.error("Error inviting member", err);
    next(err);
  }
};

const getMembers = async (req, res, next) => {
  try {
    const { orgId } = req.params;

    const org = await Organization.findById(orgId).populate("members", "name email role");
    if (!org) return res.status(404).json({ msg: "Organization not found" });

    logger.info(`Fetched members for org ${orgId}`);
    res.json({ members: org.members });
  } catch (err) {
    logger.error("Error fetching organization members", err);
    next(err);
  }
};


const removeMember = async (req, res, next) => {
  try {
    const { memberId, orgId } = req.params;

    const org = await Organization.findOne({ owner: req.user.id });
    if (!org) return res.status(404).json({ msg: "Organization not found" });

    if (!org.owner.equals(req.user.id)) {
      return res.status(403).json({ msg: "Only the owner can remove members" });
    }

    org.members = org.members.filter((id) => id.toString() !== memberId);
    await org.save();

    logger.info(`User ${memberId} removed from org ${org._id}`);
    res.json({ msg: "Member removed", organization: org });
  } catch (err) {
    logger.error("Error removing member", err);
    next(err);
  }
};


const updateOrganization = async (req, res, next) => {
  try {
    const { orgId } = req.params;
    const { name, description } = req.body;

    const org = await Organization.findById(orgId);
    if (!org) return res.status(404).json({ msg: "Organization not found" });

    if (!org.owner.equals(req.user.id)) {
      return res.status(403).json({ msg: "Only the owner can update organization" });
    }

    org.name = name || org.name;
    org.description = description || org.description;
    await org.save();

    logger.info(`Organization ${orgId} updated by user ${req.user.id}`);
    res.json({ msg: "Organization updated", organization: org });
  } catch (err) {
    logger.error("Error updating organization", err);
    next(err);
  }
};


const leaveOrganization = async (req, res, next) => {
  try {
    const { orgId } = req.params;

    const org = await Organization.findById(orgId);
    if (!org) return res.status(404).json({ msg: "Organization not found" });

    if (org.owner.equals(req.user.id)) {
      return res.status(400).json({ msg: "Owner cannot leave organization" });
    }

    org.members = org.members.filter((id) => id.toString() !== req.user.id);
    await org.save();

    logger.info(`User ${req.user.id} left organization ${orgId}`);
    res.json({ msg: "You have left the organization" });
  } catch (err) {
    logger.error("Error leaving organization", err);
    next(err);
  }
};

module.exports = {
  createOrganization,
  inviteMember,
  getMembers,
  removeMember,
  updateOrganization,
  leaveOrganization,
};