import { motion } from "framer-motion";
import { formatDate, formatTime, getRemainingTime } from "../utils/format";

export default function DueTaskCard({ task, onOpen }) {
  const { label, overdue } = getRemainingTime(task);

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      onClick={() => onOpen(task)}
      className={`card flex w-64 shrink-0 flex-col gap-2 p-4 text-left transition-shadow hover:shadow-card ${
        overdue ? "border border-red-200 dark:border-red-500/30" : ""
      }`}
    >
      <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{task.title}</p>
      <p className="line-clamp-2 text-sm text-slate-400">{task.description}</p>
      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
        <span className="rounded-full bg-slate-100 px-2 py-1 font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          {formatDate(task.dueDate)}
        </span>
        {task.dueTime && (
          <span className="rounded-full bg-slate-100 px-2 py-1 font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            {formatTime(task.dueTime)}
          </span>
        )}
        <span
          className={`rounded-full px-2 py-1 font-medium ${
            overdue
              ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
              : "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
          }`}
        >
          {label}
        </span>
      </div>
    </motion.button>
  );
}
