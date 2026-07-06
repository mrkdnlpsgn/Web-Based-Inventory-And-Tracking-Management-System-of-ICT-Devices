function Input({ label, error, hint, endAdornment, className = '', id, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-700 dark:text-zinc-300">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          className={`
            w-full rounded-md border px-3.5 py-2.5 text-sm
            bg-white dark:bg-zinc-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500
            focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
            transition-all duration-150
            ${endAdornment ? 'pr-10' : ''}
            ${error
              ? 'border-red-500 focus:ring-red-400'
              : 'border-slate-300 dark:border-zinc-700 hover:border-slate-400 dark:hover:border-zinc-600'
            }
            ${className}
          `}
          {...props}
        />
        {endAdornment && (
          <div className="absolute inset-y-0 right-0 flex items-center justify-center w-10">
            {endAdornment}
          </div>
        )}
      </div>
      {hint && !error && <p className="text-xs text-slate-500 dark:text-zinc-400">{hint}</p>}
      {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
    </div>
  )
}

export default Input
