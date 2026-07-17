const notFound = (req, res, next)=>{
    const error = new Error(`not Found - ${req.originalUrl}`);
    res.status(404);
        next(error);
};
export default notFound;