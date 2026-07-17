import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            default: ""
        },
        user: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true
        },
        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium"
        },
        category: {
            type: String,
            default: "General",
            trim: true
        },
        status: {
            type: String,
            enum: ["To-Do", "Progress", "Done"],
            default: "To-Do"
        },
        completed: {
            type: Boolean,
            default: false
        },
        dueDate: {
            type: Date
        },
        dueTime: {
            type: String,
            default: ""
        },
        reminder: {
            type: String,
            enum: ["none", "at", "5", "10", "30", "60"],
            default: "none"
        }
    },
    { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);

export default Task;
