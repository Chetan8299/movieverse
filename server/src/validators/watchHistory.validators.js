const { body, query } = require("express-validator");

const addWatchHistory = [
    body("tmdbId")
        .notEmpty()
        .withMessage("tmdbId is required")
        .custom((v) => String(v).length <= 50)
        .withMessage("tmdbId too long"),
    body("type")
        .optional()
        .isIn(["movie", "tv"])
        .withMessage("type must be 'movie' or 'tv'"),
    body("title").optional().trim().isLength({ max: 300 }).withMessage("Title too long"),
    body("poster").optional().trim().isLength({ max: 1000 }).withMessage("Poster URL too long"),
];

const getWatchHistory = [
    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("limit must be between 1 and 100")
        .toInt(),
];

module.exports = { addWatchHistory, getWatchHistory };
