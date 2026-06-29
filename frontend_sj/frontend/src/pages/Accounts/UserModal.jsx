import { useState, useEffect } from 'react'
import Modal from '../../components/common/Modal'
import Button from '../../components/common/Button'
import { getOffices } from '../../services/officeService'

const ROLES = [
  { value: 'ADMIN', label: 'Administrator' },
  { value: 'STAFF', label: 'ICT Officer / Staff' },
]

const EMPTY = { username: '', fullName: '', password: '', role: 'STAFF', officeId: '', isActive: true }

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

function SelectInput({ children, ...props }) {
  return (
    <div className="relative">
      <select
        className="w-full appearance-none rounded-md border border-slate-200 dark:border-zinc-700 px-3.5 py-2.5 pr-9 text-sm bg-white dark:bg-zinc-800 text-slate-900 dark:text-white
          hover:border-slate-300 dark:hover:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-150"
        {...props}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  )
}

function UserModal({ onClose, onSave, initial = null }) {
  const isEditing = initial !== null
  const [form, setForm] = useState(
    isEditing
      ? {
          username: initial.username || '',
          fullName: initial.fullName || '',
          password: '',
          role: initial.role || 'STAFF',
          officeId: initial.officeId ? String(initial.officeId) : '',
          isActive: initial.isActive !== undefined ? initial.isActive : true,
        }
      : EMPTY
  )
  const [errors, setErrors]   = useState({})
  const [saving, setSaving]   = useState(false)
  const [offices, setOffices] = useState([])

  useEffect(() => {
    getOffices().then(({ data }) => setOffices(data)).catch(() => {})
  }, [])

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((p) => ({ ...p, [key]: value }))
    setErrors((p) => { const n = { ...p }; delete n[key]; return n })
  }

  const validate = () => {
    const errs = {}
    if (!form.username.trim()) errs.username = 'Username is required.'
    if (!form.fullName.trim()) errs.fullName = 'Full name is required.'
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
      const payload = { ...form }
      if (isEditing && !payload.password) delete payload.password
      if (payload.officeId === '') payload.officeId = null
      else payload.officeId = Number(payload.officeId)
      await onSave(payload)
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
      subtitle={isEditing ? `Editing ${initial.fullName || initial.username}` : 'Add a new staff or admin account'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {errors._global && (
          <div className="text-sm text-red-400 bg-red-950/50 border border-red-800 rounded-lg px-4 py-2.5">
            {errors._global}
          </div>
        )}

        <Field label="Username" required error={errors.username}>
          <TextInput
            placeholder="e.g. jdelacruz"
            value={form.username}
            onChange={set('username')}
            error={errors.username}
          />
        </Field>

        <Field label="Full Name" required error={errors.fullName}>
          <TextInput
            placeholder="e.g. Juan Dela Cruz"
            value={form.fullName}
            onChange={set('fullName')}
            error={errors.fullName}
          />
        </Field>

        <Field label={isEditing ? 'New Password (leave blank to keep)' : 'Password'} required={!isEditing} error={errors.password}>
          <TextInput
            type="password"
            placeholder={isEditing ? 'Leave blank to keep current password' : 'Enter password'}
            value={form.password}
            onChange={set('password')}
            error={errors.password}
          />
        </Field>

        <Field label="Role" required error={errors.role}>
          <SelectInput value={form.role} onChange={set('role')}>
            {ROLES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </SelectInput>
        </Field>

        <Field label="Office" error={errors.officeId}>
          <SelectInput value={form.officeId} onChange={set('officeId')}>
            <option value="">— No office assigned —</option>
            {offices.map((o) => (
              <option key={o.id} value={String(o.id)}>{o.officeName}</option>
            ))}
          </SelectInput>
        </Field>

        <Field label="Status" error={errors.isActive}>
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={form.isActive}
                onChange={set('isActive')}
              />
              <div className="w-9 h-5 rounded-full transition-colors duration-200 bg-slate-200 dark:bg-zinc-700 peer-checked:bg-brand-500" />
              <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 peer-checked:translate-x-4" />
            </div>
            <span className="text-sm text-slate-600 dark:text-zinc-300">{form.isActive ? 'Active' : 'Inactive'}</span>
          </label>
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
