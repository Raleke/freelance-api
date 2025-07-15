const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Organization = require("../models/Organization");
const { generateToken } = require("../utils/token");
const logger = require("../utils/logger");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: AuthOAuth
 *   description: OAuth authentication routes
 */

/**
 * @swagger
 * /authoauth/oauth-success:
 *   get:
 *     summary: OAuth success redirect page
 *     tags: [AuthOAuth]
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: JWT token
 *     responses:
 *       200:
 *         description: OAuth success HTML page
 *       400:
 *         description: Missing token in query parameters
 */
router.get("/oauth-success", (req, res) => {
  const token = req.query.token;
  if (!token) {
    return res.status(400).send("<h1>Missing token in query parameters</h1>");
  }
  res.send(`
    <html>
      <head><title>OAuth Success</title></head>
      <body>
        <h1>OAuth login successful!</h1>
        <p>Your token: ${token}</p>
      </body>
    </html>
  `);
});

/**
 * @swagger
 * /authoauth/google:
 *   get:
 *     summary: Initiate Google OAuth login
 *     tags: [AuthOAuth]
 *     responses:
 *       302:
 *         description: Redirect to Google OAuth login
 */
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

/**
 * @swagger
 * /authoauth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     tags: [AuthOAuth]
 *     responses:
 *       302:
 *         description: Redirect after successful login or failure
 */
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  async (req, res) => {
    try {
      const user = req.user;

      // Auto-add to pending orgs
      const invitedOrgs = await Organization.find({ pendingInvites: user.email });
      for (const org of invitedOrgs) {
        org.members.push({ user: user._id, role: "member" });
        org.pendingInvites = org.pendingInvites.filter(email => email !== user.email);
        await org.save();

        logger.info(`OAuth: User ${user._id} auto-added to org ${org._id}`);
      }

      const token = generateToken(user._id, user.role);
      logger.info(`OAuth: Google login success for ${user.email}`);

      res.redirect(`${process.env.CLIENT_URL}/oauth-success?token=${token}`);
    } catch (err) {
      logger.error("Google OAuth callback error", err);
      res.status(500).json({ message: "OAuth error" });
    }
  }
);

/**
 * @swagger
 * /authoauth/github:
 *   get:
 *     summary: Initiate GitHub OAuth login
 *     tags: [AuthOAuth]
 *     responses:
 *       302:
 *         description: Redirect to GitHub OAuth login
 */
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

/**
 * @swagger
 * /authoauth/github/callback:
 *   get:
 *     summary: GitHub OAuth callback
 *     tags: [AuthOAuth]
 *     responses:
 *       302:
 *         description: Redirect after successful login or failure
 */
router.get(
  "/github/callback",
  passport.authenticate("github", { session: false, failureRedirect: "/login" }),
  async (req, res) => {
    try {
      const user = req.user;

      // Auto-add to pending orgs
      const invitedOrgs = await Organization.find({ pendingInvites: user.email });
      for (const org of invitedOrgs) {
        org.members.push({ user: user._id, role: "member" });
        org.pendingInvites = org.pendingInvites.filter(email => email !== user.email);
        await org.save();

        logger.info(`OAuth: User ${user._id} auto-added to org ${org._id}`);
      }

      const token = generateToken(user._id, user.role);
      logger.info(`OAuth: GitHub login success for ${user.email}`);

      res.redirect(`${process.env.CLIENT_URL}/oauth-success?token=${token}`);
    } catch (err) {
      logger.error("GitHub OAuth callback error", err);
      res.status(500).json({ message: "OAuth error" });
    }
  }
);

module.exports = router;
