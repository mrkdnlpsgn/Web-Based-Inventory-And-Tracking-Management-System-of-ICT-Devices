import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { addDevice, updateDevice, removeDevice } from '../../store/slices/inventorySlice'
import { useToast } from '../../context/ToastContext'
import MainLayout from '../../components/layout/MainLayout'
import Table from '../../components/common/Table'
import Button from '../../components/common/Button'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import AddDeviceModal from './AddDeviceModal'
import { formatDate } from '../../utils/helpers'

const SEARCHABLE = ['article', 'equipmentType', 'itemCode', 'model', 'serialNumber']

function Devices() {
  const dispatch       = useDispatch()
  const toast          = useToast()
  const inventoryItems = useSelector((s) => s.inventory.items)

  const [showAdd, setShowAdd]               = useState(false)
  const [editingDevice, setEditingDevice]   = useState(null)
  const [deletingDevice, setDeletingDevice] = useState(null)
  const [search, setSearch]                 = useState('')

  // ── Flat device list with parent inventory context ────────────────────────
  const allDevices = inventoryItems.flatMap((item) =>
    (item.devices ?? []).map((device) => ({
      ...device,
      inventoryId:   item.id,
      article:       item.article,
      equipmentType: item.equipmentType,
      itemCode:      item.itemCode,
      office:        item.office,
    }))
  )

  const filtered = allDevices.filter((d) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return SEARCHABLE.some((k) => String(d[k] ?? '').toLowerCase().includes(q))
  })

  // Resolve the parent inventory item for the device being edited
  const editingInventoryItem = editingDevice
    ? inventoryItems.find((i) => i.id === editingDevice.inventoryId)
    : null

  // ── CRUD handlers ─────────────────────────────────────────────────────────
  const handleAdd = ({ inventoryId, device }) => {
    dispatch(addDevice({ inventoryId, device }))
    toast.show('Device added successfully.', 'success')
  }

  const handleUpdate = ({ inventoryId, device }) => {
    dispatch(updateDevice({ inventoryId, device }))
    setEditingDevice(null)
    toast.show('Device updated successfully.', 'success')
  }

  const handleDelete = () => {
    const label = [deletingDevice.model, deletingDevice.serialNumber].filter(Boolean).join(' — ')
    dispatch(removeDevice({ inventoryId: deletingDevice.inventoryId, deviceId: deletingDevice.id }))
    setDeletingDevice(null)
    toast.show(`Device "${label}" has been removed.`, 'warning')
  }

  // ── Actions column ────────────────────────────────────────────────────────
  const actionsColumn = {
    key: '_actions',
    label: '',
    render: (row) => (
      <div className="flex items-center justify-end gap-1">
        <button
          onClick={() => setEditingDevice(row)}
          title="Edit device"
          className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-all duration-150 active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </button>
        <button
          onClick={() => setDeletingDevice(row)}
          title="Delete device"
          className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-950/40 transition-all duration-150 active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    ),
  }

  const tableColumns = [
    {
      key: 'article',
      label: 'Article',
      render: (row) => <span className="font-medium text-white">{row.article || '—'}</span>,
    },
    { key: 'equipmentType', label: 'Equipment Type' },
    {
      key: 'itemCode',
      label: 'Item Code',
      render: (row) => <span className="font-mono text-xs text-zinc-400">{row.itemCode || '—'}</span>,
    },
    { key: 'model', label: 'Model' },
    {
      key: 'serialNumber',
      label: 'Serial Number',
      render: (row) => <span className="font-mono text-xs text-zinc-300">{row.serialNumber}</span>,
    },
    {
      key: 'amountValue',
      label: 'Amount Value',
      render: (row) => (
        <span className="font-medium text-zinc-200">
          ₱{Number(row.amountValue || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'acquisitionDate',
      label: 'Acquisition Date',
      render: (row) => formatDate(row.acquisitionDate),
    },
    actionsColumn,
  ]

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <MainLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="relative max-w-xs w-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <input
            type="text"
            placeholder="Search by article, model, serial no…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all duration-150"
          />
        </div>
        <Button size="md" onClick={() => setShowAdd(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Device
        </Button>
      </div>

      <div className="bg-zinc-900 rounded-xl border border-zinc-800">
        <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold text-zinc-300">All Devices</p>
            {allDevices.length > 0 && (
              <span className="text-xs font-medium text-zinc-400 bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded-full">
                {filtered.length}{filtered.length !== allDevices.length && ` of ${allDevices.length}`} device{allDevices.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          {inventoryItems.length === 0 && (
            <span className="text-xs text-amber-500/80 bg-amber-950/40 border border-amber-800/40 px-2.5 py-1 rounded-full">
              Add inventory records first
            </span>
          )}
        </div>
        <div className="p-4">
          <Table columns={tableColumns} data={filtered} />
        </div>
      </div>

      {/* Add device */}
      {showAdd && (
        <AddDeviceModal onClose={() => setShowAdd(false)} onSave={handleAdd} />
      )}

      {/* Edit device */}
      {editingDevice && editingInventoryItem && (
        <AddDeviceModal
          initialDevice={editingDevice}
          inventoryItem={editingInventoryItem}
          onClose={() => setEditingDevice(null)}
          onSave={handleUpdate}
        />
      )}

      {/* Delete confirmation */}
      {deletingDevice && (
        <ConfirmDialog
          title="Delete this device?"
          message={`"${deletingDevice.model} — ${deletingDevice.serialNumber}" will be permanently removed from ${deletingDevice.article || 'this equipment'}.`}
          confirmLabel="Delete Device"
          onConfirm={handleDelete}
          onCancel={() => setDeletingDevice(null)}
        />
      )}
    </MainLayout>
  )
}

export default Devices
