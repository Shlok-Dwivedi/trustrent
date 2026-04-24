// Deterministic color palette for property placeholders
// Same listing ID always gets same color — consistent across pages
const PLACEHOLDER_COLORS = [
  { bg: 'bg-violet-100', text: 'text-violet-400', border: 'border-violet-200' },
  { bg: 'bg-teal-100',   text: 'text-teal-400',   border: 'border-teal-200' },
  { bg: 'bg-amber-100',  text: 'text-amber-400',  border: 'border-amber-200' },
  { bg: 'bg-rose-100',   text: 'text-rose-400',   border: 'border-rose-200' },
  { bg: 'bg-sky-100',    text: 'text-sky-400',     border: 'border-sky-200' },
  { bg: 'bg-emerald-100',text: 'text-emerald-400', border: 'border-emerald-200' },
  { bg: 'bg-orange-100', text: 'text-orange-400',  border: 'border-orange-200' },
  { bg: 'bg-fuchsia-100',text: 'text-fuchsia-400', border: 'border-fuchsia-200' },
];

/**
 * Returns a stable color object for a given listing ID.
 * Uses a simple hash so the same property always gets the same color.
 */
export function getPlaceholderColor(id = '') {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PLACEHOLDER_COLORS[Math.abs(hash) % PLACEHOLDER_COLORS.length];
}

/**
 * Inline placeholder div — use when you have the listing id available.
 * @param {string} id - listing ID for deterministic color
 * @param {string} className - additional tailwind classes (e.g. height, rounding)
 */
export function PropertyImagePlaceholder({ id = '', className = '' }) {
  const color = getPlaceholderColor(id);
  return (
    <div className={`flex flex-col items-center justify-center gap-1 border ${color.bg} ${color.border} ${className}`}>
      <svg className={`w-8 h-8 ${color.text} opacity-60`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M3 9.75L12 3l9 6.75V21a.75.75 0 01-.75.75H3.75A.75.75 0 013 21V9.75z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 21V12h6v9" />
      </svg>
      <span className={`text-xs font-semibold ${color.text} opacity-70`}>No Images</span>
    </div>
  );
}
