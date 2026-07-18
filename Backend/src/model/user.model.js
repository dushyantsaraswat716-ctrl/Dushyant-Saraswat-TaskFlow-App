import mongoose from "mongoose";
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "name is required"],
            trim: true
        },
        email: {
            type: String,
            required: [true, "email require"],
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: function () {
                return !this.googleId;
            },
            minlength: [8, "password must contain 8 character"],
            select: false
        },
        avatar: {
            type: String,
            default: ""
        },
        googleId: {
            type: String,
            default: null,
            select: false
        },
        resetPasswordToken: {
            type: String,
            default: null,
            select: false
        },
        resetPasswordExpire: {
            type: Date,
            default: null,
            select: false
        }
    },
    { timestamps: true }
)

userSchema.pre("save", async function () {
    if (!this.isModified("password") || !this.password) return;
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

userSchema.methods.matchpassword = async function (enteredpassword) {
    if (!this.password) return false;
    const compare = await bcrypt.compare(enteredpassword, this.password)
    return compare;

}

const usermodel = mongoose.model("User", userSchema);

export default usermodel;
