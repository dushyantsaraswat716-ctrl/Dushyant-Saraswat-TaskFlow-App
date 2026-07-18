import express from "express"
import {getMe,loginUser,registerUser,uploadAvatar,changePassword,forgotPassword,resetPassword,googleAuth } from "../controller/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import upload from "../uploads/upload.middleware.js";

const router = express.Router();

const avatarUpload = (req, res, next) => {
    upload.single("avatar")(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        next();
    });
};

router.post("/register",registerUser);
router.post("/login",loginUser);
router.get("/me",protect,getMe);
router.post("/avatar",protect,avatarUpload,uploadAvatar);
router.put("/change-password",protect,changePassword);
router.post("/forgot-password",forgotPassword);
router.post("/reset-password/:token",resetPassword);
router.post("/google",googleAuth);


export default router
