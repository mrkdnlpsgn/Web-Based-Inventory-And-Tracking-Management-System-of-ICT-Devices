import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { addItem, updateItem, removeItem, setItems } from '../../store/slices/inventorySlice'
import { useToast } from '../../context/ToastContext'
import MainLayout from '../../components/layout/MainLayout'
import Table from '../../components/common/Table'
import Button from '../../components/common/Button'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import ImportModal from '../../components/common/ImportModal'
import AddRecordModal from './AddRecordModal'
import QRModal from './QRModal'
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

// ── Unified column definitions ────────────────────────────────────────────────
const TABLE_COLUMNS = [
  { key: 'type',            label: 'Type' },
  { key: 'equipmentType',   label: 'Type of Equipment' },
  { key: 'itemCode', label: 'Item Code',
    render: (r) => r.itemCode
      ? <span className="font-mono text-xs text-slate-400 dark:text-zinc-400">{r.itemCode}</span>
      : <span className="text-slate-400 dark:text-zinc-600">—</span>
  },
  { key: 'article',         label: 'Article',
    render: (r) => <span className="font-medium text-slate-900 dark:text-white">{r.article || '—'}</span> },
  { key: 'deviceCount',  label: 'Devices',
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
    }
  },
  { key: 'amountValue', label: 'Total Value',
    render: (r) => r.amountValue
      ? <span className="font-medium text-slate-700 dark:text-zinc-200">₱{Number(r.amountValue).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
      : <span className="text-slate-400 dark:text-zinc-600">—</span> },
  { key: 'office',          label: 'Office' },
  { key: 'location',        label: 'Location' },
  { key: 'description',     label: 'Description',
    render: (r) => r.description
      ? <span className="max-w-[180px] truncate block" title={r.description}>{r.description}</span>
      : <span className="text-slate-400 dark:text-zinc-600">—</span> },
  { key: 'accountablePerson', label: 'Accountable Person' },
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
  const [showAdd, setShowAdd]               = useState(false)
  const [showImport, setShowImport]         = useState(false)
  const [editingRecord, setEditingRecord]   = useState(null)
  const [deletingRecord, setDeletingRecord] = useState(null)
  const [qrItem, setQrItem]                 = useState(null)
  const [loading, setLoading]               = useState(true)

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
    try {
      const { data } = await getEquipment()
      dispatch(setItems(data))
    } catch {
      toast.show('Failed to load equipment records.', 'error')
    } finally {
      setLoading(false)
    }
  }, [dispatch, toast])

  useEffect(() => { loadEquipment() }, [loadEquipment])

  // ── CRUD handlers ───────────────────────────────────────────────────────────
  const handleSave = async (newRecord) => {
    try {
      const { data } = await createEquipment(newRecord)
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

  const handleDelete = async () => {
    const label = deletingRecord.article || deletingRecord.itemCode
    const id    = deletingRecord.id
    setDeletingRecord(null)
    try {
      await deleteEquipment(id)
      dispatch(removeItem(id))
      toast.show(`"${label}" has been deleted.`, 'warning')
    } catch {
      toast.show('Failed to delete record.', 'error')
    }
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

  // ── Filtered data ───────────────────────────────────────────────────────────
  const filtered = records.filter((r) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    if (SEARCHABLE.some((k) => String(r[k] ?? '').toLowerCase().includes(q))) return true
    return (r.devices || []).some((d) => d.itemCode && d.itemCode.toLowerCase().includes(q))
  })

  // ── Actions column ──────────────────────────────────────────────────────────
  const actionsColumn = {
    key: '_actions',
    label: '',
    render: (row) => (
      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => setEditingRecord(row)}
          title="Edit record"
          className="p-1.5 rounded-md text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all duration-150 active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </button>
        <button
          onClick={() => setQrItem(row)}
          title="Show QR code"
          className="p-1.5 rounded-md text-zinc-500 hover:text-brand-400 hover:bg-brand-500/10 transition-all duration-150 active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1zM11 7a1 1 0 112 0v1h1a1 1 0 110 2h-2a1 1 0 01-1-1V7zM7 11a1 1 0 100 2h1v1a1 1 0 102 0v-2a1 1 0 00-1-1H7zM13 11a1 1 0 100 2h.01a1 1 0 100-2H13zM15 13a1 1 0 100 2h.01a1 1 0 100-2H15zM13 15a1 1 0 100 2h.01a1 1 0 100-2H13z" clipRule="evenodd" />
          </svg>
        </button>
        <button
          onClick={() => setDeletingRecord(row)}
          title="Delete record"
          className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-950/40 transition-all duration-150 active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    ),
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <MainLayout>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="relative max-w-xs w-full">
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
          <Button variant="secondary" size="md" onClick={() => setShowImport(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.293a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Import
          </Button>
          <Button size="md" onClick={() => setShowAdd(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Record
          </Button>
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
          ) : (
            <Table columns={[...TABLE_COLUMNS, actionsColumn]} data={filtered} />
          )}
        </div>
      </div>

      {/* Modals */}
      {showAdd       && <AddRecordModal onClose={() => setShowAdd(false)}             onSave={handleSave}   generatedCode={nextItemCode} existingSerialNumbers={allSerialNumbers} onComplete={loadEquipment} />}
      {editingRecord && <AddRecordModal onClose={() => setEditingRecord(null)} initialData={editingRecord} onSave={handleUpdate} existingSerialNumbers={editSerialNumbers} />}
      {showImport    && <ImportModal    onClose={() => setShowImport(false)}           onImport={handleImport} />}
      {qrItem        && <QRModal        onClose={() => setQrItem(null)}               item={qrItem} />}

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
