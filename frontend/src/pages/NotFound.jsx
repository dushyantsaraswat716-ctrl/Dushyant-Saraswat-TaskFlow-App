import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import Logo from "../components/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center dark:bg-slate-950">
      <Logo />
      <p className="mt-10 text-7xl font-extrabold tracking-tight text-brand-600">404</p>
      <h1 className="mt-3 text-xl font-bold text-slate-800 dark:text-white">This page wandered off your board.</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-400">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link to="/dashboard" className="btn-primary mt-8">
        <FiArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>
    </div>
  );
}
