import fs from "fs";
import path from "path";
import User from "../model/user.model.js";
import generateToken from "../utils/generateToken.js";
import asynchandler from "../utils/asynchandler.js";

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
