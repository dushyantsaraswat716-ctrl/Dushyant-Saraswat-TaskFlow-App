import { Outlet } from "react-router-dom";
import { FiCheckSquare, FiTrendingUp, FiZap } from "react-icons/fi";
import Logo from "../components/Logo";

const points = [
  { icon: FiCheckSquare, text: "Organize every task into clear, focused boards" },
  { icon: FiTrendingUp, text: "Track your progress with real-time stats" },
  { icon: FiZap, text: "Stay ahead of deadlines, automatically" },
];

export default function AuthLayout() {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-10 h-80 w-80 rounded-full bg-brand-400/20 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 backdrop-blur">
              <FiCheckSquare className="h-5 w-5" />
            </span>
            <span className="text-lg font-extrabold tracking-tight">TaskFlow</span>
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-3xl font-extrabold leading-tight text-white">
            Get more done, without the mental clutter.
          </h1>
          <p className="mt-3 text-brand-100">
            TaskFlow keeps your tasks, boards and deadlines in one calm, organized place.
          </p>
          <ul className="mt-8 space-y-4">
            {points.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-white/90">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-sm">{text}</span>
              </li>
            ))}
          </ul>
        </div>

         </div>

      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
