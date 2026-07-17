import { NavLink } from "react-router-dom";
import { FiGrid, FiCheckCircle, FiTrello, FiUser, FiLogOut, FiX } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import Logo from "./Logo";
import { logout } from "../redux/slices/authSlice";
import { closeSidebar } from "../redux/slices/uiSlice";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: FiGrid },
  { to: "/tasks", label: "Tasks", icon: FiCheckCircle },
  { to: "/boards", label: "Boards", icon: FiTrello },
  { to: "/profile", label: "Profile", icon: FiUser },
];

function NavItems({ onNavigate }) {
  const dispatch = useDispatch();
  return (
    <>
      <nav className="flex-1 space-y-1 px-3">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              }`
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="px-3 pb-4">
        <button
          onClick={() => dispatch(logout())}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
        >
          <FiLogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </>
  );
}

export default function Sidebar() {
  const sidebarOpen = useSelector((s) => s.ui.sidebarOpen);
  const dispatch = useDispatch();

  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900 lg:flex">
        <div className="flex h-16 items-center px-5">
          <Logo />
        </div>
        <NavItems />
      </aside>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
              onClick={() => dispatch(closeSidebar())}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.22 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white shadow-2xl dark:bg-slate-900 lg:hidden"
            >
              <div className="flex h-16 items-center justify-between px-5">
                <Logo />
                <button onClick={() => dispatch(closeSidebar())} className="btn-ghost !p-2">
                  <FiX className="h-5 w-5" />
                </button>
              </div>
              <NavItems onNavigate={() => dispatch(closeSidebar())} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
