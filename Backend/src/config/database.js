const mongoose = require("mongoose")

/**
 * Cached connection promise — persists across warm serverless invocations.
 * On Vercel, the module-level `cached` variable survives between requests
 * as long as the function stays warm, preventing redundant DB connections.
 */
let cached = global.__mongooseConnection;
if (!cached) {
    cached = global.__mongooseConnection = { conn: null, promise: null };
}

async function connectToDB() {
    // Already connected — instant return
    if (cached.conn) {
        return cached.conn;
    }

    // Connection in progress — reuse the same promise (avoids duplicate connects)
    if (!cached.promise) {
        cached.promise = mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            // Keep a small pool for serverless (default 100 is overkill)
            maxPoolSize: 5,
        }).then((mongooseInstance) => {
            console.log("Connected to Database");
            return mongooseInstance;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (err) {
        // Reset on failure so next request retries
        cached.promise = null;
        throw err;
    }

    return cached.conn;
}

module.exports = connectToDB