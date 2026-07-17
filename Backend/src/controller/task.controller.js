import Task from "../model/Task.model.js"
import asynchandler from "../utils/asynchandler.js";

const findownedtask = async (taskId, userId, res) => {
    const task = await Task.findById(taskId);
    if (!task) {
        res.status(404);
        throw new Error("Task not found");
    }
    if (task.user.toString() !== userId) {
        res.status(403);
        throw new Error("Not authorized to access this task");
    }
    return task;
};

export const createTask = asynchandler(async (req, res) => {
    const { title, description, dueDate, dueTime, reminder, priority, category, status } = req.body;
    const task = await Task.create({
        title,
        description,
        dueDate,
        dueTime,
        reminder,
        priority,
        category,
        status,
        user: req.user.id,
    });
    res.status(201).json(task);
});
export const getTasks = asynchandler(async (req, res) => {
    const { status, priority, search, sort } = req.query;

    const query = { user: req.user.id };
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) query.title = { $regex: search, $options: "i" };
    let sortBy = "-createdAt";
    if (sort === "oldest") sortBy = "createdAt";
    if (sort === "dueDate") sortBy = "dueDate";
    if (sort === "priority") sortBy = "priority";

    const tasks = await Task.find(query).sort(sortBy);

    res.status(200).json({ count: tasks.length, tasks });
});


export const getTask = asynchandler(async (req, res) => {
    const task = await findownedtask(req.params.id, req.user.id, res);
    res.status(200).json(task);
});


export const updateTask = asynchandler(async (req, res) => {
    const task = await findownedtask(req.params.id, req.user.id, res);
    Object.assign(task, req.body);
    await task.save();
    res.status(200).json(task);

});


export const deleteTask = asynchandler(async (req, res) => {
    const task = await findownedtask(req.params.id, req.user.id, res);
    await task.deleteOne();
    res.status(200).json({ message: "Task removed", id: req.params.id });

});

  
export const toggleTask = asynchandler(async (req, res) => {
    const task = await findownedtask(req.params.id, req.user.id, res);

    task.completed = !task.completed;

    await task.save();

    res.status(200).json(task);
});

export const getstats = asynchandler(async (req, res) => {
    const userId = req.user.id;


    const total = await Task.countDocuments({ user: userId });
    const completed = await Task.countDocuments({ user: userId, completed: true });
    const pending = total - completed;
    const overdue = await Task.countDocuments({
        user: userId,
        completed: false,
        dueDate: { $lt: new Date() },
    });
    res.status(200).json({ total, completed, pending, overdue });
});
