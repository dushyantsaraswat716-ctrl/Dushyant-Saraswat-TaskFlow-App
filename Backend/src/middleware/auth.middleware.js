import jwt from "jsonwebtoken"
import User from "../model/user.model.js"
import asynchandler from "../utils/asynchandler.js"

export const protect = asynchandler(async (req, res, next) => {
    let token
    if (req.headers.authorization?.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decode = jwt.verify(token, process.env.JWT_SECRET_KEY)
            req.user = await User.findById(decode.id).select("-password")
            if (!req.user) {
                return res.status(401).json({
                    message: "invalid token"
                })
            }
            next()
        }
        catch (err) {
            res.status(401).json({
                message: "not authorized, token failed"
            })
        }
    }
    else {
        return res.status(401).json({
            message: "not authorized, no token"
        })
    }
})
