const mongoose = require("mongoose")

let isConnected = false;

async function connectToDB() {
    if (isConnected) {
        return;
    }
    try {
        const db = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        })
        isConnected = db.connections[0].readyState === 1;
        console.log("Connected to Database")
    }
    catch (err) {
        console.log(err)
        throw err;
    }
}

module.exports = connectToDB