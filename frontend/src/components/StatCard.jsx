const barColors = {
  indigo: "border-brand-600",
  emerald: "border-emerald-500",
  amber: "border-amber-500",
  red: "border-red-500",
};

export default function StatCard({ label, value, color = "indigo", icon: Icon }) {
  return (
    <div className={`card flex items-center justify-between border-l-4 p-5 ${barColors[color]}`}>
      <div>
        <p className={`text-3xl font-extrabold text-slate-800 dark:text-white`}>{value}</p>
        <p className="mt-1 text-sm text-slate-400">{label}</p>
      </div>
      {Icon && (
        <div className="rounded-xl bg-slate-50 p-2.5 text-slate-400 dark:bg-slate-800">
          <Icon className="h-5 w-5" />
        </div>
      )}
    </div>
  );
}
