const app = require("../src/app");
const connectToDB = require("../src/config/database");

// Export the Express API as a Vercel Serverless Function
module.exports = async (req, res) => {
    try {
        await connectToDB();
        return app(req, res);
    } catch (error) {
        res.status(500).json({
            error: "Vercel Serverless Function encountered an error.",
            message: error.message,
            stack: error.stack
        });
    }
};
