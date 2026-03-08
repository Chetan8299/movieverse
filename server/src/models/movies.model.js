const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
    title: { type: String, required: [true, "Title is required"] },
    poster: { type: String, default: "" },
    description: { type: String, default: "" },
    tmdbId: { type: String, default: "" },
    releaseDate: { type: String, default: "" },
    trailer: { type: String, default: "" },
    genre: { type: String, default: "" },
    genres: { type: [String], default: [] },
    banner: { type: String, default: "" },
    runtime: { type: Number, default: null },
    category: { type: String, required: [true, "Category is required"] },
}, { timestamps: true });

movieSchema.index({ category: 1, createdAt: -1 });

module.exports = mongoose.model("Movie", movieSchema);