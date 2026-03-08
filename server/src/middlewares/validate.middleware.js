const { validationResult } = require("express-validator");

/**
 * Middleware that uses express-validator's validationResult(req) to collect errors
 * from the validation chain and respond with 400 if any failed.
 * Place after the validation chain on the route: e.g. route(validators, validate, controller).
 */
const validate = (req, res, next) => {
    const result = validationResult(req);

    if (result.isEmpty()) {
        return next();
    }

    const extracted = result.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg,
    }));

    return res.status(400).json({
        message: "Validation failed",
        errors: extracted,
    });
};

module.exports = { validate };
