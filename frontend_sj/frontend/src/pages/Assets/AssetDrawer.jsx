import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMaintenanceByAsset } from '../../services/maintenanceService'
import { getDisposalByAsset } from '../../services/disposalService'
import { getHistoryByAsset } from '../../services/assetHistoryService'

const CONDITION_BADGE = {
  SERVICEABLE:   'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20',
  REPAIRABLE:    'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20',
  UNSERVICEABLE: 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20',
}
const LIFECYCLE_BADGE = {
  REGISTERED:       'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20',
  ASSIGNED:         'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20',
  TRANSFERRED:      'bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/20',
  UNDER_MAINTENANCE:'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20',
  DISPOSED:         'bg-red-500/10 text-red-400 ring-1 ring-red-500/20',
  ARCHIVED:         'bg-zinc-500/10 text-zinc-400 ring-1 ring-zinc-500/20',
}

function fmt(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
}
function php(v) {
  if (v == null) return '—'
  return '₱' + Number(v).toLocaleString('en-PH', { minimumFractionDigits: 2 })
}

export default function AssetDrawer({ asset, onClose, onEdit, isAdmin }) {
  const navigate = useNavigate()
  const [maintenance, setMaintenance] = useState([])
  const [disposal, setDisposal]       = useState([])
  const [history, setHistory]         = useState([])
  const [tab, setTab]                 = useState('details')

  useEffect(() => {
    if (!asset) return
    getHistoryByAsset(asset.id).then(({ data }) => setHistory(data)).catch(() => {})
    if (asset.condition === 'REPAIRABLE') {
      getMaintenanceByAsset(asset.id).then(({ data }) => setMaintenance(data)).catch(() => {})
    }
    if (asset.condition === 'UNSERVICEABLE') {
      getDisposalByAsset(asset.id).then(({ data }) => setDisposal(data)).catch(() => {})
    }
  }, [asset])

  if (!asset) return null

  const tabs = ['details', 'history',
    ...(asset.condition === 'REPAIRABLE' ? ['maintenance'] : []),
    ...(asset.condition === 'UNSERVICEABLE' ? ['disposal'] : []),
  ]

  return (
    <>
      <div className="fixed inset-0 z-30 bg-zinc-950/40" onClick={onClose} />
      <aside className="fixed right-0 top-0 bottom-0 z-40 w-full max-w-lg bg-white dark:bg-zinc-950 border-l border-slate-200 dark:border-zinc-800 flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start gap-3 px-5 py-4 border-b border-slate-200 dark:border-zinc-800 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <p className="font-mono text-xs text-slate-400 dark:text-zinc-500">{asset.propertyNumber}</p>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white leading-snug mt-0.5 truncate">{asset.description}</h2>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${CONDITION_BADGE[asset.condition] || ''}`}>{asset.condition}</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${LIFECYCLE_BADGE[asset.lifecycleStatus] || ''}`}>{asset.lifecycleStatus?.replace('_', ' ')}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {isAdmin && (
              <button onClick={() => onEdit(asset)} title="Edit"
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-zinc-800 px-5 gap-1 flex-shrink-0 overflow-x-auto">
          {tabs.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-2.5 text-xs font-semibold whitespace-nowrap capitalize transition-all border-b-2 ${
                tab === t ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white' : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'
              }`}>{t}</button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {tab === 'details' && (
            <div className="space-y-3">
              <Field label="Category"          value={asset.category?.categoryName} />
              <Field label="Office"            value={asset.office?.officeName} />
              <Field label="Accountable Person" value={asset.accountablePerson} />
              <Field label="Location"          value={asset.location} />
              <Field label="Quantity"          value={asset.quantity} />
              <Field label="Acquisition Date"  value={fmt(asset.acquisitionDate)} />
              <Field label="Unit Value"        value={php(asset.unitValue)} />
              <Field label="Total Value"       value={php((asset.unitValue || 0) * (asset.quantity || 1))} />
              {asset.remarks && <Field label="Remarks" value={asset.remarks} />}
              <Field label="Added"             value={fmt(asset.createdAt)} />
              <Field label="Last Updated"      value={fmt(asset.updatedAt)} />
              {asset.condition === 'REPAIRABLE' && (
                <button onClick={() => navigate(`/maintenance?assetId=${asset.id}`)}
                  className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium hover:bg-amber-500/20 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
                  View Maintenance Records
                </button>
              )}
              {asset.condition === 'UNSERVICEABLE' && (
                <button onClick={() => navigate(`/disposal?assetId=${asset.id}`)}
                  className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  View Disposal Records
                </button>
              )}
            </div>
          )}

          {tab === 'history' && (
            <div className="space-y-2">
              {history.length === 0
                ? <p className="text-sm text-zinc-500 py-8 text-center">No history recorded.</p>
                : history.map((h) => (
                  <div key={h.id} className="px-3.5 py-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-700 dark:text-zinc-200">{h.eventType}</span>
                      <span className="text-xs text-slate-400">{fmt(h.eventDate)}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">By: {h.performedBy?.fullName || h.performedBy?.username || '—'}</p>
                    {h.notes && <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 italic">{h.notes}</p>}
                  </div>
                ))
              }
            </div>
          )}

          {tab === 'maintenance' && (
            <div className="space-y-2">
              {maintenance.length === 0
                ? <p className="text-sm text-zinc-500 py-8 text-center">No maintenance records.</p>
                : maintenance.map((m) => (
                  <div key={m.id} className="px-3.5 py-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-700 dark:text-zinc-200">{m.maintenanceType}</span>
                      <span className={`inline-flex px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                        m.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' :
                        m.status === 'ONGOING'   ? 'bg-amber-500/10 text-amber-400'    : 'bg-blue-500/10 text-blue-400'
                      }`}>{m.status}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 line-clamp-2">{m.findings}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{fmt(m.maintenanceDate)}{m.cost != null ? ` · ${php(m.cost)}` : ''}</p>
                  </div>
                ))
              }
            </div>
          )}

          {tab === 'disposal' && (
            <div className="space-y-2">
              {disposal.length === 0
                ? <p className="text-sm text-zinc-500 py-8 text-center">No disposal records.</p>
                : disposal.map((d) => (
                  <div key={d.id} className="px-3.5 py-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-700 dark:text-zinc-200">{d.recommendedMethod}</span>
                      <span className={`inline-flex px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                        d.disposalStatus === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' :
                        d.disposalStatus === 'APPROVED'  ? 'bg-blue-500/10 text-blue-400'       : 'bg-amber-500/10 text-amber-400'
                      }`}>{d.disposalStatus}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 line-clamp-2">{d.reason}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Inspected: {fmt(d.inspectionDate)}</p>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

function Field({ label, value }) {
  return (
    <div className="flex items-start gap-2 py-2 border-b border-slate-100 dark:border-zinc-800/60 last:border-0">
      <span className="text-xs text-slate-400 dark:text-zinc-500 w-36 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-slate-900 dark:text-zinc-200 font-medium break-words">{value ?? '—'}</span>
    </div>
  )
}
