const { Router } = require("express");
const {
    getMovies,
    getMovieById,
    getMovieByTmdbId,
    createMovie,
    updateMovie,
    deleteMovie,
} = require("../controllers/movies.controller");
const { authenticate, authorize } = require("../middlewares/auth.middlewares");
const { validate } = require("../middlewares/validate.middleware");
const {
    createMovie: createMovieValidators,
    updateMovie: updateMovieValidators,
    getOrDeleteById,
    tmdbIdParam,
} = require("../validators/movies.validators");

const moviesRouter = Router();

moviesRouter.get("/", getMovies);
moviesRouter.get("/tmdb/:tmdbId", [tmdbIdParam], validate, getMovieByTmdbId);
moviesRouter.get("/:id", getOrDeleteById, validate, getMovieById);

moviesRouter.post("/", authenticate, authorize(["admin"]), createMovieValidators, validate, createMovie);
moviesRouter.put("/:id", authenticate, authorize(["admin"]), updateMovieValidators, validate, updateMovie);
moviesRouter.delete("/:id", authenticate, authorize(["admin"]), getOrDeleteById, validate, deleteMovie);

module.exports = moviesRouter;
