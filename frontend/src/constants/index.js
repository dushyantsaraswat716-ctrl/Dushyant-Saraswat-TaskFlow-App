export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

export const TOKEN_KEY = "taskflow_token";
export const USER_KEY = "taskflow_user";
export const REMEMBER_KEY = "taskflow_remember";
export const PREFS_KEY = "taskflow_prefs";

export const TASK_PRIORITIES = ["low", "medium", "high"];
export const TASK_STATUSES = ["To-Do", "Progress", "Done"];

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "dueDate", label: "Due date" },
  { value: "priority", label: "Priority" },
];

export const REMINDER_OPTIONS = [
  { value: "none", label: "No reminder", minutesBefore: null },
  { value: "at", label: "At due time", minutesBefore: 0 },
  { value: "5", label: "5 minutes before", minutesBefore: 5 },
  { value: "10", label: "10 minutes before", minutesBefore: 10 },
  { value: "30", label: "30 minutes before", minutesBefore: 30 },
  { value: "60", label: "1 hour before", minutesBefore: 60 },
];
