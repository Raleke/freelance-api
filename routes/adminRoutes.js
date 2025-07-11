const express = require("express");
const router = express.Router();

const { getDashboardStats } = require("../controllers/adminController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.get("/dashboard", authMiddleware, roleMiddleware("admin"), getDashboardStats);

module.exports = router;