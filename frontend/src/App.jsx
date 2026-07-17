import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Boards from "./pages/Boards";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import ToastContainer from "./components/ToastContainer";
import { loadCurrentUser, logout } from "./redux/slices/authSlice";
import { registerUnauthorizedHandler } from "./services/api";

export default function App() {
  const dispatch = useDispatch();
  const { token, isAuthenticated } = useSelector((s) => s.auth);
  const theme = useSelector((s) => s.profile.prefs.theme);

  useEffect(() => {
    registerUnauthorizedHandler(() => dispatch(logout()));
  }, [dispatch]);

  useEffect(() => {
    if (token) dispatch(loadCurrentUser());
  }, [token]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <>
      <ToastContainer />
      <Routes>
        <Route element={<PublicRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/boards" element={<Boards />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}