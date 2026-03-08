const { Router } = require("express");
const { getFavorites, addFavorite, removeFavorite, checkFavorite } = require("../controllers/favorites.controller");
const { authenticate } = require("../middlewares/auth.middlewares");
const { validate } = require("../middlewares/validate.middleware");
const { addFavorite: addFavoriteValidators, tmdbIdParam, typeQuery } = require("../validators/favorites.validators");

const favoritesRouter = Router();

favoritesRouter.use(authenticate);

favoritesRouter.get("/", getFavorites);
favoritesRouter.get("/check/:tmdbId", [tmdbIdParam], typeQuery, validate, checkFavorite);
favoritesRouter.post("/", addFavoriteValidators, validate, addFavorite);
favoritesRouter.delete("/:tmdbId", [tmdbIdParam], typeQuery, validate, removeFavorite);

module.exports = favoritesRouter;
