import { useEffect, useMemo, useState } from "react";
import { FiMenu, FiBell, FiCheckCircle, FiAlertTriangle, FiClock } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Avatar from "./Avatar";
import { toggleSidebar } from "../redux/slices/uiSlice";
import { setFilter, fetchTasks } from "../redux/slices/taskSlice";
import { timesAgo } from "../utils/format";
import useTaskReminders from "../hooks/useTaskReminders";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const { items: tasks } = useSelector((s) => s.tasks);
  const [query, setQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [readIds, setReadIds] = useState(() => new Set());
  const reminderNotifications = useTaskReminders(tasks);

  useEffect(() => {
    if (tasks.length === 0) dispatch(fetchTasks({}));
  }, [dispatch, tasks.length]);

  const submitSearch = (e) => {
    e.preventDefault();
    dispatch(setFilter({ search: query }));
    navigate("/tasks");
  };

  const notifications = useMemo(() => {
    const now = new Date();
    const todayKey = now.toDateString();
    const list = [];

    tasks.forEach((t) => {
      if (t.completed) {
        list.push({
          id: `completed-${t._id}`,
          type: "completed",
          message: `You completed "${t.title}".`,
          date: t.updatedAt || t.createdAt,
        });
        return;
      }
      if (!t.dueDate) return;
      const due = new Date(t.dueDate);
      if (Number.isNaN(due.getTime())) return;
      if (due.toDateString() === todayKey) {
        list.push({
          id: `due-${t._id}`,
          type: "due",
          message: `Task "${t.title}" is due today.`,
          date: t.dueDate,
        });
      } else if (due < now) {
        list.push({
          id: `overdue-${t._id}`,
          type: "overdue",
          message: `Task "${t.title}" is overdue.`,
          date: t.dueDate,
        });
      }
    });

    return [...reminderNotifications, ...list].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [tasks, reminderNotifications]);

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  const handleBellClick = () => {
    setNotifOpen((v) => {
      const next = !v;
      if (next && notifications.length) {
      
        setTimeout(() => {
          setReadIds((prev) => new Set([...prev, ...notifications.map((n) => n.id)]));
        }, 700);
      }
      return next;
    });
  };

  const notifIcon = (type) => {
    if (type === "completed") return <FiCheckCircle className="h-4 w-4 text-green-600" />;
    if (type === "overdue") return <FiAlertTriangle className="h-4 w-4 text-red-600" />;
    if (type === "reminder") return <FiBell className="h-4 w-4 text-brand-600" />;
    return <FiClock className="h-4 w-4 text-amber-600" />;
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-100 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 sm:px-6">
      <button onClick={() => dispatch(toggleSidebar())} className="btn-ghost !p-2 lg:hidden">
        <FiMenu className="h-5 w-5" />
      </button>

    <div>
      
    </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative">
          <button
            onClick={handleBellClick}
            className="btn-ghost relative !p-2.5"
            aria-label="Notifications"
          >
            <FiBell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white dark:ring-slate-900">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 animate-slideUp rounded-2xl border border-slate-100 bg-white p-3 shadow-card dark:border-slate-800 dark:bg-slate-900">
              <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Notifications</p>
              {notifications.length === 0 ? (
                <p className="px-1 py-2 text-sm text-slate-400">You're all caught up.</p>
              ) : (
                <div className="max-h-80 space-y-1.5 overflow-y-auto pr-1">
                  {notifications.map((n) => {
                    const unread = !readIds.has(n.id);
                    return (
                      <div
                        key={n.id}
                        className={`flex items-start gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                          unread
                            ? "bg-brand-50 dark:bg-brand-500/10"
                            : "bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60"
                        }`}
                      >
                        <span className="mt-0.5 shrink-0">{notifIcon(n.type)}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-slate-700 dark:text-slate-200">{n.message}</p>
                          <p className="mt-0.5 text-xs text-slate-400">{timesAgo(n.date)}</p>
                        </div>
                        {unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-600" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
        <button onClick={() => navigate("/profile")} aria-label="Profile">
          <Avatar name={user?.name} src={user?.avatar} />
        </button>
      </div>
    </header>
  );
}
