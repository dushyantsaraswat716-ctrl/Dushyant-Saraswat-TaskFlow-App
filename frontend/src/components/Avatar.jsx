import { getInitials } from "../utils/format";
import { API_ORIGIN } from "../constants";

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-20 w-20 text-2xl",
};

export default function Avatar({ name, src, size = "sm", className = "" }) {
  const imgSrc = src ? (/^https?:\/\//.test(src) ? src : `${API_ORIGIN}${src}`) : null;

  if (imgSrc) {
    return (
      <img
        src={imgSrc}
        alt={name || "Avatar"}
        className={`shrink-0 rounded-full object-cover ring-2 ring-white dark:ring-slate-900 ${sizes[size]} ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 font-bold text-white ring-2 ring-white dark:ring-slate-900 ${sizes[size]} ${className}`}
    >
      {getInitials(name)}
    </div>
  );
}
