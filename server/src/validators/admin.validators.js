const { param } = require("express-validator");

const userIdParam = param("id")
    .isMongoId()
    .withMessage("Invalid user ID");

module.exports = { userIdParam };
