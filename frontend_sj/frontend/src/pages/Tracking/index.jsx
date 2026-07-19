import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import MainLayout from '../../components/layout/MainLayout'
import Table from '../../components/common/Table'
import Badge from '../../components/common/Badge'
import LogDrawer from './LogDrawer'
import LogEntryModal from './LogEntryModal'
import { useToast } from '../../context/ToastContext'
import { getTrackingLogs, createTrackingLog } from '../../services/trackingService'

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

const LOG_COLUMNS = [
  {
    key: 'action',
    label: 'Action',
    render: (r) => actionBadge(r.action),
  },
  {
    key: 'article',
    label: 'Article',
    render: (r) => r.article
      ? <span className="font-medium text-slate-900 dark:text-white">{r.article}</span>
      : <span className="text-slate-400 dark:text-zinc-600">—</span>,
  },
  {
    key: 'performedBy',
    label: 'Performed By',
    render: (r) => r.performedBy || <span className="text-slate-400 dark:text-zinc-600">—</span>,
  },
  {
    key: 'createdAt',
    label: 'Date & Time',
    render: (r) => <span className="text-slate-400 dark:text-zinc-400 text-xs whitespace-nowrap">{formatDateTime(r.createdAt)}</span>,
  },
  {
    key: '_open',
    label: '',
    render: () => (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-300 dark:text-zinc-700 group-hover:text-slate-400 dark:group-hover:text-zinc-500 transition-colors duration-150" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
      </svg>
    ),
  },
]

const LOG_ACTIONS = ['Checked In', 'Checked Out', 'Transferred', 'Maintenance / Repaired', 'Decommissioned / Disposed', 'Reported Missing']

function Tracking() {
  const { show } = useToast()
  const location = useLocation()
  const inventoryItems = useSelector((s) => s.inventory.items)

  const [logs, setLogs]               = useState([])
  const [logsLoading, setLogsLoading] = useState(false)
  const [logSearch, setLogSearch]     = useState('')
  const [filterAction, setFilterAction] = useState('')
  const [filterDate, setFilterDate]     = useState('')
  const [detailLog, setDetailLog]       = useState(null)
  const [logDrawerExiting, setLogDrawerExiting] = useState(false)
  const [page, setPage] = useState(1)
  const [logEntryEquipment, setLogEntryEquipment] = useState(null)
  const PAGE_SIZE = 8

  // Cleanup runs off LogDrawer's own `animationend` (see handleLogDrawerAnimationEnd
  // below), not a hand-timed setTimeout — avoids a stale timer clobbering a
  // newly-opened log if the drawer is reopened before the old close finishes.
  const closeLogDrawer = useCallback(() => {
    setLogDrawerExiting(true)
  }, [])

  const handleLogDrawerAnimationEnd = useCallback(() => {
    setDetailLog(null)
    setLogDrawerExiting(false)
  }, [])

  const loadLogs = useCallback(async () => {
    setLogsLoading(true)
    try {
      const res = await getTrackingLogs()
      setLogs(res.data)
    } catch {
      show('Failed to load activity logs.', 'error')
    } finally {
      setLogsLoading(false)
    }
  }, [show])

  useEffect(() => { loadLogs() }, [loadLogs])

  // Auto-open log modal when arriving from Smart Suggestions
  useEffect(() => {
    const id = location.state?.preSelectEquipmentId
    if (!id || inventoryItems.length === 0) return
    const equipment = inventoryItems.find((item) => item.id === id)
    if (equipment) setLogEntryEquipment(equipment)
  }, [location.state, inventoryItems])

  const handleSaveLog = async (data) => {
    try {
      await createTrackingLog(data)
      show('Activity logged successfully.', 'success')
      loadLogs()
    } catch {
      show('Failed to save log entry.', 'error')
    }
  }

  const hasLogFilters = filterAction || filterDate

  useEffect(() => { setPage(1) }, [logSearch, filterAction, filterDate])

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
    if (logSearch.trim()) {
      const q = logSearch.toLowerCase()
      const match = ['action', 'performedBy', 'location', 'notes', 'serialNumbers'].some(
        (k) => String(log[k] ?? '').toLowerCase().includes(q)
      )
      if (!match) return false
    }
    if (filterAction && log.action !== filterAction) return false
    if (filterDate) {
      const logTime = new Date(log.createdAt)
      const cutoff  = new Date()
      if (filterDate === 'today')   { cutoff.setHours(0, 0, 0, 0) }
      else if (filterDate === '7d') { cutoff.setDate(cutoff.getDate() - 7);  cutoff.setHours(0, 0, 0, 0) }
      else if (filterDate === '30d'){ cutoff.setDate(cutoff.getDate() - 30); cutoff.setHours(0, 0, 0, 0) }
      if (logTime < cutoff) return false
    }
    return true
  })}, [logs, logSearch, filterAction, filterDate])

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE))
  const pagedLogs  = filteredLogs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <MainLayout>
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300">All Activity Logs</p>
            {!logsLoading && (
              <p className="text-xs text-slate-400 dark:text-zinc-500 mt-px">{filteredLogs.length} {filteredLogs.length === 1 ? 'entry' : 'entries'}</p>
            )}
          </div>
          <div className="flex flex-col gap-2 w-full sm:w-auto sm:items-end">
            {/* Search + date + add log */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-52 sm:flex-none">
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
              <div className="relative">
                <select
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="appearance-none text-sm rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all duration-150"
                >
                  <option value="">All time</option>
                  <option value="today">Today</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                </select>
                <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <button
                onClick={() => setLogEntryEquipment({})}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg bg-brand-500 hover:bg-brand-600 text-white transition-colors duration-150 whitespace-nowrap"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Log
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {['', ...LOG_ACTIONS].map((action) => (
                <button
                  key={action}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setFilterAction(action)}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all duration-150 ${
                    filterAction === action
                      ? 'bg-brand-500 text-white ring-1 ring-brand-500'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {action || 'All Actions'}
                </button>
              ))}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { setFilterAction(''); setFilterDate('') }}
                className={`flex items-center gap-1 text-xs px-2 py-1 transition-all duration-150 ${
                  hasLogFilters
                    ? 'text-slate-400 hover:text-red-400'
                    : 'opacity-0 pointer-events-none'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Clear
              </button>
            </div>
          </div>
        </div>

        <div className="p-4">
          {logsLoading ? (
            <div className="divide-y divide-zinc-800/60">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
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
              data={pagedLogs}
              onRowClick={(row) => setDetailLog(row)}
              emptyMessage="No activity logs yet. Scan a device QR code to log an activity."
              minRows={PAGE_SIZE}
              mobileRender={(row) => (
                <div className="flex items-start gap-3 py-3.5">
                  <div className="flex-shrink-0 mt-0.5">{actionBadge(row.action)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{row.article || row.itemCode || '—'}</p>
                    <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5 truncate">
                      {[row.performedBy, row.location].filter(Boolean).join(' · ') || '—'}
                    </p>
                  </div>
                  <time className="flex-shrink-0 text-2xs text-slate-400 dark:text-zinc-600 whitespace-nowrap mt-1">
                    {formatDateTime(row.createdAt)}
                  </time>
                </div>
              )}
            />
          )}
        </div>

        {/* Pagination */}
        {!logsLoading && filteredLogs.length > PAGE_SIZE && (
          <div className="px-5 py-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3">
            <p className="text-xs text-slate-400 dark:text-zinc-500">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredLogs.length)} of {filteredLogs.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2.5 py-1.5 text-xs rounded-md border border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Prev
              </button>
              <div className="flex items-center justify-center gap-1 min-w-[12rem]">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…')
                    acc.push(p)
                    return acc
                  }, [])
                  .map((item, idx) =>
                    item === '…' ? (
                      <span key={`ellipsis-${idx}`} className="px-1.5 text-xs text-slate-300 dark:text-zinc-600">…</span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setPage(item)}
                        className={`w-7 h-7 text-xs rounded-md font-medium transition-colors ${
                          page === item
                            ? 'bg-brand-500 text-white'
                            : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700'
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-2.5 py-1.5 text-xs rounded-md border border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {(detailLog || logDrawerExiting) && (
        <LogDrawer
          log={detailLog ?? {}}
          exiting={logDrawerExiting}
          onClose={closeLogDrawer}
          onExitAnimationEnd={handleLogDrawerAnimationEnd}
        />
      )}

      {logEntryEquipment !== null && (
        <LogEntryModal
          onClose={() => setLogEntryEquipment(null)}
          onSave={handleSaveLog}
          initialEquipment={logEntryEquipment?.id ? logEntryEquipment : null}
        />
      )}
    </MainLayout>
  )
}

export default Tracking
