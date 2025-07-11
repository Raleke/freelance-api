const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const sendEmail = require("../utils/mailer");
const logger = require("../utils/logger");
const Organization = require("../models/Organization");

const { generateToken, generateVerifyToken } = require("../utils/token");

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:4000";


const register = async (req, res, next) => {
  try {
        const { name, email, password, role } = req.body;
    logger.info(` Registering user: ${email}`);

    if (!name || !email || !password) {
      logger.warn("Missing fields in registration");
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      logger.warn("User already exists");
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);


  const user = await User.create({
  name,
  email,
  password: hashedPassword,
  role: role || "freelancer",
  isVerified: false,
});

logger.info(` User ${user._id} created`);

    let invitedOrgs = [];
    try {
      invitedOrgs = await Organization.find({ pendingInvites: email });
    } catch (orgErr) {
      logger.error("Error fetching invited organizations:", orgErr);
    }

    for (const org of invitedOrgs) {
      org.members.push({ user: user._id, role: "member" });
      org.pendingInvites = org.pendingInvites.filter(e => e !== email);
      await org.save();
      logger.info(` User ${user._id} auto-added to org ${org._id} (was pending invite)`);
    }

    const verifyToken = generateVerifyToken(user._id);
    const verifyLink = `${CLIENT_URL}/verify-email/${verifyToken}`;

    const html = `
      <h2>Welcome, ${user.name}</h2>
      <p>Please verify your email:</p>
      <a href="${verifyLink}">Verify Email</a>
      <br/><small>${verifyLink}</small>
    `;

    await sendEmail({ to: email, subject: "Verify Your Email", html });
    logger.info(`Verification email sent to ${email}`);

    res.status(201).json({
      message: "User registered. Verification email sent.",
      user: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    logger.error(" Error in register:", err);
    next(err);
  }
};


const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    logger.info(" Verifying email...");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "Already verified" });

    user.isVerified = true;
    await user.save();

    logger.info(` Email verified for user: ${user.email}`);
    res.json({ message: "Email verified successfully" });
  } catch (err) {
    logger.error(" Error in verifyEmail:", err);
    next(err);
  }
};


const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    logger.info(` Attempting login for ${email}`);

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password))) {
      logger.warn(" Invalid login credentials");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      logger.warn("🔒 Login attempt before verification");
      return res.status(403).json({ message: "Please verify your email first." });
    }

    const token = generateToken(user._id, user.role);
    logger.info(` Login successful for ${email}`);
    res.json({
      message: "Login successful",
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    logger.error(" Error in login:", err);
    next(err);
  }
};


const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    logger.info(` Resending verification email to ${email}`);

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "Already verified" });

    const token = generateVerifyToken(user._id);
    const link = `${CLIENT_URL}/verify-email/${token}`;

    const html = `
      <p>Hi ${user.name},</p>
      <p>Please verify your email:</p>
      <a href="${link}">Verify Now</a>
      <br/><small>${link}</small>
    `;

    await sendEmail({ to: email, subject: "Resend Verification Email", html });
    logger.info(` Verification email resent to ${email}`);

    res.json({ message: "Verification email resent" });
  } catch (err) {
    logger.error(" Error in resendVerification:", err);
    next(err);
  }
};


const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    logger.info(` Forgot password request for ${email}`);

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    const resetLink = `${CLIENT_URL}/reset-password/${resetToken}`;
    const html = `
      <h2>Reset Password</h2>
      <p>Click below to reset your password:</p>
      <a href="${resetLink}">Reset Password</a>
      <br/><small>${resetLink}</small>
    `;

    await sendEmail({ to: user.email, subject: "Reset Your Password", html });
    logger.info(` Password reset email sent to ${email}`);

    res.json({ message: "Password reset email sent" });
  } catch (err) {
    logger.error(" Error in forgotPassword:", err);
    next(err);
  }
};


const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    logger.info(" Attempting password reset");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });
    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    logger.info(` Password reset for user: ${user.email}`);
    res.json({ message: "Password reset successfully" });
  } catch (err) {
    logger.error(" Error in resetPassword:", err);
    next(err);
  }
};

module.exports = {
  register,
  login,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
};