const asyncHandler = require("../utils/asynchandler");
const jwt = require("jsonwebtoken");

const authenticate = asyncHandler(async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
})

const authorize = (roles) => {
    return asyncHandler(async (req, res, next) => {
        const isAdmin = req.user && req.user.isAdmin === true;
        if (roles.includes("admin") && !isAdmin) {
            return res.status(403).json({ message: "Forbidden: admin access required" });
        }
        next();
    });
};

module.exports = { authenticate, authorize };