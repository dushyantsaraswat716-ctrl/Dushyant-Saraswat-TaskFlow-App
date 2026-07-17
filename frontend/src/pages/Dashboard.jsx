import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { FiList, FiCheckCircle, FiClock, FiAlertTriangle, FiPlus, FiTrello, FiArrowRight } from "react-icons/fi";
import { fetchStats } from "../redux/slices/dashboardSlice";
import { fetchTasks } from "../redux/slices/taskSlice";
import StatCard from "../components/StatCard";
import ProgressCircle from "../components/ProgressCircle";
import StatusPieChart from "../components/charts/StatusPieChart";
import WeeklyProgressChart from "../components/charts/WeeklyProgressChart";
import EmptyState from "../components/EmptyState";
import { PriorityBadge } from "../components/Badges";
import { formatDate, greeting, isOverdue } from "../utils/format";
import Loader from "../components/Loader";

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const { stats, status: statsStatus } = useSelector((s) => s.dashboard);
  const { items: tasks, status: tasksStatus } = useSelector((s) => s.tasks);

  useEffect(() => {
    dispatch(fetchStats());
    dispatch(fetchTasks({ sort: "dueDate" }));
  }, [dispatch]);

  const upcoming = [...tasks]
    .filter((t) => !t.completed)
    .sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0))
    .slice(0, 5);

  const recentActivity = [...tasks]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5);

  const boards = [...new Set(tasks.map((t) => t.category || "General"))].slice(0, 4);

  const completionPercent = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
  const loading = statsStatus === "loading" && tasksStatus === "loading";

  if (loading && tasks.length === 0) return <Loader full />;

  return (
    <div className="space-y-6">
      <div className="card flex flex-col justify-between gap-4 bg-gradient-to-br from-brand-600 to-brand-800 p-6 text-white sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold">
            {greeting()}, {user?.name?.split(" ")[0] || "there"} 👋
          </h1>
          <p className="mt-1 text-brand-100">
            {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <button onClick={() => navigate("/tasks")} className="btn-secondary !bg-white/15 !border-white/20 !text-white hover:!bg-white/25">
          <FiPlus className="h-4 w-4" /> New task
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

        <StatCard
          label="Total"
          value={stats.total}
          color="indigo"
          icon={() => <FiList className="text-indigo-500" />}
        />

        <StatCard
          label="Completed"
          value={stats.completed}
          color="emerald"
          icon={() => <FiCheckCircle className="text-emerald-500" />}
        />

        <StatCard
          label="Pending"
          value={stats.pending}
          color="amber"
          icon={() => <FiClock className="text-amber-500" />}
        />

        <StatCard
          label="Overdue"
          value={stats.overdue}
          color="red"
          icon={() => <FiAlertTriangle className="text-red-500" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800 dark:text-white">Upcoming tasks</h2>
            <Link to="/tasks" className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">
              View all <FiArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <EmptyState icon={FiCheckCircle} title="Nothing upcoming" description="You're all caught up on deadlines." />
          ) : (
            <ul className="space-y-1">
              {upcoming.map((t) => (
                <li key={t._id} className="flex items-center justify-between rounded-xl px-3 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60">
                  <div className="flex items-center gap-3">
                    <span className={`h-2 w-2 rounded-full ${isOverdue(t) ? "bg-red-500" : "bg-amber-400"}`} />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{t.title}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <PriorityBadge priority={t.priority} />
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      {formatDate(t.dueDate)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card flex flex-col items-center justify-center gap-4 p-6">
          <h2 className="self-start text-base font-bold text-slate-800 dark:text-white">Overall progress</h2>
          <ProgressCircle percent={completionPercent} />
          <div className="grid w-full grid-cols-2 gap-3 pt-2">
            <button onClick={() => navigate("/tasks")} className="btn-secondary !flex-col !gap-1.5 !py-3 text-xs">
              <FiPlus className="h-4 w-4" /> New task
            </button>
            <button onClick={() => navigate("/boards")} className="btn-secondary !flex-col !gap-1.5 !py-3 text-xs">
              <FiTrello className="h-4 w-4" /> New board
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="mb-4 text-base font-bold text-slate-800 dark:text-white">Task status breakdown</h2>
          <StatusPieChart tasks={tasks} />
        </div>
        <div className="card p-6">
          <h2 className="mb-4 text-base font-bold text-slate-800 dark:text-white">Weekly progress</h2>
          <WeeklyProgressChart tasks={tasks} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="mb-4 text-base font-bold text-slate-800 dark:text-white">Recent activity</h2>
          {recentActivity.length === 0 ? (
            <EmptyState icon={FiClock} title="No activity yet" description="Create a task to see it here." />
          ) : (
            <ul className="space-y-3">
              {recentActivity.map((t) => (
                <li key={t._id} className="flex items-center gap-3 text-sm">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${t.completed ? "bg-emerald-500" : "bg-brand-500"}`} />
                  <span className="text-slate-500 dark:text-slate-400">
                    <span className="font-medium text-slate-700 dark:text-slate-200">{t.title}</span>{" "}
                    {t.completed ? "was completed" : t.createdAt === t.updatedAt ? "was created" : "was updated"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800 dark:text-white">Latest boards</h2>
            <Link to="/boards" className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">
              View all <FiArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {boards.length === 0 ? (
            <EmptyState icon={FiTrello} title="No boards yet" description="Boards are grouped from task categories." />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {boards.map((b) => (
                <Link
                  key={b}
                  to="/boards"
                  className="rounded-xl border border-slate-100 p-4 transition-colors hover:border-brand-200 hover:bg-brand-50/40 dark:border-slate-800 dark:hover:bg-brand-500/5"
                >
                  <p className="truncate text-sm font-semibold text-slate-700 dark:text-slate-200">{b}</p>
                  <p className="mt-1 text-xs text-slate-400">{tasks.filter((t) => (t.category || "General") === b).length} tasks</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
