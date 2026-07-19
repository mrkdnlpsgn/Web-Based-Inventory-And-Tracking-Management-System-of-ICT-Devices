import { useEffect, useState } from 'react'

const WARNING_SECONDS = 60

function IdleWarningModal({ onStay, onLogout }) {
  const [seconds, setSeconds] = useState(WARNING_SECONDS)

  useEffect(() => {
    if (seconds <= 0) {
      onLogout()
      return
    }
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(id)
  }, [seconds, onLogout])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6 animate-fade-slide">

        {/* Icon */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h2 className="text-center text-base font-semibold text-slate-900 dark:text-white mb-1">
          Session Expiring Soon
        </h2>
        <p className="text-center text-sm text-slate-500 dark:text-zinc-400 mb-5">
          You've been inactive. You will be automatically logged out in:
        </p>

        {/* Countdown */}
        <div className="flex items-center justify-center mb-6">
          <span className="text-4xl font-bold tabular-nums text-amber-600 dark:text-amber-400">
            {String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}
          </span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onLogout}
            className="flex-1 py-2 rounded-lg border border-slate-300 dark:border-zinc-600 text-sm font-medium text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Log Out Now
          </button>
          <button
            onClick={onStay}
            className="flex-1 py-2 rounded-lg bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          >
            Stay Logged In
          </button>
        </div>
      </div>
    </div>
  )
}

export default IdleWarningModal
