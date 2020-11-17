/**
 * Module imports
 */
import dotenv from "dotenv"
import initDB from "./initDB"

/**
 * Handle uncaught Exceptions and shut server down
 */
process.on("uncaughtException", (err) => {
  console.log(err);
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

/**
 * Load environment variables
 */
dotenv.config()

/**
 * Initialize Memory DB models
 */
initDB()

/**
 * Express app import
 * NOTE: app should be imported after environment variables have been loaded
 */
import app from "./app";

/**
 * Extract PORT from environment variable
 */
const { PORT } = process.env

/**
 * Make app listen on port `PORT` and store the return value in the server variable
 * NOTE: `app.listen()` return value is only been stored so it can be used later
 * to shut down server gracefully - let it process all active request before
 * shutting down
 */
const server = app.listen(PORT, () => {
  console.log(`App running on port ${PORT}...`);
});

/**
 * Handle all `unhandledRejection` by shutting down server gracefully
 */
process.on("unhandledRejection", (err: any) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
      process.exit(1);
  });
});

/**
 * Handle all `SIGTERM` signal by shutting down server gracefully
 */
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM RECEIVED. Shutting down gracefully");
  server.close(() => {
      console.log("💥 Process terminated!");
  });
});