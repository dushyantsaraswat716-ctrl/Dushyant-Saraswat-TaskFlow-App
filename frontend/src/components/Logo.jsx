import { FiCheck } from "react-icons/fi";

export default function Logo({ compact = false }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow">
        <FiCheck className="h-5 w-5" strokeWidth={3} />
      </span>
      {!compact && <span className="text-lg font-extrabold tracking-tight text-slate-800 dark:text-white">TaskFlow</span>}
    </div>
  );
}
