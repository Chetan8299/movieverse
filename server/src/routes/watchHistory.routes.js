const { Router } = require("express");
const { getWatchHistory, addWatchHistory, clearWatchHistory } = require("../controllers/watchHistory.controller");
const { authenticate } = require("../middlewares/auth.middlewares");
const { validate } = require("../middlewares/validate.middleware");
const { addWatchHistory: addWatchHistoryValidators, getWatchHistory: getWatchHistoryValidators } = require("../validators/watchHistory.validators");

const watchHistoryRouter = Router();

watchHistoryRouter.use(authenticate);

watchHistoryRouter.get("/", getWatchHistoryValidators, validate, getWatchHistory);
watchHistoryRouter.post("/", addWatchHistoryValidators, validate, addWatchHistory);
watchHistoryRouter.delete("/", clearWatchHistory);

module.exports = watchHistoryRouter;
