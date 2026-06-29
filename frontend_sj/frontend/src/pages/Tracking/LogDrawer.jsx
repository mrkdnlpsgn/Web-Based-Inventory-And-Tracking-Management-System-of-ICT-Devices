import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'

function actionColor(action = '') {
  const a = action.toLowerCase()
  if (a.includes('checked out'))                                         return 'orange'
  if (a.includes('checked in'))                                          return 'green'
  if (a.includes('transferred'))                                         return 'blue'
  if (a.includes('maintenance') || a.includes('repaired'))               return 'yellow'
  if (a.includes('decommissioned') || a.includes('disposed') || a.includes('missing')) return 'red'
  if (a.includes('found'))                                               return 'green'
  return 'gray'
}

function formatDateTime(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('en-PH', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

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

function LogDrawer({ log, exiting, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <>
      {/* Backdrop — fades in on open, fades out on close */}
      <div
        className={`fixed inset-0 z-[9998] bg-zinc-950/40 ${exiting ? 'animate-fade-out' : 'animate-fade-in'}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Activity log detail"
        className={`fixed inset-y-0 right-0 z-[9999] w-full sm:w-[400px] bg-white dark:bg-zinc-900 border-l border-slate-200 dark:border-zinc-800 flex flex-col shadow-2xl shadow-black/30 ${
          exiting ? 'animate-slide-out-drawer' : 'animate-slide-in-drawer'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-zinc-800 flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-base font-bold text-slate-900 dark:text-white leading-snug truncate">
                {log.article || log.itemCode || 'Activity Log'}
              </p>
              {log.itemCode && log.article && (
                <span className="inline-block mt-1.5 font-mono text-xs text-slate-400 dark:text-zinc-500 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-2 py-0.5 rounded">
                  {log.itemCode}
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

          {/* Action badge + timestamp */}
          <div className="flex items-center gap-3 mt-3">
            {log.action && <Badge label={log.action} color={actionColor(log.action)} />}
            <span className="text-xs text-slate-400 dark:text-zinc-500">{formatDateTime(log.createdAt)}</span>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Equipment */}
          <section>
            <p className="text-2xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
              Equipment
            </p>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3.5">
              <Field label="Article" value={log.article} full />
              <Field label="Item Code" value={log.itemCode} mono />
              <Field label="Equipment Type" value={log.equipmentType} />
              <Field label="Office" value={log.office} />
            </dl>
          </section>

          {/* Action details */}
          <section>
            <p className="text-2xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
              Action Details
            </p>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3.5">
              <Field label="Performed By" value={log.performedBy} />
              <Field label="Location" value={log.location} />
              {log.serialNumbers && (
                <Field label="Serial Number(s)" value={log.serialNumbers} mono full />
              )}
            </dl>
          </section>

          {/* Notes */}
          {log.notes && (
            <section>
              <p className="text-2xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                Notes
              </p>
              <p className="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                {log.notes}
              </p>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-zinc-800 flex-shrink-0 flex justify-end">
          <Button variant="secondary" size="md" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </>,
    document.body
  )
}

export default LogDrawer
