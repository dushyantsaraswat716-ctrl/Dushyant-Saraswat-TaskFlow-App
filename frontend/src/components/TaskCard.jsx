import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { motion } from "framer-motion";
import { PriorityBadge } from "./Badges";
import { formatDate, isOverdue } from "../utils/format";

export default function TaskCard({ task, onToggle, onEdit, onDelete, onOpen, compact = false }) {
  const overdue = isOverdue(task);

  if (compact) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        className="card flex items-start gap-3 p-4 transition-shadow hover:shadow-card"
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(task._id);
          }}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${task.completed ? "border-brand-600 bg-brand-600" : "border-slate-300 dark:border-slate-600"
            }`}
          aria-label="Toggle complete"
        >
          {task.completed && (
            <svg viewBox="0 0 12 12" className="h-3 w-3 fill-none stroke-white stroke-[2.5]">
              <path d="M2 6l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
        <button onClick={() => onOpen(task)} className="min-w-0 flex-1 text-left">
          <p className={`truncate text-sm font-semibold ${task.completed ? "text-slate-400 line-through" : "text-slate-800 dark:text-slate-100"}`}>
            {task.title}
          </p>
          <p className="mt-0.5 line-clamp-2 text-sm text-slate-400">{task.description}</p>
        </button>
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="btn-ghost !p-2"
            aria-label="Edit task"
          >
            <FiEdit2 className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task);
            }}
            className="btn-ghost !p-2 hover:!text-red-600"
            aria-label="Delete task"
          >
            <FiTrash2 className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="card flex flex-col gap-3 p-4 transition-shadow hover:shadow-card sm:flex-row sm:items-center sm:justify-between sm:gap-4"
    >
      <div className="flex flex-1 items-start gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(task._id);
          }}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${task.completed ? "border-brand-600 bg-brand-600" : "border-slate-300 dark:border-slate-600"
            }`}
          aria-label="Toggle complete"
        >
          {task.completed && (
            <svg viewBox="0 0 12 12" className="h-3 w-3 fill-none stroke-white stroke-[2.5]">
              <path d="M2 6l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
        <button onClick={() => onOpen(task)} className="min-w-0 flex-1 text-left">
          <p className={`truncate text-sm font-semibold ${task.completed ? "text-slate-400 line-through" : "text-slate-800 dark:text-slate-100"}`}>
            {task.title}
          </p>
          <p className="mt-0.5 truncate text-sm text-slate-400">{task.description}</p>
        </button>
      </div>

      <button>
        <div className="mt-2 flex items-center gap-2">
          <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-600">
            {task.category || "General"}
          </span>
        </div>
      </button>
        <span
      className={`rounded-full px-2 py-1 text-xs font-medium ${
        task.completed
          ? "bg-green-100 text-green-700"
          : task.status === "In Progress"
          ? "bg-yellow-100 text-yellow-700"
          : "bg-gray-100 text-gray-700"
      }`}
    >
      {task.completed
        ? "✅ Done"
        : task.status === "Progress"
        ? "⏳ In Progress"
        : "📝 To-Do"}
    </span>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <PriorityBadge priority={task.priority} />
        <span
          className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${overdue ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
            }`}
        >
          {formatDate(task.dueDate)}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="btn-ghost !p-2"
            aria-label="Edit task"
          >
            <FiEdit2 className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task);
            }}
            className="btn-ghost !p-2 hover:!text-red-600"
            aria-label="Delete task"
          >
            <FiTrash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
