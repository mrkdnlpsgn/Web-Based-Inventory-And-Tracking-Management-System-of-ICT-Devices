const colorMap = {
  green:  'bg-emerald-950 text-emerald-400 ring-1 ring-emerald-800',
  red:    'bg-red-950 text-red-400 ring-1 ring-red-800',
  yellow: 'bg-amber-950 text-amber-400 ring-1 ring-amber-800',
  gray:   'bg-zinc-800 text-zinc-400 ring-1 ring-zinc-700',
  blue:   'bg-blue-950 text-blue-400 ring-1 ring-blue-800',
  orange: 'bg-orange-950 text-orange-400 ring-1 ring-orange-800',
}

const dotColor = {
  green: 'bg-emerald-400', red: 'bg-red-400', yellow: 'bg-amber-400',
  gray: 'bg-zinc-500', blue: 'bg-blue-400', orange: 'bg-orange-400',
}

function Badge({ label, color = 'gray' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorMap[color]}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotColor[color] ?? 'bg-zinc-500'}`} />
      {label}
    </span>
  )
}

export default Badge
