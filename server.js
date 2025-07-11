require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const { initSocket } = require("./utils/socket");
const errorHandler = require("./middlewares/errorMiddleware");

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });

    initSocket(server); // Attach socket.io to the HTTP server

  } catch (err) {
    console.error(" Failed to start server:", err.message);
    process.exit(1);
  }
};

startServer();