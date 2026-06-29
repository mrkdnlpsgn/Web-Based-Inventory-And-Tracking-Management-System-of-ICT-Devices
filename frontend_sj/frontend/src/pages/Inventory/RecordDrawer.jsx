import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import Button from '../../components/common/Button'

const fmtMoney = (v) =>
  v != null ? '₱' + Number(v).toLocaleString('en-PH', { minimumFractionDigits: 2 }) : '—'

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'

function Field({ label, value, mono, full, breakAll }) {
  return (
    <div className={`min-w-0 ${full ? 'col-span-2' : ''}`}>
      <dt className="text-xs text-slate-400 dark:text-zinc-500 leading-none">{label}</dt>
      <dd className={`mt-1 text-sm text-slate-700 dark:text-zinc-200 leading-snug ${mono ? 'font-mono text-xs' : ''} ${breakAll ? 'break-all' : 'break-words'}`}>
        {value || <span className="text-slate-300 dark:text-zinc-600">—</span>}
      </dd>
    </div>
  )
}

function RecordDrawer({ record, exiting, onClose, onEdit, onQR, onDelete }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const devices = record.devices || []

  return createPortal(
    <>
      {/* Backdrop — fades in on open, fades out on close */}
      <div
        className={`fixed inset-0 z-30 bg-zinc-950/40 ${exiting ? 'animate-fade-out' : 'animate-fade-in'}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel — slides in from right on open, slides out on close */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={record.article || 'Equipment details'}
        className={`fixed inset-y-0 right-0 z-40 w-full sm:w-[440px] bg-white dark:bg-zinc-900 border-l border-slate-200 dark:border-zinc-800 flex flex-col shadow-2xl shadow-black/30 ${
          exiting ? 'animate-slide-out-drawer' : 'animate-slide-in-drawer'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-zinc-800 flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-snug truncate">
                {record.article || '—'}
              </h2>
              {record.itemCode && (
                <span className="inline-block mt-1.5 font-mono text-xs text-slate-400 dark:text-zinc-500 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-2 py-0.5 rounded">
                  {record.itemCode}
                </span>
              )}
            </div>
            <button
              autoFocus
              onClick={onClose}
              aria-label="Close panel"
              className="p-1.5 rounded-md text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all duration-150 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1 dark:focus:ring-offset-zinc-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Summary chips */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {record.equipmentType && (
              <span className="text-xs text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                {record.equipmentType}
              </span>
            )}
            {devices.length > 0 && (
              <span className="text-xs font-medium text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-md">
                {devices.length} device{devices.length !== 1 ? 's' : ''}
              </span>
            )}
            {record.amountValue && (
              <span className="text-xs font-medium text-slate-600 dark:text-zinc-300">
                {fmtMoney(record.amountValue)}
              </span>
            )}
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 space-y-6">

            {/* Classification */}
            <section>
              <p className="text-2xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
                Classification
              </p>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3.5">
                <Field label="Type" value={record.type} />
                <Field label="Equipment Type" value={record.equipmentType} />
              </dl>
            </section>

            {/* Location */}
            <section>
              <p className="text-2xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
                Location
              </p>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3.5">
                <Field label="Office" value={record.office} />
                <Field label="Location" value={record.location} />
              </dl>
            </section>

            {/* Accountable person */}
            <section>
              <p className="text-2xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
                Accountable Person
              </p>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3.5">
                <Field label="Name" value={record.accountablePerson} full />
                <Field label="Phone" value={record.accountablePersonPhone} />
                <Field label="Email" value={record.accountablePersonEmail} full breakAll />
              </dl>
            </section>

            {/* Description */}
            {record.description && (
              <section>
                <p className="text-2xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                  Description
                </p>
                <p className="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">
                  {record.description}
                </p>
              </section>
            )}

            {/* Devices */}
            {devices.length > 0 && (
              <section>
                <p className="text-2xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
                  Devices ({devices.length})
                </p>
                <div className="space-y-2">
                  {devices.map((d, i) => (
                    <div
                      key={d.id ?? i}
                      className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50 px-3.5 py-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-700 dark:text-zinc-200 truncate">
                            {d.model || <span className="text-slate-400 dark:text-zinc-600 font-normal">No model</span>}
                          </p>
                          {d.serialNumber && (
                            <p className="font-mono text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
                              {d.serialNumber}
                            </p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          {d.amountValue && (
                            <p className="text-sm font-medium text-slate-600 dark:text-zinc-300">
                              {fmtMoney(d.amountValue)}
                            </p>
                          )}
                          {d.acquisitionDate && (
                            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
                              {fmtDate(d.acquisitionDate)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-zinc-800 flex-shrink-0 flex items-center justify-between gap-2">
          <Button
            variant="danger"
            size="md"
            onClick={() => { onClose(); onDelete(record) }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Delete
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" size="md" onClick={() => onQR(record)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1zM11 7a1 1 0 112 0v1h1a1 1 0 110 2h-2a1 1 0 01-1-1V7zM7 11a1 1 0 100 2h1v1a1 1 0 102 0v-2a1 1 0 00-1-1H7zM13 11a1 1 0 100 2h.01a1 1 0 100-2H13zM15 13a1 1 0 100 2h.01a1 1 0 100-2H15zM13 15a1 1 0 100 2h.01a1 1 0 100-2H13z" clipRule="evenodd" />
              </svg>
              QR Code
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => { onClose(); onEdit(record) }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Edit
            </Button>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}

export default RecordDrawer
