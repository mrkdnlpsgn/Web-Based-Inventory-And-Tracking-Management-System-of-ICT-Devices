import { useState } from 'react'
import Modal from '../../components/common/Modal'
import { forgotPassword } from '../../services/authService'

const INPUT_CLASS =
  'w-full rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/60 ' +
  'px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 ' +
  'dark:placeholder:text-zinc-600 hover:border-slate-400 dark:hover:border-zinc-600 ' +
  'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-150'

const BTN_PRIMARY =
  'w-full py-2.5 px-5 text-sm font-semibold rounded-lg bg-brand-500 text-white ' +
  'hover:bg-brand-600 active:scale-[0.98] transition-all duration-150 ' +
  'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ' +
  'focus:ring-offset-white dark:focus:ring-offset-zinc-900 disabled:opacity-40 ' +
  'disabled:cursor-not-allowed disabled:active:scale-100'

const REQUIREMENTS = [
  { key: 'length',    label: '8–128 characters',                    test: (p) => p.length >= 8 && p.length <= 128 },
  { key: 'uppercase', label: 'One uppercase letter (A–Z)',           test: (p) => /[A-Z]/.test(p) },
  { key: 'lowercase', label: 'One lowercase letter (a–z)',           test: (p) => /[a-z]/.test(p) },
  { key: 'digit',     label: 'One number (0–9)',                    test: (p) => /[0-9]/.test(p) },
  { key: 'special',   label: 'One special character (@$!%*?&_#^-)', test: (p) => /[@$!%*?&_#^-]/.test(p) },
]

function ErrorBox({ message }) {
  if (!message) return null
  return (
    <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 rounded-lg px-4 py-3 text-sm">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      {message}
    </div>
  )
}

function ForgotPasswordModal({ onClose, initialIdentifier = '' }) {
  const [done, setDone]                       = useState(false)
  const [username, setUsername]               = useState(initialIdentifier.trim())
  const [newPassword, setNewPassword]         = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword]       = useState(false)
  const [loading, setLoading]                 = useState(false)
  const [error, setError]                     = useState('')

  const complexityMet = REQUIREMENTS.every((r) => r.test(newPassword))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!username.trim()) { setError('Please enter your username.'); return }
    if (!complexityMet) { setError('New password does not meet the requirements below.'); return }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return }
    setLoading(true)
    try {
      await forgotPassword(username.trim(), newPassword)
      setDone(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title="Reset Password"
      subtitle={done ? null : 'Enter your username and choose a new password.'}
      onClose={onClose}
      size="md"
    >
      <div className="space-y-4">
        <ErrorBox message={error} />

        {!done ? (
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">Username</label>
              <input
                type="text"
                autoFocus
                placeholder="Enter your username"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError('') }}
                className={INPUT_CLASS}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setError('') }}
                  className={INPUT_CLASS + ' pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors duration-150"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
              {newPassword && (
                <ul className="mt-1 space-y-0.5">
                  {REQUIREMENTS.map(({ key, label, test }) => {
                    const met = test(newPassword)
                    return (
                      <li key={key} className={`flex items-center gap-1.5 text-xs transition-colors ${met ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-zinc-500'}`}>
                        {met
                          ? <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                          : <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                        }
                        {label}
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">Confirm New Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError('') }}
                className={INPUT_CLASS}
              />
            </div>

            <button type="submit" disabled={loading} className={BTN_PRIMARY}>
              {loading ? 'Resetting…' : 'Reset Password'}
            </button>

            <p className="text-xs text-slate-400 dark:text-zinc-500 text-center">
              You can only reset a password once every 15 minutes per account.
            </p>
          </form>
        ) : (
          <div className="py-4 text-center space-y-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Password Reset</p>
              <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">If that username exists, its password has been updated. You can now sign in with your new password.</p>
            </div>
            <button onClick={onClose} className={BTN_PRIMARY}>
              Back to Sign In
            </button>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default ForgotPasswordModal
