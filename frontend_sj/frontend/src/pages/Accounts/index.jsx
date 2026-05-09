import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useToast } from '../../context/ToastContext'
import MainLayout from '../../components/layout/MainLayout'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import UserModal from './UserModal'
import { getUsers, createUser, updateUser, deleteUser } from '../../services/userService'
import { getAuditLogs } from '../../services/auditLogService'

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDateTime(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('en-PH', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

const ACTION_STYLES = {
  CREATE: { bg: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20', label: 'CREATE' },
  UPDATE: { bg: 'bg-blue-500/10 text-blue-400 ring-blue-500/20',         label: 'UPDATE' },
  DELETE: { bg: 'bg-red-500/10 text-red-400 ring-red-500/20',            label: 'DELETE' },
}

const MODULE_STYLES = {
  EQUIPMENT: { bg: 'bg-brand-500/10 text-brand-400 ring-brand-500/20' },
  DEVICE:    { bg: 'bg-violet-500/10 text-violet-400 ring-violet-500/20' },
  TRACKING:  { bg: 'bg-amber-500/10 text-amber-400 ring-amber-500/20' },
  USER:      { bg: 'bg-zinc-500/10 text-zinc-400 ring-zinc-500/20' },
}

const ALL_MODULES  = ['ALL', 'EQUIPMENT', 'DEVICE', 'TRACKING', 'USER']
const ALL_ACTIONS  = ['ALL', 'CREATE', 'UPDATE', 'DELETE']

// ── Accounts tab ──────────────────────────────────────────────────────────────
function AccountsTab() {
  const toast = useToast()
  const [users, setUsers]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing]       = useState(null)
  const [deleting, setDeleting]     = useState(null)

  const load = useCallback(async () => {
    try {
      const { data } = await getUsers()
      setUsers(data)
    } catch {
      toast.show('Failed to load accounts.', 'error')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { load() }, [load])

  const handleCreate = async (form) => {
    const { data } = await createUser(form)
    setUsers((prev) => [...prev, data])
    toast.show(`Account for ${data.name} created.`, 'success')
  }

  const handleUpdate = async (form) => {
    const { data } = await updateUser(editing.id, form)
    setUsers((prev) => prev.map((u) => (u.id === data.id ? data : u)))
    toast.show('Account updated.', 'success')
  }

  const handleDelete = async () => {
    try {
      await deleteUser(deleting.id)
      setUsers((prev) => prev.filter((u) => u.id !== deleting.id))
      toast.show(`Account "${deleting.name}" removed.`, 'warning')
    } catch (err) {
      toast.show(err.response?.data?.message || 'Failed to delete account.', 'error')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-slate-400 dark:text-zinc-500">Manage staff and administrator accounts</p>
        <Button size="md" onClick={() => setShowCreate(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Account
        </Button>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center gap-3">
          <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300">All Accounts</p>
          {users.length > 0 && (
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-2 py-0.5 rounded-full">
              {users.length} account{users.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {loading ? (
          <div className="divide-y divide-zinc-800/60">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                <div className="animate-pulse w-8 h-8 rounded-full bg-slate-200 dark:bg-zinc-800 flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="animate-pulse h-3 w-32 rounded bg-slate-200 dark:bg-zinc-800" />
                  <div className="animate-pulse h-3 w-48 rounded bg-slate-200 dark:bg-zinc-800" />
                </div>
                <div className="animate-pulse h-5 w-20 rounded-full bg-slate-200 dark:bg-zinc-800" />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm text-zinc-400 font-medium">No accounts yet</p>
            <p className="text-xs text-zinc-600 mt-1">Add a new account using the button above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm divide-y divide-slate-100 dark:divide-zinc-800">
              <thead>
                <tr>
                  {['Name', 'Email', 'Role', ''].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-2xs font-semibold text-slate-500 dark:text-zinc-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors duration-100">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-slate-600 dark:text-zinc-300">{user.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <span className="font-medium text-slate-900 dark:text-white">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-zinc-400">{user.email}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={user.role === 'admin' ? 'brand' : 'default'}>
                        {user.role === 'admin' ? 'Administrator' : 'Staff'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setEditing(user)} title="Edit account"
                          className="p-1.5 rounded-md text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all duration-150">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button onClick={() => setDeleting(user)} title="Delete account"
                          className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-950/40 transition-all duration-150">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreate && <UserModal onClose={() => setShowCreate(false)} onSave={handleCreate} />}
      {editing   && <UserModal initial={editing} onClose={() => setEditing(null)} onSave={handleUpdate} />}
      {deleting  && (
        <ConfirmDialog
          title="Delete this account?"
          message={`"${deleting.name}" (${deleting.email}) will be permanently removed.`}
          confirmLabel="Delete Account"
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  )
}

// ── Audit Logs tab ────────────────────────────────────────────────────────────
function AuditLogsTab() {
  const toast                           = useToast()
  const [logs, setLogs]                 = useState([])
  const [loading, setLoading]           = useState(true)
  const [moduleFilter, setModuleFilter] = useState('ALL')
  const [actionFilter, setActionFilter] = useState('ALL')
  const [search, setSearch]             = useState('')

  useEffect(() => {
    getAuditLogs()
      .then(({ data }) => setLogs(data))
      .catch(() => toast.show('Failed to load audit logs.', 'error'))
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = logs.filter((l) => {
    if (moduleFilter !== 'ALL' && l.module !== moduleFilter) return false
    if (actionFilter !== 'ALL' && l.action !== actionFilter) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      return (
        l.description?.toLowerCase().includes(q) ||
        l.performedBy?.toLowerCase().includes(q)
      )
    }
    return true
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <input
            type="text" placeholder="Search description or user…"
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
          />
        </div>

        {/* Module filter */}
        <div className="flex items-center gap-1.5">
          {ALL_MODULES.map((m) => (
            <button key={m} onClick={() => setModuleFilter(m)}
              className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
                moduleFilter === m
                  ? 'bg-brand-500 text-white'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
              }`}>
              {m}
            </button>
          ))}
        </div>

        {/* Action filter */}
        <div className="flex items-center gap-1.5">
          {ALL_ACTIONS.map((a) => {
            const style = ACTION_STYLES[a]
            return (
              <button key={a} onClick={() => setActionFilter(a)}
                className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
                  actionFilter === a
                    ? (style ? style.bg + ' ring-1' : 'bg-brand-500 text-white')
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
                }`}>
                {a}
              </button>
            )
          })}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center gap-3">
          <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300">System Audit Logs</p>
          {!loading && (
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-2 py-0.5 rounded-full">
              {filtered.length}{filtered.length !== logs.length ? ` of ${logs.length}` : ''} {logs.length === 1 ? 'entry' : 'entries'}
            </span>
          )}
        </div>

        {loading ? (
          <div className="divide-y divide-zinc-800/60">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                <div className="animate-pulse h-3 w-28 rounded bg-slate-200 dark:bg-zinc-800" />
                <div className="animate-pulse h-3 w-20 rounded bg-slate-200 dark:bg-zinc-800 ml-auto" />
                <div className="animate-pulse h-5 w-16 rounded-full bg-slate-200 dark:bg-zinc-800" />
                <div className="animate-pulse h-3 w-40 rounded bg-slate-200 dark:bg-zinc-800" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm text-zinc-500">{logs.length === 0 ? 'No activity recorded yet.' : 'No entries match the current filter.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm divide-y divide-slate-100 dark:divide-zinc-800">
              <thead>
                <tr>
                  {['Timestamp', 'Action', 'Module', 'Description', 'Performed By'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-2xs font-semibold text-slate-500 dark:text-zinc-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                {filtered.map((log) => {
                  const aStyle = ACTION_STYLES[log.action]  || { bg: 'bg-slate-100 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300', label: log.action }
                  const mStyle = MODULE_STYLES[log.module] || { bg: 'bg-slate-100 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300' }
                  return (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors duration-100">
                      <td className="px-5 py-3.5 text-xs text-slate-400 dark:text-zinc-500 whitespace-nowrap font-mono">
                        {formatDateTime(log.createdAt)}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ring-1 ${aStyle.bg}`}>
                          {aStyle.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ring-1 ${mStyle.bg}`}>
                          {log.module}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-zinc-300 max-w-md">
                        <span className="block truncate" title={log.description}>{log.description}</span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400">
                              {(log.performedBy || 'S').charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-slate-500 dark:text-zinc-400 text-xs">{log.performedBy || 'System'}</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'accounts',   label: 'Accounts' },
  { id: 'audit-logs', label: 'Audit Logs' },
]

function Accounts() {
  const navigate = useNavigate()
  const location = useLocation()
  const activeTab = location.pathname === '/audit-logs' ? 'audit-logs' : 'accounts'

  const switchTab = (id) => {
    navigate(id === 'audit-logs' ? '/audit-logs' : '/accounts', { replace: true })
  }

  return (
    <MainLayout>
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-5 border-b border-slate-200 dark:border-zinc-800">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => switchTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-brand-500 text-brand-500 dark:text-brand-400'
                : 'border-transparent text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'accounts'   && <AccountsTab />}
      {activeTab === 'audit-logs' && <AuditLogsTab />}
    </MainLayout>
  )
}

export default Accounts
