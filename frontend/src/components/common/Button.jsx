function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const base =
    'inline-flex items-center justify-center font-semibold rounded-md transition-all duration-150 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-zinc-950 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100'

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-3.5 py-2 text-sm',
    lg: 'px-5 py-2.5 text-sm',
  }

  const variants = {
    primary:
      'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 focus:ring-brand-500 shadow-sm hover:shadow-brand-500/20 hover:shadow-md',
    secondary:
      'bg-zinc-800 text-zinc-200 border border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 focus:ring-zinc-600',
    danger:
      'bg-red-600 text-white hover:bg-red-500 active:bg-red-700 focus:ring-red-500',
    ghost:
      'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 focus:ring-zinc-700',
  }

  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

export default Button
