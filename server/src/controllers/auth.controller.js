const asyncHandler = require("../utils/asynchandler");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");

/**
 * @desc Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password });

    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    res.status(201).json({ message: "User created successfully", user });
})

/**
 * @desc Login a user
 * @route POST /api/auth/login
 * @access Public
 */
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(400).json({ message: "User not found" });
    }

    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    res.status(200).json({ message: "Login successful", user, token });
})

/**
 * @desc Logout a user
 * @route POST /api/auth/logout
 * @access Public
 */
const logout = asyncHandler(async (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ message: "Logout successful" });
})

/**
 * @desc Get a user
 * @route GET /api/auth/user
 * @access Private
 */
const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) {
        return res.status(400).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User fetched successfully", user });
})

/**
 * @desc Update a user
 * @route PUT /api/auth/user
 * @access Private
 */
const updateUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, { name, email, password }, { new: true });
    if (!user) {
        return res.status(400).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User updated successfully", user });
})

module.exports = { register, login, logout, getUser, updateUser };