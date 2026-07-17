const priorityStyles = {
  high: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
  medium: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  low: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
};

export function PriorityBadge({ priority = "medium" }) {
  const key = priority.toLowerCase();
  return (
    <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${priorityStyles[key] || priorityStyles.medium}`}>
      {priority}
    </span>
  );
}

const statusStyles = {
  "to-do": "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  progress: "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300",
  done: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
};

export function StatusBadge({ status = "To-Do" }) {
  const key = status.toLowerCase();
  return (
    <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[key] || statusStyles["to-do"]}`}>
      {status}
    </span>
  );
}
