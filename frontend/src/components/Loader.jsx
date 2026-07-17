export default function Loader({ full = false, label = "Loading..." }) {
  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-brand-200 border-t-brand-600" />
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  );

  if (full) {
    return <div className="flex min-h-[60vh] w-full items-center justify-center">{spinner}</div>;
  }
  return <div className="flex w-full items-center justify-center py-10">{spinner}</div>;
}
