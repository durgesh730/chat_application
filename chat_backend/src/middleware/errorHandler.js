const ErrorResponse = require("../utils/ErrorResponse");

module.exports = (err, req, res, next) => {
    let error = { ...err, message: err.message, errors: err.errors };

    // Log error to console for development
    console.log(err);

    // Handle specific Mongoose errors
    if (err.name === "CastError") {
        const message =
            err.kind === "ObjectId"
                ? `No resource found for the requested id: ${err.value}`
                : `We looked everywhere but didn't find any matching resources`;
        error = new ErrorResponse(message, err.kind === "ObjectId" ? 404 : 400);
    }

    // Handle MongoDB duplication errors
    if (err.name === "MongoError") {
        if (err.code === 11000) {
            const [duplicationKey] = Object.keys(err.keyPattern);
            const duplicationValue = err.keyValue[duplicationKey];
            const message = `This "${duplicationValue}" ${duplicationKey} already exists. Please choose another ${duplicationKey} for this resource.`;
            error = new ErrorResponse(message, 400);
        } else if (err.keyPattern?.bootcamp && err.keyPattern?.user) {
            const message = `You already added a review to this bootcamp`;
            error = new ErrorResponse(message, 403);
        } else {
            error = new ErrorResponse(`Your request has some bad parameters. ${err.message}`, 400);
        }
    }

    // Handle Mongoose validation errors
    if (err.name === "ValidationError") {
        const message = Object.values(err.errors)
            .map(it => it.message)
            .join(" ");
        error = new ErrorResponse(message, 400);
    }

    // Handle Multer file size limit error
    if (err.name === "MulterError" && err.code === "LIMIT_FILE_SIZE") {
        error = new ErrorResponse("Please upload an image with a smaller file size. Max Size Limit 2MB", 400);
    }

    // Handle JWT and Type errors
    if (err.name === "JsonWebTokenError") {
        error = new ErrorResponse("Session Expired. Please log in again.", 401);
    } else if (err.name === "TypeError") {
        error = new ErrorResponse("An unknown error occurred while processing your request. Please try again later.", 500);
    }

    // Send the final error response
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message?.trim() || "Server Error",
        errors: error.errors || {},
    });
};

