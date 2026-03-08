const { body, param } = require("express-validator");

const tmdbIdParam = param("tmdbId")
    .notEmpty()
    .withMessage("tmdbId is required")
    .isLength({ max: 50 })
    .withMessage("tmdbId too long");

const mongooseId = param("id")
    .isMongoId()
    .withMessage("Invalid movie ID");

const createMovie = [
    body("title")
        .trim()
        .notEmpty()
        .withMessage("Title is required")
        .isLength({ max: 300 })
        .withMessage("Title must be at most 300 characters"),
    body("category")
        .trim()
        .notEmpty()
        .withMessage("Category is required")
        .isIn(["movie", "tv"])
        .withMessage("Category must be 'movie' or 'tv'"),
    body("tmdbId")
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage("TMDB ID must be at most 50 characters"),
    body("poster")
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage("Poster URL too long"),
    body("description")
        .optional()
        .trim()
        .isLength({ max: 5000 })
        .withMessage("Description too long"),
    body("releaseDate")
        .optional()
        .trim()
        .isLength({ max: 20 })
        .withMessage("Release date invalid"),
    body("trailer")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Trailer URL too long"),
    body("genre")
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage("Genre too long"),
];

const updateMovie = [
    param("id").isMongoId().withMessage("Invalid movie ID"),
    body("title")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Title cannot be empty")
        .isLength({ max: 300 })
        .withMessage("Title must be at most 300 characters"),
    body("category")
        .optional()
        .trim()
        .isIn(["movie", "tv"])
        .withMessage("Category must be 'movie' or 'tv'"),
    body("tmdbId")
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage("TMDB ID must be at most 50 characters"),
    body("poster")
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage("Poster URL too long"),
    body("description")
        .optional()
        .trim()
        .isLength({ max: 5000 })
        .withMessage("Description too long"),
    body("releaseDate")
        .optional()
        .trim()
        .isLength({ max: 20 })
        .withMessage("Release date invalid"),
    body("trailer")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Trailer URL too long"),
    body("genre")
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage("Genre too long"),
];

const getOrDeleteById = [mongooseId];

module.exports = { createMovie, updateMovie, getOrDeleteById, tmdbIdParam };
