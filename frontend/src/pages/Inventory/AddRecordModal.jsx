import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import Modal from '../../components/common/Modal'
import Button from '../../components/common/Button'

const QR_PREFIX = 'ict-inv:'

function printQRCode(item) {
  const svgEl = document.getElementById('new-item-qr-svg')
  if (!svgEl) return
  const win = window.open('', '_blank', 'width=480,height=640')
  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>QR Code – ${item.article || item.itemCode}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }
    .card { border: 2px solid #e5e7eb; border-radius: 16px; padding: 28px 32px; text-align: center; max-width: 300px; width: 100%; }
    .card svg { display: block; margin: 0 auto 16px; }
    .title { font-size: 17px; font-weight: 700; color: #111827; margin-bottom: 4px; }
    .sub   { font-size: 12px; color: #6b7280; margin-bottom: 2px; }
    .badge { display: inline-block; margin-top: 10px; padding: 3px 12px; background: #f3f4f6; border-radius: 999px; font-size: 11px; font-weight: 600; color: #374151; }
    .org   { margin-top: 14px; padding-top: 12px; border-top: 1px solid #f3f4f6; font-size: 10px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="card">
    ${svgEl.outerHTML}
    <p class="title">${item.article || '—'}</p>
    <p class="sub">${item.equipmentType || ''}</p>
    <p class="sub">${[item.office, item.location].filter(Boolean).join(' · ')}</p>
    <span class="badge">${item.itemCode || ''}</span>
    <p class="org">San Jose Municipal Hall · ICT Inventory System</p>
  </div>
  <script>window.onload = () => { window.print(); window.onafterprint = () => window.close() }</script>
</body>
</html>`)
  win.document.close()
}

// ── Option lists ─────────────────────────────────────────────────────────────
const TYPE_OPTIONS = [
  'Hardware',
  'Software',
  'Peripherals',
  'Network Equipment',
  'Communication Equipment',
  'Other',
]

const EQUIPMENT_OPTIONS = [
  'Desktop Computer',
  'Laptop / Notebook',
  'Tablet',
  'All-in-One Computer',
  'Server',
  'Monitor / Display',
  'Printer',
  'Scanner',
  'Photocopier / MFP',
  'Keyboard',
  'Mouse',
  'UPS',
  'AVR',
  'Router',
  'Network Switch',
  'Wireless Access Point',
  'IP Phone / VoIP',
  'CCTV Camera',
  'Projector',
  'External Storage',
  'Other',
]

const INITIAL_FORM = {
  type:              '',
  equipmentType:     '',
  itemCode:          '',
  article:           '',
  model:             '',
  serialNumber:      '',
  amountValue:       '',
  acquisitionDate:   '',
  office:            '',
  location:          '',
  description:       '',
  accountablePerson: '',
}

// ── Reusable sub-components ───────────────────────────────────────────────────
function Field({ label, required, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-zinc-300">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
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
      className={`
        w-full rounded-md border px-3.5 py-2.5 text-sm
        bg-zinc-800 text-white placeholder:text-zinc-600
        focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
        transition-all duration-150
        ${error ? 'border-red-500' : 'border-zinc-700 hover:border-zinc-600'}
      `}
      {...props}
    />
  )
}

function SelectInput({ options, placeholder, error, ...props }) {
  return (
    <div className="relative">
      <select
        className={`
          w-full appearance-none rounded-md border px-3.5 py-2.5 pr-9 text-sm
          bg-zinc-800 text-white
          focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
          transition-all duration-150
          ${error ? 'border-red-500' : 'border-zinc-700 hover:border-zinc-600'}
        `}
        {...props}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
function AddRecordModal({ onClose, onSave, initialData = null }) {
  const isEditing           = initialData !== null
  const [form, setForm]     = useState(
    initialData
      ? {
          type:              initialData.type              ?? '',
          equipmentType:     initialData.equipmentType     ?? '',
          itemCode:          initialData.itemCode          ?? '',
          article:           initialData.article           ?? '',
          model:             initialData.model             ?? '',
          serialNumber:      initialData.serialNumber      ?? '',
          amountValue:       initialData.amountValue != null ? String(initialData.amountValue) : '',
          acquisitionDate:   initialData.acquisitionDate   ?? '',
          office:            initialData.office            ?? '',
          location:          initialData.location          ?? '',
          description:       initialData.description       ?? '',
          accountablePerson: initialData.accountablePerson ?? '',
        }
      : INITIAL_FORM
  )
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [stage, setStage]   = useState('form')  // 'form' | 'qr'
  const [savedItem, setSavedItem] = useState(null)

  const set = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const clearError = (key) =>
    setErrors((prev) => { const next = { ...prev }; delete next[key]; return next })

  const validate = () => {
    const errs = {}
    if (!form.itemCode.trim()) errs.itemCode = 'Item Code is required.'
    if (!form.article.trim())  errs.article  = 'Article is required.'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    const payload = {
      ...form,
      amountValue: form.amountValue ? Number(form.amountValue) : 0,
    }
    if (isEditing) {
      await onSave({ ...initialData, ...payload })
      setSaving(false)
      onClose()
    } else {
      const item = await onSave(payload)
      setSaving(false)
      if (item) { setSavedItem(item); setStage('qr') }
      else onClose()
    }
  }

  return (
    <Modal
      title={
        stage === 'qr'
          ? 'Equipment Added'
          : isEditing ? 'Edit Inventory Record' : 'Add Inventory Record'
      }
      subtitle={
        stage === 'qr'
          ? 'Your QR code is ready to print'
          : isEditing
            ? `Editing: ${initialData.article || initialData.itemCode}`
            : 'Fill in the details of the new ICT equipment'
      }
      onClose={onClose}
      size="lg"
    >
      {/* ── QR Code stage ─────────────────────────────────────────────── */}
      {stage === 'qr' && savedItem && (
        <div className="flex flex-col items-center gap-5 py-2">
          {/* Success icon */}
          <div className="w-12 h-12 rounded-full bg-emerald-950 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>

          {/* Printable card */}
          <div className="bg-white rounded-2xl p-6 w-full max-w-xs text-center shadow-lg">
            <div className="flex justify-center mb-4">
              <QRCodeSVG
                id="new-item-qr-svg"
                value={`${QR_PREFIX}${savedItem.id}`}
                size={160}
                bgColor="#ffffff"
                fgColor="#111827"
                level="H"
              />
            </div>
            <p className="text-base font-bold text-gray-900 leading-tight">
              {savedItem.article || '—'}
            </p>
            <p className="text-xs text-gray-500 mt-1">{savedItem.equipmentType || ''}</p>
            <p className="text-xs text-gray-400">
              {[savedItem.office, savedItem.location].filter(Boolean).join(' · ')}
            </p>
            <span className="inline-block mt-2 px-3 py-0.5 bg-gray-100 rounded-full text-xs font-semibold text-gray-600">
              {savedItem.itemCode || ''}
            </span>
            <p className="text-[10px] text-gray-400 mt-3 pt-2 border-t border-gray-100">
              San Jose Municipal Hall · ICT Inventory System
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 w-full max-w-xs">
            <Button
              variant="secondary"
              size="md"
              className="flex-1"
              onClick={() => printQRCode(savedItem)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
              </svg>
              Print QR Code
            </Button>
            <Button size="md" className="flex-1" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      )}

      {/* ── Form stage ────────────────────────────────────────────────── */}
      {stage === 'form' && <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-4">

          {/* Section: Classification */}
          <div>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3">
              Classification
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Type">
                <SelectInput
                  options={TYPE_OPTIONS}
                  placeholder="Select type…"
                  value={form.type}
                  onChange={set('type')}
                />
              </Field>
              <Field label="Type of Equipment">
                <SelectInput
                  options={EQUIPMENT_OPTIONS}
                  placeholder="Select equipment…"
                  value={form.equipmentType}
                  onChange={set('equipmentType')}
                />
              </Field>
            </div>
          </div>

          <div className="border-t border-zinc-800" />

          {/* Section: Identification */}
          <div>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3">
              Identification
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Item Code" required error={errors.itemCode}>
                <TextInput
                  placeholder="e.g. ICT-2024-001"
                  value={form.itemCode}
                  onChange={set('itemCode')}
                  onFocus={() => clearError('itemCode')}
                  error={errors.itemCode}
                />
              </Field>
              <Field label="Article" required error={errors.article}>
                <TextInput
                  placeholder="e.g. Dell Latitude 5420"
                  value={form.article}
                  onChange={set('article')}
                  onFocus={() => clearError('article')}
                  error={errors.article}
                />
              </Field>
            </div>
          </div>

          <div className="border-t border-zinc-800" />

          {/* Section: Location */}
          <div>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3">
              Location
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Office">
                <TextInput
                  placeholder="e.g. IT Department"
                  value={form.office}
                  onChange={set('office')}
                />
              </Field>
              <Field label="Location">
                <TextInput
                  placeholder="e.g. Room 201, 2nd Floor"
                  value={form.location}
                  onChange={set('location')}
                />
              </Field>
            </div>
          </div>

          <div className="border-t border-zinc-800" />

          {/* Section: Device Details */}
          <div>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3">
              Device Details
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Model">
                <TextInput
                  placeholder="e.g. Latitude 5420"
                  value={form.model}
                  onChange={set('model')}
                />
              </Field>
              <Field label="Serial Number">
                <TextInput
                  placeholder="e.g. SN-ABC123"
                  value={form.serialNumber}
                  onChange={set('serialNumber')}
                />
              </Field>
              <Field label="Amount Value">
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-zinc-500 pointer-events-none select-none">₱</span>
                  <input
                    type="number" min="0" step="0.01" placeholder="0.00"
                    value={form.amountValue}
                    onChange={set('amountValue')}
                    className="w-full rounded-md border border-zinc-700 pl-7 pr-3.5 py-2.5 text-sm bg-zinc-800 text-white placeholder:text-zinc-600 hover:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-150"
                  />
                </div>
              </Field>
              <Field label="Acquisition Date">
                <input
                  type="date"
                  value={form.acquisitionDate}
                  onChange={set('acquisitionDate')}
                  className="w-full rounded-md border border-zinc-700 px-3.5 py-2.5 text-sm bg-zinc-800 text-white hover:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-150 [color-scheme:dark]"
                />
              </Field>
            </div>
          </div>

          <div className="border-t border-zinc-800" />

          {/* Section: Additional Details */}
          <div>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3">
              Additional Details
            </p>
            <div className="space-y-4">
              <Field label="Description">
                <textarea
                  rows={3}
                  placeholder="Brief description of the equipment, condition, or notes…"
                  value={form.description}
                  onChange={set('description')}
                  className="
                    w-full rounded-md border border-zinc-700 px-3.5 py-2.5 text-sm
                    bg-zinc-800 text-white placeholder:text-zinc-600
                    hover:border-zinc-600 focus:outline-none focus:ring-2
                    focus:ring-brand-500 focus:border-brand-500
                    transition-all duration-150 resize-none
                  "
                />
              </Field>
              <Field label="Accountable Person">
                <TextInput
                  placeholder="e.g. Juan Dela Cruz"
                  value={form.accountablePerson}
                  onChange={set('accountablePerson')}
                />
              </Field>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-800">
          <p className="text-xs text-zinc-600">
            Fields marked <span className="text-red-400">*</span> are required
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="md" disabled={saving}>
              {saving ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Saving…
                </span>
              ) : isEditing ? (
                <span className="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Update Record
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Save Record
                </span>
              )}
            </Button>
          </div>
        </div>
      </form>}
    </Modal>
  )
}

export default AddRecordModal
