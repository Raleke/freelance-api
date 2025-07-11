const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Organization = require("../models/Organization");
const { generateToken } = require("../utils/token");
const logger = require("../utils/logger");

const router = express.Router();

// Route to handle /oauth-success redirect from OAuth login
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

// GOOGLE AUTH 
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

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

//  GITHUB AUTH 
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

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