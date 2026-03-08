const asyncHandler = require("../utils/asynchandler");
const Movie = require("../models/movies.model");

/**
 * @desc Get all movies (admin-added custom movies). Optional: category, q (search title/description), page, limit.
 * @route GET /api/movies
 * @access Public
 */
const getMovies = asyncHandler(async (req, res) => {
    const { category, q, page = 1, limit = 20 } = req.query;
    const query = {};
    if (category) query.category = category;
    if (q && String(q).trim()) {
        const search = String(q).trim();
        query.$or = [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
        ];
    }
    const limitNum = Math.min(Number(limit) || 20, 100);
    const skip = (Number(page) - 1) * limitNum;
    const [movies, total] = await Promise.all([
        Movie.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
        Movie.countDocuments(query),
    ]);
    res.status(200).json({ movies, total, page: Number(page), totalPages: Math.ceil(total / limitNum) });
});

/**
 * @desc Get single movie by ID
 * @route GET /api/movies/:id
 * @access Public
 */
const getMovieById = asyncHandler(async (req, res) => {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
    }
    res.status(200).json(movie);
});

/**
 * @desc Get movie by TMDB ID (for frontend to merge with TMDB data)
 * @route GET /api/movies/tmdb/:tmdbId
 * @access Public
 */
const getMovieByTmdbId = asyncHandler(async (req, res) => {
    const movie = await Movie.findOne({ tmdbId: String(req.params.tmdbId) });
    if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
    }
    res.status(200).json(movie);
});

/**
 * @desc Create movie (Admin only)
 * @route POST /api/movies
 * @access Private/Admin
 */
const createMovie = asyncHandler(async (req, res) => {
    const { title, poster, description, tmdbId, releaseDate, trailer, genre, category } = req.body;
    if (!title || !category) {
        return res.status(400).json({ message: "Title and category are required" });
    }
    const trimmedTmdbId = tmdbId != null ? String(tmdbId).trim() : "";
    const finalTmdbId = trimmedTmdbId || `custom-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const movie = await Movie.create({
        title,
        poster: poster || "",
        description: description || "",
        tmdbId: finalTmdbId,
        releaseDate: releaseDate || "",
        trailer: trailer || "",
        genre: genre || "",
        category,
    });
    res.status(201).json({ message: "Movie created", movie });
});

/**
 * @desc Update movie (Admin only)
 * @route PUT /api/movies/:id
 * @access Private/Admin
 */
const updateMovie = asyncHandler(async (req, res) => {
    const { title, poster, description, tmdbId, releaseDate, trailer, genre, category } = req.body;
    const movie = await Movie.findByIdAndUpdate(
        req.params.id,
        { title, poster, description, tmdbId, releaseDate, trailer, genre, category },
        { new: true, runValidators: true }
    );
    if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
    }
    res.status(200).json({ message: "Movie updated", movie });
});

/**
 * @desc Delete movie (Admin only)
 * @route DELETE /api/movies/:id
 * @access Private/Admin
 */
const deleteMovie = asyncHandler(async (req, res) => {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
    }
    res.status(200).json({ message: "Movie deleted" });
});

module.exports = {
    getMovies,
    getMovieById,
    getMovieByTmdbId,
    createMovie,
    updateMovie,
    deleteMovie,
};
