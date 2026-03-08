const { body, param, query } = require("express-validator");

const addFavorite = [
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

const tmdbIdParam = param("tmdbId")
    .notEmpty()
    .withMessage("tmdbId is required")
    .isLength({ max: 50 })
    .withMessage("tmdbId too long");

const typeQuery = query("type")
    .optional()
    .isIn(["movie", "tv"])
    .withMessage("type must be 'movie' or 'tv'");

module.exports = { addFavorite, tmdbIdParam, typeQuery };
