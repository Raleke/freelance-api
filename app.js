const express = require("express");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const errorHandler = require("./middlewares/errorMiddleware");
require("dotenv").config();
require("./config/passport");

const app = express();

app.use("/api/webhooks", express.raw({ type: "application/json" }), require("./routes/webhookRoutes"));

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static("uploads")); 
app.use("/messages", express.static("messages"));

app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  })
);

app.use(passport.initialize());
app.use(passport.session());

const authOauthRoutes = require("./routes/authOauthRoutes");
app.use("/auth", authOauthRoutes);

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/jobs", require("./routes/jobRoutes"));
app.use("/api/proposals", require("./routes/proposalRoutes"));
app.use("/api/contracts", require("./routes/contractRoutes"));
app.use("/api/invoices", require("./routes/invoiceRoutes"));
app.use("/api/milestones", require("./routes/milestoneRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/chats", require("./routes/chatRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/disputes", require("./routes/disputeRoutes"));
app.use("/api/orgs", require("./routes/organizationRoutes"));
app.use("/api/availability", require("./routes/availabilityRoutes"));
app.use("/api/debug", require("./routes/debugRoutes"));

app.use(errorHandler);

module.exports = app;
