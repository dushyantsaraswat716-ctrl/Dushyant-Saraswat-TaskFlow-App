import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiPlus, FiSearch, FiInbox } from "react-icons/fi";
import { fetchTasks, setFilter, toggleTaskComplete, removeTask } from "../redux/slices/taskSlice";
import { SORT_OPTIONS, TASK_PRIORITIES, TASK_STATUSES } from "../constants";
import useDebounce from "../hooks/useDebounce";
import useToast from "../hooks/useToast";
import TaskCard from "../components/TaskCard";
import TaskFormModal from "../components/TaskFormModal";
import TaskDetailsDrawer from "../components/TaskDetailsDrawer";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import Pagination from "../components/Pagination";
import Loader from "../components/Loader";
import { AnimatePresence } from "framer-motion";

const PAGE_SIZE = 6;

export default function Tasks() {
  const dispatch = useDispatch();
  const toast = useToast();
  const { items: tasks, status, filters } = useSelector((s) => s.tasks);

  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebounce(searchInput, 400);

  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [openTask, setOpenTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(setFilter({ search: debouncedSearch }));
  }, [debouncedSearch]);

  useEffect(() => {
    dispatch(fetchTasks({ status: filters.status, priority: filters.priority, search: filters.search, sort: filters.sort }));
    setPage(1);
  }, [dispatch, filters.status, filters.priority, filters.search, filters.sort]);

  const boards = useMemo(() => [...new Set(tasks.map((t) => t.category || "General"))], [tasks]);

  const visibleTasks = useMemo(() => {
    let list = tasks;
    if (filters.board) list = list.filter((t) => (t.category || "General") === filters.board);
    return list;
  }, [tasks, filters.board]);

  const totalPages = Math.max(1, Math.ceil(visibleTasks.length / PAGE_SIZE));
  const paginatedTasks = visibleTasks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">My Tasks</h1>
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

     
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <div className="relative flex-1 sm:min-w-[220px]">
          <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search tasks..."
            className="input-field pl-10"
          />
        </div>
        <select
          value={filters.status}
          onChange={(e) => dispatch(setFilter({ status: e.target.value }))}
          className="input-field sm:w-40"
        >
          <option value="">All status</option>
          {TASK_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={filters.priority}
          onChange={(e) => dispatch(setFilter({ priority: e.target.value }))}
          className="input-field capitalize sm:w-40"
        >
          <option value="">All priority</option>
          {TASK_PRIORITIES.map((p) => (
            <option key={p} value={p} className="capitalize">
              {p}
            </option>
          ))}
        </select>
        <select
          value={filters.board}
          onChange={(e) => dispatch(setFilter({ board: e.target.value }))}
          className="input-field sm:w-40"
        >
          <option value="">All boards</option>
          {boards.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        <select
          value={filters.sort}
          onChange={(e) => dispatch(setFilter({ sort: e.target.value }))}
          className="input-field sm:w-40"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      
      {status === "loading" && tasks.length === 0 ? (
        <Loader />
      ) : paginatedTasks.length === 0 ? (
        <EmptyState
          icon={FiInbox}
          title="No tasks found"
          description="Try adjusting your filters, or create a new task to get started."
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
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {paginatedTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onToggle={handleToggle}
                onOpen={setOpenTask}
                onEdit={(t) => {
                  setEditingTask(t);
                  setFormOpen(true);
                }}
                onDelete={setDeletingTask}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

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
