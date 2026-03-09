const mongoose = require("mongoose");

const watchHistorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    tmdbId: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ["movie", "tv"],
        required: true,
    },
    title: { type: String, default: "" },
    poster: { type: String, default: "" },
    overview: { type: String, default: "" },
    watchedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

watchHistorySchema.index({ user: 1, watchedAt: -1 });

module.exports = mongoose.model("WatchHistory", watchHistorySchema);
