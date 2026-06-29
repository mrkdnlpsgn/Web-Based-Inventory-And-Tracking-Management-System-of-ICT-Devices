function Input({ label, error, hint, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">
          {label}
        </label>
      )}
      <input
        className={`
          w-full rounded-md border px-3.5 py-2.5 text-sm
          bg-white dark:bg-zinc-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500
          focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
          transition-all duration-150
          ${error
            ? 'border-red-500 focus:ring-red-400'
            : 'border-slate-300 dark:border-zinc-700 hover:border-slate-400 dark:hover:border-zinc-600'
          }
          ${className}
        `}
        {...props}
      />
      {hint && !error && <p className="text-xs text-slate-400 dark:text-zinc-500">{hint}</p>}
      {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
    </div>
  )
}

export default Input
