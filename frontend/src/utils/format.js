export const formatDate = (date) => {
  if (!date) return "No due date";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "No due date";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

export const isOverdue = (task) => {
  if (!task?.dueDate || task.completed) return false;
  return new Date(task.dueDate) < new Date();
};

export const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "U";

export const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

export const timesAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [name, secs] of units) {
    const value = Math.floor(seconds / secs);
    if (value >= 1) return `${value} ${name}${value > 1 ? "s" : ""} ago`;
  }
  return "just now";
};

export const priorityRank = { high: 0, medium: 1, low: 2 };

export const getDueDateTime = (task) => {
  if (!task?.dueDate) return null;
  const d = new Date(task.dueDate);
  if (Number.isNaN(d.getTime())) return null;
  if (task.dueTime) {
    const [h, m] = task.dueTime.split(":").map(Number);
    if (!Number.isNaN(h) && !Number.isNaN(m)) {
      d.setHours(h, m, 0, 0);
      return d;
    }
  }
  d.setHours(23, 59, 0, 0);
  return d;
};

export const formatTime = (dueTime) => {
  if (!dueTime) return "";
  const [h, m] = dueTime.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return "";
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
};

export const getRemainingTime = (task) => {
  const due = getDueDateTime(task);
  if (!due) return { label: "No due date", overdue: false };
  const diffMs = due.getTime() - Date.now();
  const overdue = diffMs < 0;
  const abs = Math.abs(diffMs);
  const days = Math.floor(abs / 86400000);
  const hours = Math.floor((abs % 86400000) / 3600000);
  const minutes = Math.floor((abs % 3600000) / 60000);

  let text = "";
  if (days > 0) text = `${days}d ${hours}h`;
  else if (hours > 0) text = `${hours}h ${minutes}m`;
  else text = `${minutes}m`;

  return { label: overdue ? `Overdue by ${text}` : `${text} left`, overdue };
};