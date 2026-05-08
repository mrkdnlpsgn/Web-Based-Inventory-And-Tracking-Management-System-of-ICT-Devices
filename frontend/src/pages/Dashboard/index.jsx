import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { setItems } from '../../store/slices/inventorySlice'
import MainLayout from '../../components/layout/MainLayout'
import { getEquipment } from '../../services/inventoryService'
import { getTrackingLogs } from '../../services/trackingService'
import { getUsers } from '../../services/userService'

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
  return '₱' + Number(v).toLocaleString('en-PH', { minimumFractionDigits: 2 })
}

function actionStyle(action = '') {
  const a = action.toLowerCase()
  if (a.includes('checked out'))                                         return { dot: 'bg-orange-400',  text: 'text-orange-400' }
  if (a.includes('checked in'))                                          return { dot: 'bg-emerald-400', text: 'text-emerald-400' }
  if (a.includes('transferred'))                                         return { dot: 'bg-blue-400',    text: 'text-blue-400' }
  if (a.includes('maintenance') || a.includes('repaired'))               return { dot: 'bg-amber-400',   text: 'text-amber-400' }
  if (a.includes('decommissioned') || a.includes('disposed') || a.includes('missing')) return { dot: 'bg-red-400', text: 'text-red-400' }
  if (a.includes('found'))                                               return { dot: 'bg-emerald-400', text: 'text-emerald-400' }
  if (a.includes('qr'))                                                  return { dot: 'bg-blue-400',    text: 'text-blue-400' }
  return { dot: 'bg-zinc-500', text: 'text-zinc-400' }
}

function groupByType(items) {
  const map = {}
  items.forEach((item) => {
    const key = item.equipmentType || 'Unclassified'
    map[key] = (map[key] || 0) + 1
  })
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([type, count]) => ({ type, count }))
}

// ── Skeleton pulse ────────────────────────────────────────────────────────────
function Skeleton({ className }) {
  return <div className={`animate-pulse bg-zinc-800 rounded ${className}`} />
}

const quickLinks = [
  { label: 'Add Inventory Record', to: '/inventory' },
  { label: 'View Tracking Logs',   to: '/tracking' },
  { label: 'Scan QR Code',         to: '/qr-scanner' },
  { label: 'Generate Report',      to: '/reports' },
]

// ── Component ─────────────────────────────────────────────────────────────────
function Dashboard() {
  const dispatch = useDispatch()

  const [loading, setLoading]         = useState(true)
  const [equipment, setEquipment]     = useState([])
  const [recentLogs, setRecentLogs]   = useState([])
  const [totalLogs, setTotalLogs]     = useState(0)
  const [userCount, setUserCount]     = useState(0)

  useEffect(() => {
    Promise.all([
      getEquipment().catch(() => ({ data: [] })),
      getTrackingLogs().catch(() => ({ data: [] })),
      getUsers().catch(() => ({ data: [] })),
    ]).then(([eqRes, logRes, userRes]) => {
      const eq   = eqRes.data  ?? []
      const logs = logRes.data ?? []
      const users = userRes.data ?? []

      setEquipment(eq)
      dispatch(setItems(eq))           // keep Redux in sync
      setRecentLogs(logs.slice(0, 8))
      setTotalLogs(logs.length)
      setUserCount(users.length)
      setLoading(false)
    })
  }, [dispatch])

  // ── Derived stats ───────────────────────────────────────────────────────────
  const totalAssets = equipment.length
  const totalValue  = equipment.reduce((s, i) => s + (Number(i.amountValue) || 0), 0)
  const typeBreakdown = groupByType(equipment)
  const maxTypeCount  = typeBreakdown[0]?.count || 1

  // ── Stat card definitions ───────────────────────────────────────────────────
  const stats = [
    {
      label:       'Total ICT Assets',
      value:       loading ? null : totalAssets,
      description: 'Registered equipment records',
      accent:      'border-t-brand-500',
      iconBg:      'bg-brand-500/10',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      label:       'Total Asset Value',
      value:       loading ? null : fmtMoney(totalValue),
      description: 'Combined acquisition value',
      accent:      'border-t-amber-500',
      iconBg:      'bg-amber-950',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
        </svg>
      ),
    },
    {
      label:       'Activity Logs',
      value:       loading ? null : totalLogs,
      description: 'Total tracking entries logged',
      accent:      'border-t-emerald-500',
      iconBg:      'bg-emerald-950',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      label:       'System Accounts',
      value:       loading ? null : userCount,
      description: 'Registered admin & staff users',
      accent:      'border-t-zinc-500',
      iconBg:      'bg-zinc-800',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-zinc-400" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
      ),
    },
  ]

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <MainLayout>

      {/* ── Stat cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        {stats.map(({ label, value, description, accent, iconBg, icon }) => (
          <div
            key={label}
            className={`bg-zinc-900 rounded-xl border border-zinc-800 border-t-2 ${accent} p-5 transition-all duration-200 hover:border-zinc-700 hover:-translate-y-0.5`}
          >
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{label}</p>
                {loading ? (
                  <Skeleton className="h-9 w-20 mt-2 mb-1" />
                ) : (
                  <p className="text-3xl font-bold text-white mt-1 truncate">{value}</p>
                )}
                <p className="text-xs text-zinc-600 mt-1">{description}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0 ml-3`}>
                {icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Recent Activity feed */}
        <div className="lg:col-span-2 bg-zinc-900 rounded-xl border border-zinc-800 flex flex-col">
          <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between">
            <p className="text-sm font-semibold text-zinc-300">Recent Activity</p>
            {!loading && recentLogs.length > 0 && (
              <Link to="/tracking" className="text-xs text-brand-500 hover:text-brand-400 transition-colors">
                View all →
              </Link>
            )}
          </div>

          <div className="flex-1 divide-y divide-zinc-800/60">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-5 py-4 flex items-start gap-3">
                  <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-3 w-14 flex-shrink-0" />
                </div>
              ))
            ) : recentLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 gap-2 text-zinc-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-zinc-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-sm">No activity logged yet.</p>
                <Link to="/tracking" className="text-xs text-brand-500 hover:text-brand-400 mt-1">Log an activity →</Link>
              </div>
            ) : (
              recentLogs.map((log, i) => {
                const { dot, text } = actionStyle(log.action)
                return (
                  <div key={i} className="px-5 py-3.5 flex items-start gap-3 hover:bg-zinc-800/40 transition-colors duration-100">
                    {/* Dot avatar */}
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${dot}`} />
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-200 truncate">
                        <span className="font-medium">{log.article || log.itemCode || '—'}</span>
                        {' '}
                        <span className={`text-xs font-semibold ${text}`}>{log.action}</span>
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {log.performedBy ? `by ${log.performedBy}` : ''}
                        {log.performedBy && log.location ? ' · ' : ''}
                        {log.location || ''}
                      </p>
                    </div>
                    {/* Time */}
                    <span className="text-xs text-zinc-600 whitespace-nowrap flex-shrink-0 mt-0.5">{timeAgo(log.createdAt)}</span>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">

          {/* Equipment by Type */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800">
            <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between">
              <p className="text-sm font-semibold text-zinc-300">Equipment by Type</p>
              {!loading && (
                <span className="text-xs text-zinc-500">{equipment.length} total</span>
              )}
            </div>
            <div className="p-4 space-y-3">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                ))
              ) : typeBreakdown.length === 0 ? (
                <p className="text-xs text-zinc-600 text-center py-4">No equipment records yet.</p>
              ) : (
                typeBreakdown.map(({ type, count }) => (
                  <div key={type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-zinc-400 truncate max-w-[140px]" title={type}>{type}</span>
                      <span className="text-xs font-semibold text-zinc-300 ml-2 flex-shrink-0">{count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-brand-500 transition-all duration-500"
                        style={{ width: `${(count / maxTypeCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
            <p className="text-sm font-semibold text-zinc-300 mb-2">Quick Links</p>
            <div className="space-y-0.5">
              {quickLinks.map(({ label, to }) => (
                <Link
                  key={label}
                  to={to}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-all duration-150 group"
                >
                  <span>{label}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-zinc-700 group-hover:text-brand-500 transition-colors duration-150" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  )
}

export default Dashboard
