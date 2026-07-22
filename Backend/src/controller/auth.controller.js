import fs from "fs";
import path from "path";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import User from "../model/user.model.js";
import generateToken from "../utils/generateToken.js";
import asynchandler from "../utils/asynchandler.js";
import sendEmail from "../utils/sendEmail.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const registerUser = asynchandler(async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({
            message: "please enter your username"
        })
    }
    const userExist = await User.findOne({ email })
    if (userExist) {
        return res.status(400).json({
            message: "name is already exist"
        })
    }
    const user = await User.create({
        name,
        email,
        password
    })
    return res.status(201).json({
        message: "account created",
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        token: generateToken(user._id)
    })

})

export const loginUser = asynchandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        return res.status(404).json({
            message: "invalid email"
        })

    }
    const IsMatch = await user.matchpassword(password)
    if (!IsMatch) {
        return res.status(400).json({
            message: "invalid password"
        })
    }
    return res.status(200).json({
        message: "login success",
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        token: generateToken(user._id)
    })
})

export const getMe = asynchandler(async (req, res) => {
    res.status(200).json(req.user)
})

export const uploadAvatar = asynchandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            message: "please select an image to upload"
        })
    }

    const user = await User.findById(req.user.id)
    if (!user) {
        return res.status(404).json({
            message: "user not found"
        })
    }

    if (user.avatar && user.avatar.startsWith("/uploads/")) {
        const oldPath = path.join(process.cwd(), user.avatar)
        fs.unlink(oldPath, () => {})
    }

    user.avatar = `/uploads/${req.file.filename}`
    await user.save()

    return res.status(200).json({
        message: "avatar updated",
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
    })
})

export const updateProfile = asynchandler(async (req, res) => {
    const { name, email } = req.body;

    if (!name && !email) {
        return res.status(400).json({
            message: "please provide name or email to update"
        })
    }

    if (name !== undefined && !name.trim()) {
        return res.status(400).json({
            message: "name cannot be empty"
        })
    }

    let normalizedEmail;
    if (email !== undefined) {
        normalizedEmail = String(email).trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({
                message: "please provide a valid email"
            })
        }
    }

    const user = await User.findById(req.user.id)
    if (!user) {
        return res.status(404).json({
            message: "user not found"
        })
    }

    if (normalizedEmail && normalizedEmail !== user.email) {
        const emailTaken = await User.findOne({ email: normalizedEmail, _id: { $ne: user._id } });
        if (emailTaken) {
            return res.status(409).json({
                message: "email is already in use"
            })
        }
        user.email = normalizedEmail;
    }

    if (name !== undefined) {
        user.name = name.trim();
    }

    await user.save()

    return res.status(200).json({
        message: "profile updated",
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
    })
})

export const changePassword = asynchandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({
            message: "please provide current and new password"
        })
    }

    if (newPassword.length < 8) {
        return res.status(400).json({
            message: "password must contain 8 character"
        })
    }

    const user = await User.findById(req.user.id).select("+password")
    if (!user) {
        return res.status(404).json({
            message: "user not found"
        })
    }

    const isMatch = await user.matchpassword(currentPassword)
    if (!isMatch) {
        return res.status(400).json({
            message: "current password is incorrect"
        })
    }

    user.password = newPassword
    await user.save()

    return res.status(200).json({
        message: "password updated successfully"
    })
})

export const forgotPassword = asynchandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            message: "please provide your email"
        })
    }

    const user = await User.findOne({ email });

    // do not reveal whether the account exists
    if (!user) {
        return res.status(200).json({
            message: "if that email exists, a reset link has been sent"
        })
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save({ validateBeforeSave: false });

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${clientUrl}/reset-password/${rawToken}`;

    const html = `
        <p>Hello ${user.name || ""},</p>
        <p>You requested a password reset for your TaskFlow account.</p>
        <p>Click the link below to reset your password. This link is valid for 15 minutes.</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you did not request this, please ignore this email.</p>
    `;

    try {
        await sendEmail({
            to: user.email,
            subject: "TaskFlow - Password Reset Request",
            html,
        });
    } catch (err) {
        user.resetPasswordToken = null;
        user.resetPasswordExpire = null;
        await user.save({ validateBeforeSave: false });
        return res.status(500).json({
            message: "email could not be sent, please try again later"
        })
    }

    return res.status(200).json({
        message: "if that email exists, a reset link has been sent"
    })
})

export const resetPassword = asynchandler(async (req, res) => {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
        return res.status(400).json({
            message: "please provide new password and confirm password"
        })
    }

    if (password.length < 6) {
        return res.status(400).json({
            message: "password must be at least 6 characters"
        })
    }

    if (password !== confirmPassword) {
        return res.status(400).json({
            message: "passwords do not match"
        })
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() },
    }).select("+resetPasswordToken +resetPasswordExpire");

    if (!user) {
        return res.status(400).json({
            message: "reset link is invalid or has expired"
        })
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    return res.status(200).json({
        message: "password reset successful"
    })
})

export const googleAuth = asynchandler(async (req, res) => {
    const { credential } = req.body;

    if (!credential) {
        return res.status(400).json({
            message: "google credential is required"
        })
    }

    let payload;
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
    } catch (err) {
        return res.status(401).json({
            message: "invalid google credential"
        })
    }

    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
        return res.status(400).json({
            message: "google account has no email"
        })
    }

    let user = await User.findOne({ email });

    if (user) {
        if (!user.googleId) {
            user.googleId = googleId;
            if (!user.avatar && picture) user.avatar = picture;
            await user.save({ validateBeforeSave: false });
        }
    } else {
        user = await User.create({
            name: name || email.split("@")[0],
            email,
            googleId,
            avatar: picture || "",
        });
    }

    return res.status(200).json({
        message: "login success",
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        token: generateToken(user._id)
    })
})
