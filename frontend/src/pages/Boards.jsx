import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiPlus, FiTrello } from "react-icons/fi";
import { AnimatePresence } from "framer-motion";
import { fetchTasks, toggleTaskComplete, removeTask } from "../redux/slices/taskSlice";
import { getDueDateTime } from "../utils/format";
import TaskCard from "../components/TaskCard";
import DueTaskCard from "../components/DueTaskCard";
import TaskFormModal from "../components/TaskFormModal";
import TaskDetailsDrawer from "../components/TaskDetailsDrawer";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";
import useToast from "../hooks/useToast";

const COLUMNS = [
  { key: "To-Do", title: "To-Do" },
  { key: "Progress", title: "In Progress" },
  { key: "Done", title: "Done" },
];

export default function Boards() {
  const dispatch = useDispatch();
  const toast = useToast();
  const { items: tasks, status } = useSelector((s) => s.tasks);

  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [openTask, setOpenTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);

  useEffect(() => {
    if (tasks.length === 0) dispatch(fetchTasks({}));
  }, [dispatch, tasks.length]);

  
  const columns = useMemo(() => {
    return COLUMNS.map((col) => ({
      ...col,
      tasks: tasks.filter((t) =>
        col.key === "Done" ? t.status === "Done" || t.completed : t.status === col.key && !t.completed
      ),
    }));
  }, [tasks]);

  
  const dueTasks = useMemo(() => {
    return tasks
      .filter((t) => t.dueDate)
      .map((t) => ({ task: t, due: getDueDateTime(t) }))
      .sort((a, b) => a.due - b.due)
      .map((entry) => entry.task);
  }, [tasks]);

  const handleToggle = async (id) => {
    const result = await dispatch(toggleTaskComplete(id));
    if (toggleTaskComplete.rejected.match(result)) toast.error(result.payload || "Could not update task");
  };

  const handleDelete = async () => {
    const result = await dispatch(removeTask(deletingTask._id));
    if (removeTask.fulfilled.match(result)) {
      toast.success("Task deleted");
      setDeletingTask(null);
      setOpenTask(null);
    } else {
      toast.error(result.payload || "Could not delete task");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Boards</h1>
          <p className="mt-1 text-sm text-slate-400">Your tasks organized by status.</p>
        </div>
        <button
          onClick={() => {
            setEditingTask(null);
            setFormOpen(true);
          }}
          className="btn-primary"
        >
          <FiPlus className="h-4 w-4" /> New Task
        </button>
      </div>

      {status === "loading" && tasks.length === 0 ? (
        <Loader />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={FiTrello}
          title="No tasks yet"
          description="Create a task to see it appear on your board."
          action={
            <button
              onClick={() => {
                setEditingTask(null);
                setFormOpen(true);
              }}
              className="btn-primary"
            >
              <FiPlus className="h-4 w-4" /> New Task
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {columns.map((col) => (
            <div key={col.key} className="card flex max-h-[75vh] flex-col p-4">
              <div className="mb-3 flex shrink-0 items-center justify-between">
                <h2 className="font-bold text-slate-800 dark:text-white">{col.title}</h2>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  {col.tasks.length}
                </span>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                <AnimatePresence initial={false}>
                  {col.tasks.length === 0 ? (
                    <p className="py-6 text-center text-sm text-slate-400">No tasks</p>
                  ) : (
                    col.tasks.map((task) => (
                      <TaskCard
                        key={task._id}
                        task={task}
                        compact
                        onToggle={handleToggle}
                        onOpen={setOpenTask}
                        onEdit={(t) => {
                          setEditingTask(t);
                          setFormOpen(true);
                        }}
                        onDelete={setDeletingTask}
                      />
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}

      {dueTasks.length > 0 && (
        <div className="w-full">
          <h2 className="mb-3 font-bold text-slate-800 dark:text-white">Due Tasks</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            <AnimatePresence initial={false}>
              {dueTasks.map((task) => (
                <DueTaskCard key={task._id} task={task} onOpen={setOpenTask} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      <TaskFormModal open={formOpen} onClose={() => setFormOpen(false)} task={editingTask} />

      <TaskDetailsDrawer
        task={openTask}
        onClose={() => setOpenTask(null)}
        onToggle={handleToggle}
        onEdit={(t) => {
          setOpenTask(null);
          setEditingTask(t);
          setFormOpen(true);
        }}
        onDelete={setDeletingTask}
      />

      <ConfirmDialog
        open={Boolean(deletingTask)}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleDelete}
        title="Delete task"
        message={`Are you sure you want to delete "${deletingTask?.title}"? This can't be undone.`}
      />
    </div>
  );
}
