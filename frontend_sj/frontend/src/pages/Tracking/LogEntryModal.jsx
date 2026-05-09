import { useState } from 'react'
import { useSelector } from 'react-redux'
import Modal from '../../components/common/Modal'
import Button from '../../components/common/Button'

const ACTION_TYPES = [
  'Checked Out',
  'Checked In',
  'Transferred',
  'Inspected / Verified',
  'Maintenance / Repaired',
  'Decommissioned / Disposed',
  'Reported Missing',
  'Found',
  'QR Scanned',
  'Other',
]

const INITIAL_FORM = { action: '', performedBy: '', location: '', notes: '' }

function DevicePicker({ devices, selected, onChange }) {
  if (!devices.length) return null
  const allSelected = selected.length === devices.length

  const toggle = (sn) =>
    onChange(selected.includes(sn) ? selected.filter((x) => x !== sn) : [...selected, sn])

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">Device(s)</label>
        <button
          type="button"
          onClick={() => onChange(allSelected ? [] : devices.map((d) => d.serialNumber))}
          className="text-xs text-brand-500 hover:text-brand-400 font-medium transition-colors"
        >
          {allSelected ? 'Deselect All' : 'Select All'}
        </button>
      </div>
      <div className="rounded-lg border border-slate-200 dark:border-zinc-700 divide-y divide-slate-100 dark:divide-zinc-800 max-h-44 overflow-y-auto">
        {devices.map((dev) => (
          <label
            key={dev.id}
            className="flex items-center gap-3 px-3.5 py-2.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors duration-100"
          >
            <input
              type="checkbox"
              checked={selected.includes(dev.serialNumber)}
              onChange={() => toggle(dev.serialNumber)}
              className="rounded border-slate-300 dark:border-zinc-600 text-brand-500 focus:ring-brand-500 focus:ring-offset-0 h-4 w-4 flex-shrink-0"
            />
            <span className="font-mono text-xs text-slate-700 dark:text-zinc-200 flex-shrink-0">{dev.serialNumber}</span>
            {dev.model && (
              <span className="text-xs text-slate-400 dark:text-zinc-500 truncate">{dev.model}</span>
            )}
          </label>
        ))}
      </div>
      <p className="text-xs text-slate-400 dark:text-zinc-600">Select which device(s) this log entry applies to.</p>
    </div>
  )
}

function Field({ label, required, hint, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-slate-400 dark:text-zinc-600 leading-snug">{hint}</p>
      )}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

function TextInput({ error, ...props }) {
  return (
    <input
      className={`w-full rounded-md border px-3.5 py-2.5 text-sm bg-white dark:bg-zinc-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-150 ${
        error ? 'border-red-500' : 'border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600'
      }`}
      {...props}
    />
  )
}

// initialEquipment — pass to skip the equipment selection step (e.g. from QR Scanner)
function LogEntryModal({ onClose, onSave, initialEquipment = null }) {
  const inventoryItems = useSelector((s) => s.inventory.items)

  const [step, setStep]                           = useState(initialEquipment ? 2 : 1)
  const [equipSearch, setEquipSearch]             = useState('')
  const [selectedEquip, setSelectedEquip]         = useState(initialEquipment)
  const [selectedSerialNumbers, setSelectedSNs]   = useState([])
  const [form, setForm]                           = useState(INITIAL_FORM)
  const [errors, setErrors]                       = useState({})
  const [saving, setSaving]                       = useState(false)

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }))
  const clearError = (key) => setErrors((p) => { const n = { ...p }; delete n[key]; return n })

  const filteredEquip = inventoryItems.filter((item) => {
    if (!equipSearch.trim()) return true
    const q = equipSearch.toLowerCase()
    return ['article', 'equipmentType', 'itemCode', 'office'].some(
      (k) => String(item[k] ?? '').toLowerCase().includes(q)
    )
  })

  const validate = () => {
    const errs = {}
    if (!form.action)           errs.action      = 'Action is required.'
    if (!form.performedBy.trim()) errs.performedBy = 'Performed by is required.'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    try {
      await onSave({
        equipmentId:   selectedEquip.id,
        action:        form.action,
        performedBy:   form.performedBy,
        location:      form.location,
        notes:         form.notes,
        serialNumbers: selectedSerialNumbers.length > 0 ? selectedSerialNumbers.join(', ') : null,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const pickableDevices = (selectedEquip?.devices || []).filter((d) => d.serialNumber)

  return (
    <Modal
      title="Log Activity"
      subtitle={
        step === 1
          ? 'Step 1 of 2 — Select the equipment to log an activity for'
          : `Step 2 of 2 — Log details for "${selectedEquip?.article || selectedEquip?.itemCode}"`
      }
      onClose={onClose}
      size="xl"
    >
      {/* ── STEP 1: Select equipment ─────────────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            <input
              type="text"
              placeholder="Search by article, item code, office…"
              value={equipSearch}
              onChange={(e) => setEquipSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all duration-150"
              autoFocus
            />
          </div>

          {inventoryItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400 dark:text-zinc-600">
              <p className="text-sm text-slate-500 dark:text-zinc-500">No inventory records found.</p>
              <p className="text-xs text-slate-400 dark:text-zinc-600">Add equipment in the Inventory module first.</p>
            </div>
          ) : filteredEquip.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-zinc-500 text-center py-8">No equipment matches your search.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-zinc-800 max-h-72 overflow-y-auto">
              <table className="min-w-full text-sm divide-y divide-slate-200 dark:divide-zinc-800">
                <thead className="bg-slate-50 dark:bg-zinc-900 sticky top-0">
                  <tr>
                    {['Type of Equipment', 'Item Code', 'Article', 'Office'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-2xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-zinc-950 divide-y divide-slate-100 dark:divide-zinc-800/60">
                  {filteredEquip.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => { setSelectedEquip(item); setSelectedSNs([]); setStep(2) }}
                      className="cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors duration-100"
                    >
                      <td className="px-4 py-3 text-slate-600 dark:text-zinc-300 whitespace-nowrap">{item.equipmentType || '—'}</td>
                      <td className="px-4 py-3 text-slate-400 dark:text-zinc-400 font-mono text-xs whitespace-nowrap">{item.itemCode || '—'}</td>
                      <td className="px-4 py-3 text-slate-900 dark:text-white font-medium whitespace-nowrap">{item.article || '—'}</td>
                      <td className="px-4 py-3 text-slate-400 dark:text-zinc-400 whitespace-nowrap">{item.office || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <Button variant="secondary" size="md" onClick={onClose}>Cancel</Button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Log details ──────────────────────────────────────────────── */}
      {step === 2 && (
        <form onSubmit={handleSubmit} noValidate>
          {/* Selected equipment banner */}
          <div className="flex items-start gap-3 p-3.5 bg-slate-50 dark:bg-zinc-800 rounded-lg border border-slate-200 dark:border-zinc-700 mb-5">
            <div className="w-9 h-9 rounded-lg bg-brand-500/20 flex items-center justify-center flex-shrink-0 mt-px">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-brand-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{selectedEquip?.article || '—'}</p>
              <p className="text-xs text-slate-500 dark:text-zinc-500 mt-px">
                {[selectedEquip?.equipmentType, selectedEquip?.itemCode, selectedEquip?.office].filter(Boolean).join(' · ')}
              </p>
            </div>
            {!initialEquipment && (
              <button
                type="button"
                onClick={() => { setStep(1); setForm(INITIAL_FORM); setErrors({}); setSelectedSNs([]) }}
                className="ml-auto text-xs text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300 transition-colors whitespace-nowrap"
              >
                Change
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Device picker */}
            <DevicePicker
              devices={pickableDevices}
              selected={selectedSerialNumbers}
              onChange={setSelectedSNs}
            />

            {/* Action type */}
            <Field label="Action" required hint="What happened to this device? 'Checked Out' = left the office; 'Checked In' = returned." error={errors.action}>
              <div className="relative">
                <select
                  value={form.action}
                  onChange={(e) => { set('action')(e); clearError('action') }}
                  className={`w-full appearance-none rounded-md border px-3.5 py-2.5 pr-9 text-sm bg-white dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-150 ${
                    errors.action ? 'border-red-500' : 'border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600'
                  }`}
                >
                  <option value="" disabled>Select action type…</option>
                  {ACTION_TYPES.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Performed By" required hint="The staff member who carried out or authorized this action." error={errors.performedBy}>
                <TextInput
                  placeholder="e.g. Juan Dela Cruz"
                  value={form.performedBy}
                  onChange={set('performedBy')}
                  onFocus={() => clearError('performedBy')}
                  error={errors.performedBy}
                />
              </Field>
              <Field label="Location" hint="Where the device is now, or where this action took place.">
                <TextInput
                  placeholder="e.g. Room 201, 2nd Floor"
                  value={form.location}
                  onChange={set('location')}
                />
              </Field>
            </div>

            <Field label="Notes">
              <textarea
                rows={3}
                placeholder="Optional remarks or additional details…"
                value={form.notes}
                onChange={set('notes')}
                className="w-full rounded-md border border-slate-200 dark:border-zinc-700 px-3.5 py-2.5 text-sm bg-white dark:bg-zinc-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 hover:border-slate-300 dark:hover:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-150 resize-none"
              />
            </Field>
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200 dark:border-zinc-800">
            {!initialEquipment ? (
              <button
                type="button"
                onClick={() => { setStep(1); setErrors({}); setSelectedSNs([]) }}
                className="flex items-center gap-1.5 text-sm text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300 transition-colors duration-150"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Back
              </button>
            ) : <span />}
            <div className="flex gap-2">
              <Button type="button" variant="secondary" size="md" onClick={onClose}>Cancel</Button>
              <Button type="submit" size="md" disabled={saving}>
                {saving ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Saving…
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Save Log
                  </span>
                )}
              </Button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  )
}

export default LogEntryModal
