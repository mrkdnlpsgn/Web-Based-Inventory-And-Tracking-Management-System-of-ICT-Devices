import { useState } from 'react'
import Modal from '../../components/common/Modal'
import Button from '../../components/common/Button'
import { PASSWORD_REQUIREMENTS, isPasswordComplex } from '../../utils/passwordPolicy'

function ResetPasswordModal({ user, onClose, onSave }) {
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm]         = useState('')
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState('')

  const complexityMet = isPasswordComplex(newPassword)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!complexityMet) { setError('New password does not meet the requirements below.'); return }
    if (newPassword !== confirm) { setError('Passwords do not match.'); return }
    setSaving(true)
    try {
      await onSave(newPassword)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      title="Reset Password"
      subtitle={`Set a new password for ${user.fullName || user.username}`}
      onClose={onClose}
      size="md"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {error && (
          <div className="text-sm text-red-400 bg-red-950/50 border border-red-800 rounded-lg px-4 py-2.5">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">New Password</label>
          <input
            type="password"
            autoFocus
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => { setNewPassword(e.target.value); setError('') }}
            className="w-full rounded-md border border-slate-200 dark:border-zinc-700 px-3.5 py-2.5 text-sm bg-white dark:bg-zinc-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 hover:border-slate-300 dark:hover:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-150"
          />
          {newPassword && (
            <ul className="mt-1 space-y-0.5">
              {PASSWORD_REQUIREMENTS.map(({ key, label, test }) => {
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
            type="password"
            placeholder="Re-enter new password"
            value={confirm}
            onChange={(e) => { setConfirm(e.target.value); setError('') }}
            className="w-full rounded-md border border-slate-200 dark:border-zinc-700 px-3.5 py-2.5 text-sm bg-white dark:bg-zinc-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 hover:border-slate-300 dark:hover:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-150"
          />
        </div>

        <p className="text-xs text-slate-400 dark:text-zinc-500">
          This also clears any failed login attempts and unlocks the account if it was locked.
        </p>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800 mt-2">
          <Button type="button" variant="secondary" size="md" onClick={onClose}>Cancel</Button>
          <Button type="submit" size="md" disabled={saving || !newPassword || !confirm}>
            {saving ? 'Resetting…' : 'Reset Password'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default ResetPasswordModal
