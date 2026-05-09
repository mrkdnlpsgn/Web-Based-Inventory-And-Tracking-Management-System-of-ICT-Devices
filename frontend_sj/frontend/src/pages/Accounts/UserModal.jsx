import { useState } from 'react'
import Modal from '../../components/common/Modal'
import Button from '../../components/common/Button'

const ROLES = [
  { value: 'admin', label: 'Administrator' },
  { value: 'staff', label: 'ICT Officer / Staff' },
]

const EMPTY = { name: '', email: '', password: '', role: 'staff' }

function Field({ label, required, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

function TextInput({ error, ...props }) {
  return (
    <input
      className={`w-full rounded-md border px-3.5 py-2.5 text-sm bg-white dark:bg-zinc-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600
        focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-150
        ${error ? 'border-red-500' : 'border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600'}`}
      {...props}
    />
  )
}

function UserModal({ onClose, onSave, initial = null }) {
  const isEditing = initial !== null
  const [form, setForm]     = useState(isEditing ? { ...initial, password: '' } : EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const set = (key) => (e) => {
    setForm((p) => ({ ...p, [key]: e.target.value }))
    setErrors((p) => { const n = { ...p }; delete n[key]; return n })
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim())  errs.name  = 'Name is required.'
    if (!form.email.trim()) errs.email = 'Email is required.'
    if (!isEditing && !form.password.trim()) errs.password = 'Password is required.'
    if (!form.role) errs.role = 'Role is required.'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      await onSave(form)
      onClose()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save account.'
      setErrors({ _global: msg })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      title={isEditing ? 'Edit Account' : 'Create Account'}
      subtitle={isEditing ? `Editing ${initial.name}` : 'Add a new staff or admin account'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {errors._global && (
          <div className="text-sm text-red-400 bg-red-950/50 border border-red-800 rounded-lg px-4 py-2.5">
            {errors._global}
          </div>
        )}

        <Field label="Full Name" required error={errors.name}>
          <TextInput
            placeholder="e.g. Juan Dela Cruz"
            value={form.name}
            onChange={set('name')}
            error={errors.name}
          />
        </Field>

        <Field label="Email Address" required error={errors.email}>
          <TextInput
            type="email"
            placeholder="e.g. juan@sjmh.gov.ph"
            value={form.email}
            onChange={set('email')}
            error={errors.email}
          />
        </Field>

        <Field
          label={isEditing ? 'New Password' : 'Password'}
          required={!isEditing}
          error={errors.password}
        >
          <TextInput
            type="password"
            placeholder={isEditing ? 'Leave blank to keep current password' : 'Enter password'}
            value={form.password}
            onChange={set('password')}
            error={errors.password}
          />
        </Field>

        <Field label="Role" required error={errors.role}>
          <select
            value={form.role}
            onChange={set('role')}
            className="w-full rounded-md border border-slate-200 dark:border-zinc-700 px-3.5 py-2.5 text-sm bg-white dark:bg-zinc-800 text-slate-900 dark:text-white
              hover:border-slate-300 dark:hover:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
              transition-all duration-150"
          >
            {ROLES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </Field>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800 mt-2">
          <Button type="button" variant="secondary" size="md" onClick={onClose}>Cancel</Button>
          <Button type="submit" size="md" disabled={saving}>
            {saving ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Account'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default UserModal
