const errorHandler = (err, req, res, next) => {

    let statuscode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;

    if (err.name === "CastError" && err.kind === "ObjectId") {
        statuscode = 404;
        message = "resourse not found";
    }

    if (err.name === "ValidationError") {
        statuscode = 400;
        message = Object.values(err.errors)
            .map((e) => e.message)
            .join(", ");
    }

    if (err.code === 11000) {
        statuscode = 400;
        message = `duplicate value for ${Object.keys(err.keyValue).join(", ")}`;
    }

    res.status(statuscode).json({
        message,

        stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    });

};


export default errorHandler;
