require("dotenv").config();
const app = require("../src/app");
const connectToDB = require("../src/config/database");

// Export the Express API as a Vercel Serverless Function
module.exports = async (req, res) => {
    await connectToDB();
    return app(req, res);
};
