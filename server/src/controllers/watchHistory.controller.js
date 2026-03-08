const asyncHandler = require("../utils/asynchandler");
const WatchHistory = require("../models/watchHistory.model");

/**
 * @desc Get user's watch history (recent first)
 * @route GET /api/watch-history
 * @access Private
 */
const getWatchHistory = asyncHandler(async (req, res) => {
    const { limit = 50 } = req.query;
    const history = await WatchHistory.find({ user: req.user.id })
        .sort({ watchedAt: -1 })
        .limit(Number(limit));
    res.status(200).json({ history });
});

/**
 * @desc Add to watch history (when user opens movie page or watches trailer)
 * @route POST /api/watch-history
 * @access Private
 */
const addWatchHistory = asyncHandler(async (req, res) => {
    const { tmdbId, type = "movie", title = "", poster = "" } = req.body;
    if (!tmdbId) {
        return res.status(400).json({ message: "tmdbId is required" });
    }
    const entry = await WatchHistory.create({
        user: req.user.id,
        tmdbId: String(tmdbId),
        type: type === "tv" ? "tv" : "movie",
        title,
        poster,
        watchedAt: new Date(),
    });
    res.status(201).json({ message: "Added to watch history", entry });
});

/**
 * @desc Clear watch history
 * @route DELETE /api/watch-history
 * @access Private
 */
const clearWatchHistory = asyncHandler(async (req, res) => {
    await WatchHistory.deleteMany({ user: req.user.id });
    res.status(200).json({ message: "Watch history cleared" });
});

module.exports = { getWatchHistory, addWatchHistory, clearWatchHistory };
