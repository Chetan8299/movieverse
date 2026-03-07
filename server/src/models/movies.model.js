const mongoose = require("mongoose")

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        requried: [true, "Title is required"],
    },
    poster: {
        type: String,
        required: [true, "Poster is required"],
    },
    description: {
        type: String,
        required: [true, "Description is required"],
    },
    tmdbId: {
        type: String,
        required: [true, "TMDB ID is required"],
    },
    releaseDate: {
        type: String,
        required: [true, "Release date is required"],
    },
    trailer: {
        type: String,
        required: [true, "Trailer is required"],
    },
    genre: {
        type: String,
        required: [true, "Genre is required"],
    },
    category: {
        type: String,
        required: [true, "Category is required"],
    },
}, { timestamps: true })

module.exports = mongoose.model("Movie", movieSchema)