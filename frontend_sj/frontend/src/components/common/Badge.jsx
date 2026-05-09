const colorMap = {
  green:  'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-200 dark:ring-emerald-800',
  red:    'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 ring-1 ring-red-200 dark:ring-red-800',
  yellow: 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 ring-1 ring-amber-200 dark:ring-amber-800',
  gray:   'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 ring-1 ring-slate-200 dark:ring-zinc-700',
  blue:   'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-800',
  orange: 'bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-400 ring-1 ring-orange-200 dark:ring-orange-800',
}

const dotColor = {
  green: 'bg-emerald-500 dark:bg-emerald-400',
  red: 'bg-red-500 dark:bg-red-400',
  yellow: 'bg-amber-500 dark:bg-amber-400',
  gray: 'bg-slate-400 dark:bg-zinc-500',
  blue: 'bg-blue-500 dark:bg-blue-400',
  orange: 'bg-orange-500 dark:bg-orange-400',
}

function Badge({ label, color = 'gray' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorMap[color]}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotColor[color] ?? 'bg-slate-400 dark:bg-zinc-500'}`} />
      {label}
    </span>
  )
}

export default Badge
