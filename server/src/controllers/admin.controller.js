const asyncHandler = require("../utils/asynchandler");
const User = require("../models/user.model");

/**
 * @desc Get all users (Admin only)
 * @route GET /api/admin/users
 * @access Private/Admin
 */
const getUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const users = await User.find({})
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));
    const total = await User.countDocuments();
    res.status(200).json({ users, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
});

/**
 * @desc Ban user (Admin only)
 * @route PATCH /api/admin/users/:id/ban
 * @access Private/Admin
 */
const banUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, { isBanned: true }, { new: true }).select("-password");
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User banned", user });
});

/**
 * @desc Unban user (Admin only)
 * @route PATCH /api/admin/users/:id/unban
 * @access Private/Admin
 */
const unbanUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, { isBanned: false }, { new: true }).select("-password");
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User unbanned", user });
});

/**
 * @desc Delete user (Admin only)
 * @route DELETE /api/admin/users/:id
 * @access Private/Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted" });
});

module.exports = { getUsers, banUser, unbanUser, deleteUser };
