import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { addItem, updateItem, removeItem, setItems } from '../../store/slices/inventorySlice'
import { useToast } from '../../context/ToastContext'
import MainLayout from '../../components/layout/MainLayout'
import Table from '../../components/common/Table'
import Button from '../../components/common/Button'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import ImportModal from '../../components/common/ImportModal'
import AddRecordModal from './AddRecordModal'
import QRModal from './QRModal'
import RecordDrawer from './RecordDrawer'
import { formatDate } from '../../utils/helpers'
import {
  getEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
} from '../../services/inventoryService'

function generateItemCode(usedCodes) {
  const year   = new Date().getFullYear()
  const prefix = `ICT-${year}-`
  const nums   = usedCodes
    .filter((c) => c && c.startsWith(prefix))
    .map((c) => parseInt(c.slice(prefix.length), 10))
    .filter((n) => !isNaN(n))
  const next = (nums.length > 0 ? Math.max(...nums) : 0) + 1
  return `${prefix}${String(next).padStart(3, '0')}`
}

// Convert various date formats from CSV/XLSX to YYYY-MM-DD (or null if blank)
function normalizeDate(raw) {
  if (!raw || String(raw).trim() === '') return null
  const s = String(raw).trim()
  // Already ISO: 2024-01-15
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  // MM/DD/YYYY or MM-DD-YYYY
  const mdy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/)
  if (mdy) return `${mdy[3]}-${mdy[1].padStart(2,'0')}-${mdy[2].padStart(2,'0')}`
  // Excel serial number (days since 1900-01-01)
  if (/^\d+$/.test(s)) {
    const d = new Date(Date.UTC(1899, 11, 30) + Number(s) * 86400000)
    return d.toISOString().slice(0, 10)
  }
  // Fallback: let the browser try to parse it
  const d = new Date(s)
  return isNaN(d) ? null : d.toISOString().slice(0, 10)
}

// ── Table columns — intentionally slim; full details are in the row drawer ────
const TABLE_COLUMNS = [
  { key: 'itemCode', label: 'Item Code',
    render: (r) => r.itemCode
      ? <span className="font-mono text-xs text-slate-400 dark:text-zinc-400">{r.itemCode}</span>
      : <span className="text-slate-400 dark:text-zinc-600">—</span>,
  },
  { key: 'article', label: 'Article',
    render: (r) => <span className="font-medium text-slate-900 dark:text-white">{r.article || '—'}</span>,
  },
  { key: 'equipmentType', label: 'Equipment Type',
    render: (r) => r.equipmentType || <span className="text-slate-400 dark:text-zinc-600">—</span>,
  },
  { key: 'deviceCount', label: 'Devices',
    hint: 'Number of individual units registered under this equipment record.',
    render: (r) => {
      const count = r.deviceCount ?? 0
      return count === 0
        ? <span className="text-slate-400 dark:text-zinc-600 text-xs">—</span>
        : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 ring-1 ring-brand-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
            </svg>
            {count}
          </span>
    },
  },
  { key: 'amountValue', label: 'Total Value',
    hint: 'Combined acquisition cost of all devices in this record.',
    render: (r) => r.amountValue
      ? <span className="font-medium text-slate-700 dark:text-zinc-200">₱{Number(r.amountValue).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
      : <span className="text-slate-400 dark:text-zinc-600">—</span>,
  },
  { key: 'office', label: 'Office',
    render: (r) => r.office || <span className="text-slate-400 dark:text-zinc-600">—</span>,
  },
  { key: '_open', label: '',
    render: () => (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-300 dark:text-zinc-700 group-hover:text-slate-400 dark:group-hover:text-zinc-500 transition-colors duration-150" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
      </svg>
    ),
  },
]

const SEARCHABLE = [
  'type', 'equipmentType', 'itemCode', 'article',
  'office', 'location', 'description', 'accountablePerson',
]

// ── Component ─────────────────────────────────────────────────────────────────
function Inventory() {
  const dispatch = useDispatch()
  const toast    = useToast()
  const records  = useSelector((s) => s.inventory.items)

  const [search, setSearch]                 = useState('')
  const [filterType, setFilterType]         = useState('')
  const [filterOffice, setFilterOffice]     = useState('')
  const [sortBy, setSortBy]                 = useState('')
  const [showAdd, setShowAdd]               = useState(false)
  const [showImport, setShowImport]         = useState(false)
  const [editingRecord, setEditingRecord]   = useState(null)
  const [deletingRecord, setDeletingRecord] = useState(null)
  const [undoDelete, setUndoDelete]           = useState(null)
  const [undoBannerExiting, setUndoBannerExiting] = useState(false)
  const [undoCountdown, setUndoCountdown]     = useState(6)
  const [qrItem, setQrItem]                 = useState(null)
  const [detailRecord, setDetailRecord]     = useState(null)
  const [detailExiting, setDetailExiting]   = useState(false)
  const [loading, setLoading]               = useState(true)
  const [loadError, setLoadError]           = useState(false)
  const [page, setPage]                     = useState(1)
  const [highlightId, setHighlightId]       = useState(null)
  const PAGE_SIZE = 8
  const location = useLocation()
  const skipPageReset = useRef(false)
  const afterExitRef = useRef(null)

  // Cleanup runs off RecordDrawer's own `animationend` (see handleDetailAnimationEnd
  // below), not a hand-timed setTimeout — avoids a stale timer clobbering a
  // newly-opened record if the drawer is reopened before the old close finishes.
  const closeDetail = useCallback(() => {
    setDetailExiting(true)
  }, [])

  const handleDetailAnimationEnd = useCallback(() => {
    setDetailRecord(null)
    setDetailExiting(false)
  }, [])

  // Clean up pending delete timeout on unmount
  useEffect(() => {
    return () => { if (undoDelete?.timeoutId) clearTimeout(undoDelete.timeoutId) }
  }, [undoDelete])

  // Live countdown ticker while an undo window is open — keyed on record ID so
  // the countdown doesn't reset when exit animation starts
  useEffect(() => {
    if (!undoDelete) { setUndoCountdown(6); return }
    setUndoCountdown(6)
    const interval = setInterval(() => setUndoCountdown((n) => Math.max(0, n - 1)), 1000)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [undoDelete?.record?.id])

  const nextItemCode = useMemo(() => {
    const allCodes = records.map((r) => r.itemCode).filter(Boolean)
    return generateItemCode(allCodes)
  }, [records])

  const allSerialNumbers = useMemo(
    () => records.flatMap((r) => (r.devices || []).map((d) => d.serialNumber)).filter(Boolean),
    [records]
  )

  const editSerialNumbers = useMemo(
    () => editingRecord
      ? allSerialNumbers.filter(
          (sn) => !(editingRecord.devices || []).some((d) => d.serialNumber === sn)
        )
      : allSerialNumbers,
    [allSerialNumbers, editingRecord]
  )

  // ── Load all equipment on mount ─────────────────────────────────────────────
  const loadEquipment = useCallback(async () => {
    setLoading(true)
    setLoadError(false)
    try {
      const { data } = await getEquipment()
      dispatch(setItems(data))
    } catch {
      setLoadError(true)
      toast.show('Could not load equipment records. Check your connection and try again.', 'error')
    } finally {
      setLoading(false)
    }
  }, [dispatch, toast])

  useEffect(() => { loadEquipment() }, [loadEquipment])

  // Reset page to 1 when filters/search change — skipped during highlight navigation
  useEffect(() => {
    if (skipPageReset.current) { skipPageReset.current = false; return }
    setPage(1)
  }, [search, filterType, filterOffice, sortBy])

  // Navigate from Smart Suggestions: jump to the right page and illuminate the row
  useEffect(() => {
    const id = location.state?.highlightId
    if (!id || loading || records.length === 0) return
    skipPageReset.current = true
    setSearch('')
    setFilterType('')
    setFilterOffice('')
    setSortBy('')
    const idx = records.findIndex((r) => r.id === id)
    if (idx === -1) { skipPageReset.current = false; return }
    setPage(Math.ceil((idx + 1) / PAGE_SIZE))
    setHighlightId(id)
    const t = setTimeout(() => setHighlightId(null), 2500)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, records, loading])

  // ── CRUD handlers ───────────────────────────────────────────────────────────
  const handleSave = async (newRecord, idempotencyKey) => {
    try {
      const { data } = await createEquipment(newRecord, idempotencyKey)
      dispatch(addItem(data))
      toast.show('Inventory record added.', 'success')
      return data
    } catch {
      toast.show('Failed to add record.', 'error')
    }
  }

  const handleUpdate = async (updated) => {
    try {
      const { data } = await updateEquipment(updated.id, updated)
      dispatch(updateItem(data))
      setEditingRecord(null)
      toast.show('Inventory record updated.', 'success')
    } catch {
      toast.show('Failed to update record.', 'error')
    }
  }

  const handleDetailDelete = (record) => {
    setDetailRecord(null)
    setDetailExiting(false)
    setDeletingRecord(record)
  }

  // afterExit is per-call, so it's stashed in a ref rather than component state —
  // handleUndoBannerAnimationEnd (fired by the banner's own animationend, not a
  // timer) reads it once the exit animation actually finishes.
  const exitUndoBanner = useCallback((afterExit) => {
    afterExitRef.current = afterExit ?? null
    setUndoBannerExiting(true)
  }, [])

  const handleUndoBannerAnimationEnd = useCallback(() => {
    setUndoDelete(null)
    setUndoBannerExiting(false)
    afterExitRef.current?.()
    afterExitRef.current = null
  }, [])

  const handleDelete = () => {
    const record = deletingRecord
    const label  = record.article || record.itemCode || 'Record'
    setDeletingRecord(null)

    dispatch(removeItem(record.id))

    const timeoutId = setTimeout(() => {
      exitUndoBanner(async () => {
        try {
          await deleteEquipment(record.id)
        } catch {
          dispatch(addItem(record))
          toast.show('Delete failed — the record has been restored.', 'error')
        }
      })
    }, 6000)

    setUndoDelete({ record, label, timeoutId })
  }

  const handleUndoDelete = () => {
    if (!undoDelete) return
    clearTimeout(undoDelete.timeoutId)
    dispatch(addItem(undoDelete.record))
    exitUndoBanner()
  }

  const handleImport = async (rows) => {
    const savedItems = []
    const failedRows = []
    const usedCodes  = records.map((r) => r.itemCode).filter(Boolean)

    for (const r of rows) {
      try {
        const autoCode = generateItemCode(usedCodes)
        usedCodes.push(autoCode)

        const payload = {
          ...r,
          itemCode:        autoCode,
          amountValue:     r.amountValue     ? Number(r.amountValue)     : null,
          acquisitionDate: normalizeDate(r.acquisitionDate),
        }
        const { data } = await createEquipment(payload)
        dispatch(addItem(data))
        savedItems.push(data)
      } catch (err) {
        failedRows.push({
          row:    r,
          reason: err?.response?.data?.message || err?.message || 'Server error',
        })
      }
    }

    if (savedItems.length > 0 && failedRows.length === 0) {
      toast.show(`${savedItems.length} record${savedItems.length !== 1 ? 's' : ''} imported.`, 'success')
    } else if (savedItems.length > 0) {
      toast.show(
        `${failedRows.length} row${failedRows.length !== 1 ? 's' : ''} could not be saved — see the import summary for details.`,
        'warning',
        { title: `${savedItems.length} of ${rows.length} imported`, duration: 6000 },
      )
    } else {
      toast.show(
        'No records were saved. Make sure your file matches the expected format and try again.',
        'error',
        { title: 'Import failed', duration: 6000 },
      )
    }

    return { saved: savedItems, failed: failedRows }
  }

  // ── Filter options derived from data ────────────────────────────────────────
  const typeOptions   = useMemo(() => [...new Set(records.map((r) => r.equipmentType).filter(Boolean))].sort(), [records])
  const officeOptions = useMemo(() => [...new Set(records.map((r) => r.office).filter(Boolean))].sort(), [records])
  const hasActiveFilters = filterType || filterOffice || sortBy

  const clearFilters = () => { setFilterType(''); setFilterOffice(''); setSortBy('') }

  // ── Filtered + sorted data ───────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = records.filter((r) => {
      if (search.trim()) {
        const q = search.toLowerCase()
        const textMatch = SEARCHABLE.some((k) => String(r[k] ?? '').toLowerCase().includes(q)) ||
          (r.devices || []).some((d) => d.itemCode && d.itemCode.toLowerCase().includes(q))
        if (!textMatch) return false
      }
      if (filterType   && r.equipmentType !== filterType)   return false
      if (filterOffice && r.office        !== filterOffice) return false
      return true
    })
    if (sortBy === 'article-asc')  result = [...result].sort((a, b) => (a.article || '').localeCompare(b.article || ''))
    if (sortBy === 'article-desc') result = [...result].sort((a, b) => (b.article || '').localeCompare(a.article || ''))
    if (sortBy === 'value-high')   result = [...result].sort((a, b) => (Number(b.amountValue) || 0) - (Number(a.amountValue) || 0))
    if (sortBy === 'value-low')    result = [...result].sort((a, b) => (Number(a.amountValue) || 0) - (Number(b.amountValue) || 0))
    if (sortBy === 'date-new')     result = [...result].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    if (sortBy === 'date-old')     result = [...result].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    return result
  }, [records, search, filterType, filterOffice, sortBy])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // actionsColumn removed — Edit, QR, Delete are now in the RecordDrawer

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <MainLayout>
      {/* Undo delete banner */}
      {undoDelete && (
        <div
          role="status"
          aria-live="polite"
          className={`flex items-center justify-between px-4 py-3 mb-4 rounded-lg border border-amber-700/40 bg-amber-950/30 ${
            undoBannerExiting ? 'animate-slide-up' : 'animate-slide-down'
          }`}
          onAnimationEnd={undoBannerExiting ? handleUndoBannerAnimationEnd : undefined}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-zinc-300 truncate">
              <span className="font-semibold text-white">"{undoDelete.label}"</span> will be permanently deleted.
            </p>
          </div>
          <button
            onClick={handleUndoDelete}
            className="flex-shrink-0 ml-4 text-xs font-semibold text-amber-400 hover:text-amber-300 border border-amber-700/50 hover:border-amber-500/70 px-3 py-1.5 rounded-md transition-all duration-150 tabular-nums"
          >
            Undo ({undoCountdown}s)
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col gap-3 mb-5">
        {/* Search + action buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="relative w-full sm:max-w-xs">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            <input
              type="text"
              placeholder="Search records…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-150"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="md" className="flex-1 sm:flex-none justify-center" onClick={() => setShowImport(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.293a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Import
            </Button>
            <Button size="md" className="flex-1 sm:flex-none justify-center" onClick={() => setShowAdd(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Record
            </Button>
          </div>
        </div>

        {/* Filter row */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
          <div className="relative col-span-2 sm:col-auto">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full appearance-none text-sm rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-150"
            >
              <option value="">All Equipment Types</option>
              {typeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          <div className="relative">
            <select
              value={filterOffice}
              onChange={(e) => setFilterOffice(e.target.value)}
              className="w-full appearance-none text-sm rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-150"
            >
              <option value="">All Offices</option>
              {officeOptions.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full appearance-none text-sm rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-150"
            >
              <option value="">Sort: Default</option>
              <option value="article-asc">Article A → Z</option>
              <option value="article-desc">Article Z → A</option>
              <option value="value-high">Value: High → Low</option>
              <option value="value-low">Value: Low → High</option>
              <option value="date-new">Newest First</option>
              <option value="date-old">Oldest First</option>
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          <button
            onClick={clearFilters}
            disabled={!hasActiveFilters}
            className={`flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 hover:text-red-400 dark:hover:text-red-400 border border-slate-200 dark:border-zinc-700 hover:border-red-300 dark:hover:border-red-800 px-2.5 py-2 rounded-lg transition-all duration-200 ${
              hasActiveFilters ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Clear filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300">Equipment &amp; Device List</p>
            {!loading && records.length > 0 && (
              <span className="text-xs font-medium text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-2 py-0.5 rounded-full">
                {filtered.length}{filtered.length !== records.length && ` of ${records.length}`} record{records.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400 dark:text-zinc-600 gap-2">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <span className="text-sm">Loading records…</span>
            </div>
          ) : loadError ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400 dark:text-zinc-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-slate-300 dark:text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-700 dark:text-zinc-300">Failed to load equipment records</p>
                <p className="text-xs text-slate-400 dark:text-zinc-600 mt-1">Check your connection or try again.</p>
              </div>
              <button
                onClick={loadEquipment}
                className="flex items-center gap-1.5 text-xs font-semibold text-brand-400 hover:text-brand-300 border border-brand-500/30 hover:border-brand-500/60 px-3 py-1.5 rounded-lg transition-all duration-150"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try again
              </button>
            </div>
          ) : (
            <Table
              columns={TABLE_COLUMNS}
              data={paged}
              onRowClick={(row) => setDetailRecord(row)}
              emptyMessage={records.length === 0 ? 'No equipment records yet.' : 'No records match your search or filters.'}
              emptyAction={records.length === 0 ? "Click 'Add Record' above to register your first ICT device." : "Try clearing the filters or searching by a different term."}
              minRows={PAGE_SIZE}
              highlightId={highlightId}
              mobileRender={(row) => (
                <div className="flex items-center gap-3 py-3.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{row.article || '—'}</p>
                    <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5 truncate">
                      {[row.equipmentType, row.office].filter(Boolean).join(' · ') || '—'}
                    </p>
                    <p className="text-2xs font-mono text-slate-400 dark:text-zinc-600 mt-0.5">{row.itemCode}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    {row.amountValue
                      ? <p className="text-sm font-semibold text-slate-700 dark:text-zinc-200">₱{Number(row.amountValue).toLocaleString('en-PH', { minimumFractionDigits: 0 })}</p>
                      : <p className="text-xs text-slate-400 dark:text-zinc-600">—</p>
                    }
                    {row.deviceCount > 0 && (
                      <p className="text-2xs text-brand-400 mt-0.5">{row.deviceCount} unit{row.deviceCount !== 1 ? 's' : ''}</p>
                    )}
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-300 dark:text-zinc-700 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            />
          )}
        </div>

        {/* Pagination */}
        {!loading && filtered.length > PAGE_SIZE && (
          <div className="px-5 py-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3">
            <p className="text-xs text-slate-400 dark:text-zinc-500">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
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

      {/* Modals */}
      {showAdd       && <AddRecordModal onClose={() => setShowAdd(false)}             onSave={handleSave}   generatedCode={nextItemCode} existingSerialNumbers={allSerialNumbers} onComplete={loadEquipment} />}
      {editingRecord && <AddRecordModal onClose={() => setEditingRecord(null)} initialData={editingRecord} onSave={handleUpdate} existingSerialNumbers={editSerialNumbers} />}
      {showImport    && <ImportModal    onClose={() => setShowImport(false)}           onImport={handleImport} />}
      {qrItem        && <QRModal        onClose={() => setQrItem(null)}               item={qrItem} />}

      {/* Detail drawer */}
      {(detailRecord || detailExiting) && (
        <RecordDrawer
          record={detailRecord ?? {}}
          exiting={detailExiting}
          onClose={closeDetail}
          onExitAnimationEnd={handleDetailAnimationEnd}
          onEdit={(rec) => setEditingRecord(rec)}
          onQR={(rec) => setQrItem(rec)}
          onDelete={handleDetailDelete}
        />
      )}

      {deletingRecord && (
        <ConfirmDialog
          title="Delete this record?"
          message={`"${deletingRecord.article || deletingRecord.itemCode}" will be permanently removed. This cannot be undone.`}
          confirmLabel="Delete Record"
          onConfirm={handleDelete}
          onCancel={() => setDeletingRecord(null)}
        />
      )}
    </MainLayout>
  )
}

export default Inventory
