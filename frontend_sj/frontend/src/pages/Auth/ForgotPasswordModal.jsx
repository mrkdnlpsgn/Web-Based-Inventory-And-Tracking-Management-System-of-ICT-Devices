import { useState, useEffect, useRef } from 'react'
import Modal from '../../components/common/Modal'
import { forgotPassword, verifyOtp, resetPassword } from '../../services/authService'

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

const BTN_GHOST =
  'text-xs text-brand-500 hover:text-brand-600 dark:hover:text-brand-400 ' +
  'transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed'

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
  const [step, setStep]             = useState(initialIdentifier.trim() ? 'otp' : 'identifier')
  const [identifier, setIdentifier] = useState(initialIdentifier.trim())
  const [otp, setOtp]               = useState('')
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword]         = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword]       = useState(false)
  const [loading, setLoading]       = useState(false)
  const [cooldown, setCooldown]     = useState(0)
  const [error, setError]           = useState('')
  const hasSent                     = useRef(false)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const startCooldown = () => setCooldown(60)

  // Auto-send OTP when identifier is pre-filled (user came from login form)
  useEffect(() => {
    if (!initialIdentifier.trim() || hasSent.current) return
    hasSent.current = true
    setLoading(true)
    forgotPassword(initialIdentifier.trim())
      .then(() => { startCooldown() })
      .catch(() => setError('Failed to send OTP. Please try again.'))
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSendOtp = async (e) => {
    e.preventDefault()
    if (!identifier.trim()) { setError('Please enter your email or username.'); return }
    setError('')
    setLoading(true)
    try {
      await forgotPassword(identifier.trim())
      setStep('otp')
      startCooldown()
    } catch {
      setError('Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (otp.length !== 6) { setError('Please enter the 6-digit OTP code.'); return }
    setError('')
    setLoading(true)
    try {
      const res = await verifyOtp(identifier.trim(), otp.trim())
      setResetToken(res.data.resetToken)
      setStep('password')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setError('')
    setOtp('')
    setLoading(true)
    try {
      await forgotPassword(identifier.trim())
      startCooldown()
    } catch {
      setError('Failed to resend OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (newPassword.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return }
    setError('')
    setLoading(true)
    try {
      await resetPassword(resetToken, newPassword)
      setStep('done')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please start over.')
    } finally {
      setLoading(false)
    }
  }

  const subtitles = {
    identifier: 'Enter your email or username to receive a one-time code.',
    otp:        loading ? 'Sending OTP to your registered email…' : 'A 6-digit code was sent to your registered email address.',
    password:   'OTP verified. Choose your new password.',
    done:       null,
  }

  return (
    <Modal
      title="Reset Password"
      subtitle={subtitles[step]}
      onClose={onClose}
      size="md"
    >
      <div className="space-y-4">
        <ErrorBox message={error} />

        {step === 'identifier' && (
          <form onSubmit={handleSendOtp} noValidate className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">
                Email or Username
              </label>
              <input
                type="text"
                autoFocus
                placeholder="you@sjmh.gov.ph or your username"
                value={identifier}
                onChange={(e) => { setIdentifier(e.target.value); setError('') }}
                className={INPUT_CLASS}
              />
            </div>
            <button type="submit" disabled={loading} className={BTN_PRIMARY}>
              {loading ? 'Sending…' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} noValidate className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">
                One-Time Password
              </label>
              <input
                type="text"
                inputMode="numeric"
                autoFocus
                placeholder="123456"
                maxLength={6}
                value={otp}
                onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setError('') }}
                className={INPUT_CLASS + ' tracking-[0.5em] font-mono text-center text-lg'}
              />
              <p className="text-xs text-slate-400 dark:text-zinc-500">
                Didn't receive it?{' '}
                <button type="button" onClick={handleResendOtp} disabled={loading || cooldown > 0} className={BTN_GHOST}>
                  {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
                </button>
              </p>
            </div>
            <button type="submit" disabled={loading || otp.length !== 6} className={BTN_PRIMARY}>
              {loading ? 'Verifying…' : 'Verify Code'}
            </button>
          </form>
        )}

        {step === 'password' && (
          <form onSubmit={handleResetPassword} noValidate className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoFocus
                  placeholder="At least 8 characters"
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
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">
                Confirm Password
              </label>
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
          </form>
        )}

        {step === 'done' && (
          <div className="py-4 text-center space-y-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Password Reset Successfully</p>
              <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">You can now sign in with your new password.</p>
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
