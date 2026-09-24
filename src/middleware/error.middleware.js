export const errorHandler = (error, req, res, next) => {
    console.log("Error:", error);

    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
        success: false,
        message: error.message || "Internal server error"
    });
};