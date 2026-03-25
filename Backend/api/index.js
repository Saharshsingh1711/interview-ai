require("dotenv").config();
const app = require("../src/app");
const connectToDB = require("../src/config/database");

// Initialize DB connection for serverless function
connectToDB();

// Export the Express API
module.exports = app;
