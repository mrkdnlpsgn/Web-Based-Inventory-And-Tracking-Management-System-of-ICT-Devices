import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { addItem, updateItem, removeItem } from '../../store/slices/inventorySlice'
import { useToast } from '../../context/ToastContext'
import MainLayout from '../../components/layout/MainLayout'
import Table from '../../components/common/Table'
import Button from '../../components/common/Button'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import ImportModal from '../../components/common/ImportModal'
import AddRecordModal from './AddRecordModal'
import { formatDate } from '../../utils/helpers'

// ── Unified column definitions ────────────────────────────────────────────────
const TABLE_COLUMNS = [
  { key: 'type',            label: 'Type' },
  { key: 'equipmentType',   label: 'Type of Equipment' },
  { key: 'itemCode',        label: 'Item Code',
    render: (r) => <span className="font-mono text-xs text-zinc-400">{r.itemCode || '—'}</span> },
  { key: 'article',         label: 'Article',
    render: (r) => <span className="font-medium text-white">{r.article || '—'}</span> },
  { key: 'model',           label: 'Model' },
  { key: 'serialNumber',    label: 'Serial Number',
    render: (r) => <span className="font-mono text-xs text-zinc-300">{r.serialNumber || '—'}</span> },
  { key: 'amountValue',     label: 'Amount Value',
    render: (r) => r.amountValue
      ? <span className="font-medium text-zinc-200">₱{Number(r.amountValue).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
      : <span className="text-zinc-600">—</span> },
  { key: 'acquisitionDate', label: 'Acquisition Date',
    render: (r) => r.acquisitionDate ? formatDate(r.acquisitionDate) : <span className="text-zinc-600">—</span> },
  { key: 'office',          label: 'Office' },
  { key: 'location',        label: 'Location' },
  { key: 'description',     label: 'Description',
    render: (r) => r.description
      ? <span className="max-w-[180px] truncate block" title={r.description}>{r.description}</span>
      : <span className="text-zinc-600">—</span> },
  { key: 'accountablePerson', label: 'Accountable Person' },
]

const SEARCHABLE = [
  'type', 'equipmentType', 'itemCode', 'article',
  'model', 'serialNumber',
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

  // ── CRUD handlers ───────────────────────────────────────────────────────────
  const handleSave = (newRecord) => {
    const itemWithId = { ...newRecord, id: crypto.randomUUID() }
    dispatch(addItem(itemWithId))
    toast.show('Inventory record added.', 'success')
    return itemWithId
  }

  const handleUpdate = (updated) => {
    dispatch(updateItem(updated))
    setEditingRecord(null)
    toast.show('Inventory record updated.', 'success')
  }

  const handleDelete = () => {
    const label = deletingRecord.article || deletingRecord.itemCode
    dispatch(removeItem(deletingRecord.id))
    setDeletingRecord(null)
    toast.show(`"${label}" has been deleted.`, 'warning')
  }

  const handleImport = (rows) => {
    const savedItems = rows.map((r) => {
      const item = { ...r, id: crypto.randomUUID() }
      dispatch(addItem(item))
      return item
    })
    toast.show(`${rows.length} record${rows.length !== 1 ? 's' : ''} imported successfully.`, 'success')
    return savedItems  // returned so ImportModal can show QR codes
  }

  // ── Filtered data ───────────────────────────────────────────────────────────
  const filtered = records.filter((r) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return SEARCHABLE.some((k) => String(r[k] ?? '').toLowerCase().includes(q))
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
          className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-all duration-150 active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
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
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-150"
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
      <div className="bg-zinc-900 rounded-xl border border-zinc-800">
        <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold text-zinc-300">Equipment &amp; Device List</p>
            {records.length > 0 && (
              <span className="text-xs font-medium text-zinc-400 bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded-full">
                {filtered.length}{filtered.length !== records.length && ` of ${records.length}`} record{records.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        <div className="p-4">
          <Table columns={[...TABLE_COLUMNS, actionsColumn]} data={filtered} />
        </div>
      </div>

      {/* Modals */}
      {showAdd       && <AddRecordModal onClose={() => setShowAdd(false)}             onSave={handleSave}   />}
      {editingRecord && <AddRecordModal onClose={() => setEditingRecord(null)} initialData={editingRecord} onSave={handleUpdate} />}
      {showImport    && <ImportModal    onClose={() => setShowImport(false)}           onImport={handleImport} />}

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
