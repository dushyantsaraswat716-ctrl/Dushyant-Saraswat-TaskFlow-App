import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function WeeklyProgressChart({ tasks }) {
  const today = new Date();
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const data = days.map((day) => {
    const next = new Date(day);
    next.setDate(day.getDate() + 1);
    const created = tasks.filter((t) => {
      const c = new Date(t.createdAt);
      return c >= day && c < next;
    }).length;
    const completed = tasks.filter((t) => {
      if (!t.completed) return false;
      const u = new Date(t.updatedAt);
      return u >= day && u < next;
    }).length;
    return { name: DAY_LABELS[day.getDay()], created, completed };
  });

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} stroke="#94a3b8" />
        <YAxis allowDecimals={false} axisLine={false} tickLine={false} fontSize={12} stroke="#94a3b8" width={24} />
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #f1f5f9", fontSize: 13 }} />
        <Bar dataKey="created" fill="#c7d2fe" radius={[6, 6, 0, 0]} name="Created" />
        <Bar dataKey="completed" fill="#4f46e5" radius={[6, 6, 0, 0]} name="Completed" />
      </BarChart>
    </ResponsiveContainer>
  );
}
