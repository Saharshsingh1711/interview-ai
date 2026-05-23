const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: function(origin, callback) {
        callback(null, true);
    },
    credentials: true
}))

/* require all the routes here */
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")


/* using all the routes here */
app.get("/", (req, res) => {
    res.json({ status: "ok", message: "Interview AI Backend is running successfully!" });
});

/* Warmup endpoint — frontend pings this on load to wake up the serverless function */
app.get("/api/warmup", async (req, res) => {
    try {
        const connectToDB = require("./config/database");
        await connectToDB();
        res.json({ status: "warm" });
    } catch (err) {
        res.status(500).json({ status: "cold", error: err.message });
    }
});

app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)



module.exports = app