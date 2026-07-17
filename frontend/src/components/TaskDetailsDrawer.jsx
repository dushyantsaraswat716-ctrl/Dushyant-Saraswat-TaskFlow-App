import { AnimatePresence, motion } from "framer-motion";
import { FiX, FiEdit2, FiTrash2, FiCalendar, FiFlag, FiTag, FiClock } from "react-icons/fi";
import { PriorityBadge, StatusBadge } from "./Badges";
import { formatDate, timesAgo } from "../utils/format";

export default function TaskDetailsDrawer({ task, onClose, onEdit, onDelete, onToggle }) {
  return (
    <AnimatePresence>
      {task && (
        <div className="fixed inset-0 z-[80] flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.25 }}
            className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl dark:bg-slate-900"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-800 dark:text-white">Task details</h3>
              <button onClick={onClose} className="btn-ghost !p-2">
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className={`text-xl font-bold ${task.completed ? "text-slate-400 line-through" : "text-slate-800 dark:text-white"}`}>
                  {task.title}
                </h2>
                <StatusBadge status={task.status} />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{task.description}</p>

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                  <FiFlag className="h-4 w-4" /> Priority <PriorityBadge priority={task.priority} />
                </div>
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                  <FiTag className="h-4 w-4" /> Board <span className="font-medium text-slate-700 dark:text-slate-200">{task.category || "General"}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                  <FiCalendar className="h-4 w-4" /> Due <span className="font-medium text-slate-700 dark:text-slate-200">{formatDate(task.dueDate)}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                  <FiClock className="h-4 w-4" /> Updated <span className="font-medium text-slate-700 dark:text-slate-200">{timesAgo(task.updatedAt)}</span>
                </div>
              </div>

              <button onClick={() => onToggle(task._id)} className="btn-secondary mt-6 w-full">
                Mark as {task.completed ? "incomplete" : "complete"}
              </button>
            </div>

            <div className="flex gap-3 border-t border-slate-100 px-6 py-4 dark:border-slate-800">
              <button onClick={() => onEdit(task)} className="btn-secondary flex-1">
                <FiEdit2 className="h-4 w-4" /> Edit
              </button>
              <button onClick={() => onDelete(task)} className="btn-primary flex-1 !bg-red-600 !shadow-none hover:!bg-red-700">
                <FiTrash2 className="h-4 w-4" /> Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
