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
        if (!roles.includes(req.user.isAdmin)) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        next();
    })
}

module.exports = { authenticate, authorize };