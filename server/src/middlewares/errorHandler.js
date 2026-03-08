/**
 * Global error handler: always respond with JSON so the frontend never gets HTML error pages.
 */
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || err.response?.status || 500;
    const message = err.response?.data?.status_message
        || err.response?.data?.message
        || err.message
        || "Something went wrong";

    console.error("[Error]", err.code || err.name, message, err.message);

    res.status(statusCode).json({
        message: message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};

module.exports = errorHandler;
