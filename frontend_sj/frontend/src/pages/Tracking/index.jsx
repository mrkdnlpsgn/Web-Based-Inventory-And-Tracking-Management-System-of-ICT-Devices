import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import MainLayout from '../../components/layout/MainLayout'
import Table from '../../components/common/Table'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import LogEntryModal from './LogEntryModal'
import { useToast } from '../../context/ToastContext'
import {
  getTrackingLogs,
  getTrackingByEquipment,
  createTrackingLog,
} from '../../services/trackingService'

// ── Badge color per action type ───────────────────────────────────────────────
function actionBadge(action) {
  if (!action) return <Badge label="—" color="gray" />
  const a = action.toLowerCase()
  if (a.includes('checked out'))                                         return <Badge label={action} color="orange" />
  if (a.includes('checked in'))                                          return <Badge label={action} color="green" />
  if (a.includes('transferred'))                                         return <Badge label={action} color="blue" />
  if (a.includes('inspected'))                                           return <Badge label={action} color="gray" />
  if (a.includes('maintenance') || a.includes('repaired'))               return <Badge label={action} color="yellow" />
  if (a.includes('decommissioned') || a.includes('disposed') || a.includes('missing')) return <Badge label={action} color="red" />
  if (a.includes('found'))                                               return <Badge label={action} color="green" />
  if (a.includes('qr'))                                                  return <Badge label={action} color="blue" />
  return <Badge label={action} color="gray" />
}

function formatDateTime(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('en-PH', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// ── Equipment table columns ───────────────────────────────────────────────────
const EQUIP_COLUMNS = [
  {
    key: 'article',
    label: 'Article',
    render: (r) => <span className="font-medium text-slate-900 dark:text-white">{r.article || '—'}</span>,
  },
  {
    key: 'itemCode',
    label: 'Item Code',
    render: (r) => <span className="font-mono text-xs text-slate-400 dark:text-zinc-400">{r.itemCode || '—'}</span>,
  },
  {
    key: 'equipmentType',
    label: 'Type of Equipment',
    render: (r) => r.equipmentType || <span className="text-slate-400 dark:text-zinc-600">—</span>,
  },
  {
    key: 'deviceCount',
    label: 'Devices',
    render: (r) => {
      const count = r.deviceCount ?? 0
      return count === 0
        ? <span className="text-slate-400 dark:text-zinc-600 text-xs">—</span>
        : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 ring-1 ring-brand-500/20">{count}</span>
    },
  },
  {
    key: 'office',
    label: 'Office',
    render: (r) => r.office || <span className="text-slate-400 dark:text-zinc-600">—</span>,
  },
]

// ── Log table columns ─────────────────────────────────────────────────────────
const LOG_COLUMNS = [
  {
    key: 'action',
    label: 'Action',
    render: (r) => actionBadge(r.action),
  },
  {
    key: 'performedBy',
    label: 'Performed By',
    render: (r) => r.performedBy || <span className="text-zinc-600">—</span>,
  },
  {
    key: 'location',
    label: 'Location',
    render: (r) => r.location || <span className="text-zinc-600">—</span>,
  },
  {
    key: 'serialNumbers',
    label: 'Serial Number(s)',
    render: (r) => r.serialNumbers
      ? <span className="font-mono text-xs text-blue-400 dark:text-blue-300 max-w-[180px] truncate block" title={r.serialNumbers}>{r.serialNumbers}</span>
      : <span className="text-slate-400 dark:text-zinc-600">—</span>,
  },
  {
    key: 'notes',
    label: 'Notes',
    render: (r) => r.notes
      ? <span className="max-w-[220px] truncate block text-slate-500 dark:text-zinc-400" title={r.notes}>{r.notes}</span>
      : <span className="text-slate-400 dark:text-zinc-600">—</span>,
  },
  {
    key: 'createdAt',
    label: 'Date & Time',
    render: (r) => <span className="text-slate-400 dark:text-zinc-400 text-xs whitespace-nowrap">{formatDateTime(r.createdAt)}</span>,
  },
]

// ── Component ─────────────────────────────────────────────────────────────────
function Tracking() {
  const { show }       = useToast()
  const inventoryItems = useSelector((s) => s.inventory.items)

  const [selectedEquip, setSelectedEquip] = useState(null)
  const [equipSearch, setEquipSearch]     = useState('')

  const [logs, setLogs]           = useState([])
  const [logsLoading, setLogsLoading] = useState(false)
  const [logSearch, setLogSearch] = useState('')

  const [showModal, setShowModal] = useState(false)

  // ── Load logs (all or for selected equipment) ─────────────────────────────
  const loadLogs = useCallback(async (equip) => {
    setLogsLoading(true)
    try {
      const res = equip
        ? await getTrackingByEquipment(equip.id)
        : await getTrackingLogs()
      setLogs(res.data)
    } catch {
      show('Failed to load activity logs.', 'error')
    } finally {
      setLogsLoading(false)
    }
  }, [show])

  // Load all logs on mount
  useEffect(() => { loadLogs(null) }, [loadLogs])

  const handleSelectEquip = (item) => {
    setSelectedEquip(item)
    setLogSearch('')
    loadLogs(item)
  }

  const handleViewAll = () => {
    setSelectedEquip(null)
    setLogSearch('')
    loadLogs(null)
  }

  const handleSave = async (data) => {
    try {
      await createTrackingLog(data)
      const equip = inventoryItems.find((i) => i.id === data.equipmentId)
      const name  = equip?.article || equip?.itemCode || 'equipment'
      show(`Updated status for ${name}`, 'success')
      loadLogs(selectedEquip)
    } catch {
      show('Failed to save log. Please try again.', 'error')
      throw new Error('save failed')
    }
  }

  // ── Filtered equipment rows ───────────────────────────────────────────────
  const filteredEquip = inventoryItems.filter((item) => {
    if (!equipSearch.trim()) return true
    const q = equipSearch.toLowerCase()
    return ['article', 'itemCode', 'equipmentType', 'office'].some(
      (k) => String(item[k] ?? '').toLowerCase().includes(q)
    )
  })

  // ── Filtered log rows ─────────────────────────────────────────────────────
  const filteredLogs = logs.filter((log) => {
    if (!logSearch.trim()) return true
    const q = logSearch.toLowerCase()
    return ['action', 'performedBy', 'location', 'notes', 'serialNumbers'].some(
      (k) => String(log[k] ?? '').toLowerCase().includes(q)
    )
  })

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <MainLayout>

      {/* ── Equipment Records table ─────────────────────────────────────── */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 mb-5">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300">Equipment Records</p>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-px">Click a row to view its tracking history</p>
          </div>
          <div className="relative w-full sm:w-64">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            <input
              type="text"
              placeholder="Filter equipment…"
              value={equipSearch}
              onChange={(e) => setEquipSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all duration-150"
            />
          </div>
        </div>

        {/* Clickable equipment rows */}
        <div className="overflow-x-auto max-h-64 overflow-y-auto">
          {inventoryItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-zinc-600">
              <p className="text-sm">No equipment records found.</p>
              <p className="text-xs text-zinc-700">Add equipment in the Inventory module first.</p>
            </div>
          ) : filteredEquip.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-8">No equipment matches your filter.</p>
          ) : (
            <table className="min-w-full text-sm divide-y divide-zinc-800">
              <thead className="bg-slate-50 dark:bg-zinc-900 sticky top-0 z-10">
                <tr>
                  {EQUIP_COLUMNS.map((c) => (
                    <th key={c.key} className="px-4 py-3 text-left text-2xs font-semibold text-slate-500 dark:text-zinc-500 uppercase tracking-wider whitespace-nowrap">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-zinc-950 divide-y divide-slate-100 dark:divide-zinc-800/60">
                {filteredEquip.map((item) => {
                  const isSelected = selectedEquip?.id === item.id
                  return (
                    <tr
                      key={item.id}
                      onClick={() => handleSelectEquip(item)}
                      className={`cursor-pointer transition-colors duration-100 ${
                        isSelected
                          ? 'bg-brand-500/10 ring-1 ring-inset ring-brand-500/30'
                          : 'hover:bg-slate-50 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {EQUIP_COLUMNS.map((c) => (
                        <td key={c.key} className="px-4 py-3 text-slate-600 dark:text-zinc-300 whitespace-nowrap">
                          {c.render ? c.render(item) : (item[c.key] || '—')}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Tracking Logs table ──────────────────────────────────────────── */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
                {selectedEquip
                  ? <>Tracking History — <span className="text-brand-400">{selectedEquip.article || selectedEquip.itemCode}</span></>
                  : 'All Activity Logs'}
              </p>
              {!logsLoading && (
                <p className="text-xs text-slate-400 dark:text-zinc-500 mt-px">{filteredLogs.length} {filteredLogs.length === 1 ? 'entry' : 'entries'}</p>
              )}
            </div>
            {selectedEquip && (
              <button
                onClick={handleViewAll}
                className="flex-shrink-0 text-xs text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600 px-2.5 py-1 rounded-md transition-colors"
              >
                View All
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-56">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              <input
                type="text"
                placeholder="Search logs…"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all duration-150"
              />
            </div>
            <Button size="md" onClick={() => setShowModal(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Log Entry
            </Button>
          </div>
        </div>

        <div className="p-4">
          {logsLoading ? (
            <div className="space-y-0 divide-y divide-zinc-800/60">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-1 py-3.5">
                  <div className="animate-pulse h-5 w-20 rounded bg-slate-200 dark:bg-zinc-800 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="animate-pulse h-3 w-2/3 rounded bg-slate-200 dark:bg-zinc-800" />
                    <div className="animate-pulse h-3 w-1/3 rounded bg-slate-200 dark:bg-zinc-800" />
                  </div>
                  <div className="animate-pulse h-3 w-12 rounded bg-slate-200 dark:bg-zinc-800 flex-shrink-0" />
                </div>
              ))}
            </div>
          ) : (
            <Table
              columns={LOG_COLUMNS}
              data={filteredLogs}
              emptyMessage={
                selectedEquip
                  ? `No activity logged for "${selectedEquip.article || selectedEquip.itemCode}" yet.`
                  : 'No activity logs found.'
              }
            />
          )}
        </div>
      </div>

      {showModal && (
        <LogEntryModal
          initialEquipment={selectedEquip}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </MainLayout>
  )
}

export default Tracking
