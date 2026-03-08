const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema({
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
}, { timestamps: true });

favoriteSchema.index({ user: 1, tmdbId: 1, type: 1 }, { unique: true });

module.exports = mongoose.model("Favorite", favoriteSchema);
