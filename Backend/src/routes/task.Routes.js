import express from "express";
const router = express.Router();


import {
    createTask,
    getTasks,
    getTask,
    updateTask,
    deleteTask,
    toggleTask,
    getstats
} from "../controller/task.controller.js";

import { protect } from "../middleware/auth.middleware.js";

router.use(protect);

router.get("/stats", getstats);


router.route("/").get(getTasks).post(createTask);
router.route("/:id").get(getTask).put(updateTask).delete(deleteTask);
router.route("/:id/toggle").patch(toggleTask);

export default router;
