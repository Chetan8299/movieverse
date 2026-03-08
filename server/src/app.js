const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const errorHandler = require("./middlewares/errorHandler");
const authRouter = require("./routes/auth.routes");
const moviesRouter = require("./routes/movies.routes");
const favoritesRouter = require("./routes/favorites.routes");
const watchHistoryRouter = require("./routes/watchHistory.routes");
const adminRouter = require("./routes/admin.routes");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
}));

app.use("/api/auth", authRouter);
app.use("/api/movies", moviesRouter);
app.use("/api/favorites", favoritesRouter);
app.use("/api/watch-history", watchHistoryRouter);
app.use("/api/admin", adminRouter);

app.use(errorHandler);

module.exports = app;