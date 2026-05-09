import { useState, useEffect, useCallback, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { setItems } from '../../store/slices/inventorySlice'
import MainLayout from '../../components/layout/MainLayout'
import { getEquipment } from '../../services/inventoryService'
import { getTrackingLogs } from '../../services/trackingService'
import { getUsers } from '../../services/userService'

// ── Count-up hook ─────────────────────────────────────────────────────────────
function useCountUp(target, active) {
  const [value, setValue] = useState(0)
  const rafRef = useRef(null)

  useEffect(() => {
    cancelAnimationFrame(rafRef.current)

    if (!active) {
      setValue(target)
      return
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced || target === 0) {
      setValue(target)
      return
    }

    setValue(0)
    const start = performance.now()
    const DURATION = 750

    const tick = (now) => {
      const p = Math.min((now - start) / DURATION, 1)
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p) // ease-out-expo
      setValue(Math.round(eased * target))
      if (p < 1) rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, active])

  return value
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(dt) {
  if (!dt) return '—'
  const diff = Date.now() - new Date(dt).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'Just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7)  return `${d}d ago`
  return new Date(dt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
}

function fmtMoney(v) {
  if (!v) return '₱0.00'
  const n = Number(v)
  if (n >= 1_000_000) return '₱' + (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000)     return '₱' + (n / 1_000).toFixed(0) + 'K'
  return '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2 })
}

function groupByType(items) {
  const map = {}
  items.forEach((item) => {
    const key   = item.equipmentType || item.type || 'Unclassified'
    const units = item.deviceCount > 0 ? item.deviceCount : 1
    map[key] = (map[key] || 0) + units
  })
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([type, count]) => ({ type, count }))
}

function actionConfig(action = '') {
  const a = action.toLowerCase()
  if (a.includes('checked out'))
    return { label: 'Checked Out', color: 'text-orange-400',  bg: 'bg-orange-400/10' }
  if (a.includes('checked in'))
    return { label: 'Checked In',  color: 'text-emerald-400', bg: 'bg-emerald-400/10' }
  if (a.includes('transferred'))
    return { label: 'Transferred', color: 'text-blue-400',    bg: 'bg-blue-400/10' }
  if (a.includes('maintenance') || a.includes('repaired'))
    return { label: 'Repaired',    color: 'text-amber-400',   bg: 'bg-amber-400/10' }
  if (a.includes('decommissioned') || a.includes('disposed'))
    return { label: 'Disposed',    color: 'text-red-400',     bg: 'bg-red-400/10' }
  if (a.includes('missing'))
    return { label: 'Missing',     color: 'text-red-400',     bg: 'bg-red-400/10' }
  if (a.includes('found'))
    return { label: 'Found',       color: 'text-emerald-400', bg: 'bg-emerald-400/10' }
  if (a.includes('qr'))
    return { label: 'QR Scanned',  color: 'text-blue-400',    bg: 'bg-blue-400/10' }
  return   { label: action || 'Updated', color: 'text-zinc-400', bg: 'bg-zinc-400/10' }
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Sk({ className }) {
  return <div className={`animate-pulse rounded bg-slate-200 dark:bg-zinc-800 ${className}`} />
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatStrip({ stats, loading }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
      <div className="grid grid-cols-2 xl:grid-cols-4 divide-x divide-y xl:divide-y-0 divide-slate-200 dark:divide-zinc-800">
        {stats.map(({ label, value, sub, href, icon }) => (
          <Link
            key={label}
            to={href}
            className="group flex items-start gap-3 px-5 py-4 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors duration-150"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 mt-0.5 text-slate-400 dark:text-zinc-500 group-hover:text-brand-500 dark:group-hover:text-brand-400 group-hover:bg-brand-500/10 transition-all duration-150">
              {icon}
            </div>
            <div className="min-w-0">
              <p className="text-2xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider leading-none">
                {label}
              </p>
              {loading ? (
                <Sk className="h-7 w-16 mt-2 mb-1" />
              ) : (
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5 leading-none tabular-nums truncate">
                  {value}
                </p>
              )}
              <p className="text-xs text-slate-400 dark:text-zinc-600 mt-1 leading-tight">{sub}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function QuickActions() {
  const actions = [
    {
      label: 'Add Record',
      desc:  'Log new equipment',
      to:    '/inventory',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      label: 'Tracking Logs',
      desc:  'View recent activity',
      to:    '/tracking',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      label: 'Scan QR',
      desc:  'Identify by QR code',
      to:    '/qr-scanner',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1zM11 7a1 1 0 112 0v1h1a1 1 0 110 2h-2a1 1 0 01-1-1V7zM7 11a1 1 0 100 2h1v1a1 1 0 102 0v-2a1 1 0 00-1-1H7zM13 11a1 1 0 100 2h.01a1 1 0 100-2H13zM15 13a1 1 0 100 2h.01a1 1 0 100-2H15zM13 15a1 1 0 100 2h.01a1 1 0 100-2H13z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      label: 'Reports',
      desc:  'Export audit reports',
      to:    '/reports',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
      {actions.map(({ label, desc, to, icon }) => (
        <Link
          key={label}
          to={to}
          className="group flex items-center gap-3 px-3.5 py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl hover:border-brand-500/40 hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition-all duration-150"
        >
          <span className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 group-hover:bg-brand-500/15 group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-all duration-150">
            {icon}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-700 dark:text-zinc-200 leading-tight truncate">{label}</p>
            <p className="text-xs text-slate-400 dark:text-zinc-600 leading-tight mt-0.5 hidden sm:block truncate">{desc}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}

function ActivityFeed({ logs, loading }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-col">
      <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700 dark:text-zinc-200">Recent Activity</p>
        {!loading && logs.length > 0 && (
          <Link to="/tracking" className="text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors duration-150">
            View all
          </Link>
        )}
      </div>

      <div className="flex-1 divide-y divide-slate-100 dark:divide-zinc-800/70">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="px-5 py-3.5 flex items-start gap-3">
              <Sk className="w-14 h-5 rounded flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <Sk className="h-3.5 w-3/4" />
                <Sk className="h-3 w-1/2" />
              </div>
              <Sk className="h-3 w-12 flex-shrink-0 mt-1" />
            </div>
          ))
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-slate-200 dark:text-zinc-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm text-slate-400 dark:text-zinc-600">No activity logged yet.</p>
            <Link to="/tracking" className="text-xs text-brand-400 hover:text-brand-300 font-medium mt-1 transition-colors">
              Log an activity
            </Link>
          </div>
        ) : (
          logs.map((log, i) => {
            const cfg = actionConfig(log.action)
            return (
              <div
                key={i}
                className="px-5 py-3 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors duration-100"
              >
                <span
                  className={`flex-shrink-0 mt-0.5 inline-flex items-center px-2 py-0.5 rounded text-2xs font-semibold leading-none whitespace-nowrap ${cfg.color} ${cfg.bg}`}
                >
                  {cfg.label}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 dark:text-zinc-200 leading-snug truncate font-medium">
                    {log.article || log.itemCode || '—'}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5 leading-snug truncate">
                    {log.performedBy && <span className="text-slate-500 dark:text-zinc-400">{log.performedBy}</span>}
                    {log.performedBy && log.location ? ' · ' : ''}
                    {log.location}
                  </p>
                </div>

                <time
                  dateTime={log.createdAt}
                  title={log.createdAt ? new Date(log.createdAt).toLocaleString('en-PH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                  className="flex-shrink-0 text-xs text-slate-400 dark:text-zinc-600 whitespace-nowrap mt-1 tabular-nums cursor-default"
                >
                  {timeAgo(log.createdAt)}
                </time>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

function TypeBreakdown({ breakdown, total, loading }) {
  const max = breakdown[0]?.count || 1

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800">
      <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700 dark:text-zinc-200">Equipment by Type</p>
        {!loading && (
          <span className="text-xs text-slate-400 dark:text-zinc-600 tabular-nums">{total} total</span>
        )}
      </div>

      <div className="p-4 space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between">
                <Sk className="h-3 w-28" />
                <Sk className="h-3 w-6" />
              </div>
              <Sk className="h-1.5 w-full rounded-full" />
            </div>
          ))
        ) : breakdown.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-zinc-600 text-center py-6">No equipment records yet.</p>
        ) : (
          breakdown.map(({ type, count }) => {
            const pct = Math.round((count / total) * 100)
            return (
              <div key={type}>
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className="text-xs text-slate-500 dark:text-zinc-400 truncate max-w-[150px] leading-tight"
                    title={type}
                  >
                    {type}
                  </span>
                  <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                    <span className="text-xs font-semibold text-slate-600 dark:text-zinc-300 tabular-nums">{count}</span>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-600 tabular-nums w-7 text-right">{pct}%</span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand-500 transition-all duration-700"
                    style={{ width: `${(count / max) * 100}%` }}
                  />
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard() {
  const dispatch = useDispatch()

  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(false)
  const [equipment, setEquipment]   = useState([])
  const [recentLogs, setRecentLogs] = useState([])
  const [totalLogs, setTotalLogs]   = useState(0)
  const [userCount, setUserCount]   = useState(0)

  const load = useCallback(() => {
    setLoading(true)
    setError(false)
    Promise.all([
      getEquipment().catch(() => null),
      getTrackingLogs().catch(() => null),
      getUsers().catch(() => null),
    ]).then(([eqRes, logRes, userRes]) => {
      if (!eqRes && !logRes && !userRes) {
        setError(true)
        setLoading(false)
        return
      }
      const eq    = eqRes?.data  ?? []
      const logs  = logRes?.data ?? []
      const users = userRes?.data ?? []

      setEquipment(eq)
      dispatch(setItems(eq))
      setRecentLogs(logs.slice(0, 8))
      setTotalLogs(logs.length)
      setUserCount(users.length)
      setLoading(false)
    })
  }, [dispatch])

  useEffect(() => { load() }, [load])

  const totalAssets   = equipment.reduce((s, eq) => s + (eq.deviceCount > 0 ? eq.deviceCount : 1), 0)
  const totalValue    = equipment.reduce((s, eq) =>
    s + (eq.devices || []).reduce((ds, d) => ds + (Number(d.amountValue) || 0), 0), 0)
  const typeBreakdown = groupByType(equipment)

  const animAssets = useCountUp(totalAssets, !loading)
  const animValue  = useCountUp(totalValue,  !loading)
  const animLogs   = useCountUp(totalLogs,   !loading)
  const animUsers  = useCountUp(userCount,   !loading)

  const today = new Date().toLocaleDateString('en-PH', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  const stats = [
    {
      label: 'ICT Assets',
      value: animAssets.toLocaleString(),
      sub:   'Device units registered',
      href:  '/inventory',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      label: 'Asset Value',
      value: fmtMoney(animValue),
      sub:   'Acquisition total',
      href:  '/inventory',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      label: 'Activity Logs',
      value: animLogs.toLocaleString(),
      sub:   'Tracking entries',
      href:  '/tracking',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      label: 'Accounts',
      value: animUsers.toLocaleString(),
      sub:   'Admin and staff users',
      href:  '/accounts',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
      ),
    },
  ]

  return (
    <MainLayout>
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <p className="text-xs text-slate-400 dark:text-zinc-600">{today}</p>

        <div className="flex items-center gap-2">
          {error && (
            <span className="text-xs text-red-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
              Load failed
            </span>
          )}
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-medium text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:border-slate-300 dark:hover:border-zinc-600 transition-all duration-150 disabled:opacity-40"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Stat strip */}
      <div className="mb-5">
        <StatStrip stats={stats} loading={loading} />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <QuickActions />
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 items-start">
        <ActivityFeed logs={recentLogs} loading={loading} />
        <TypeBreakdown breakdown={typeBreakdown} total={totalAssets} loading={loading} />
      </div>
    </MainLayout>
  )
}

export default Dashboard
