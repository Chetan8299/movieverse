const asyncHandler = require("../utils/asynchandler");
const Favorite = require("../models/favorite.model");

/**
 * @desc Get user's favorites
 * @route GET /api/favorites
 * @access Private
 */
const getFavorites = asyncHandler(async (req, res) => {
    const favorites = await Favorite.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ favorites });
});

/**
 * @desc Add to favorites
 * @route POST /api/favorites
 * @access Private
 */
const addFavorite = asyncHandler(async (req, res) => {
    const { tmdbId, type = "movie", title = "", poster = "", overview = "" } = req.body;
    if (!tmdbId) {
        return res.status(400).json({ message: "tmdbId is required" });
    }
    const existing = await Favorite.findOne({ user: req.user.id, tmdbId: String(tmdbId), type });
    if (existing) {
        return res.status(200).json({ message: "Already in favorites", favorite: existing });
    }
    const favorite = await Favorite.create({
        user: req.user.id,
        tmdbId: String(tmdbId),
        type: type === "tv" ? "tv" : "movie",
        title,
        poster,
        overview,
    });
    res.status(201).json({ message: "Added to favorites", favorite });
});

/**
 * @desc Remove from favorites
 * @route DELETE /api/favorites/:tmdbId
 * @access Private
 */
const removeFavorite = asyncHandler(async (req, res) => {
    const { type = "movie" } = req.query;
    const deleted = await Favorite.findOneAndDelete({
        user: req.user.id,
        tmdbId: String(req.params.tmdbId),
        type: type === "tv" ? "tv" : "movie",
    });
    if (!deleted) {
        return res.status(404).json({ message: "Favorite not found" });
    }
    res.status(200).json({ message: "Removed from favorites" });
});

/**
 * @desc Check if item is in favorites
 * @route GET /api/favorites/check/:tmdbId
 * @access Private
 */
const checkFavorite = asyncHandler(async (req, res) => {
    const { type = "movie" } = req.query;
    const favorite = await Favorite.findOne({
        user: req.user.id,
        tmdbId: String(req.params.tmdbId),
        type: type === "tv" ? "tv" : "movie",
    });
    res.status(200).json({ isFavorite: !!favorite });
});

module.exports = { getFavorites, addFavorite, removeFavorite, checkFavorite };
