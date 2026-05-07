import MainLayout from '../../components/layout/MainLayout'
import Table from '../../components/common/Table'
import Button from '../../components/common/Button'
import { formatDate } from '../../utils/helpers'

const columns = [
  { key: 'deviceSerial', label: 'Serial No.' },
  { key: 'action',       label: 'Action' },
  { key: 'performedBy',  label: 'Performed By' },
  { key: 'location',     label: 'Location' },
  { key: 'date',         label: 'Date', render: (row) => formatDate(row.date) },
]

function Tracking() {
  return (
    <MainLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="relative max-w-xs w-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <input
            type="text"
            placeholder="Search logs…"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all duration-150"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
            </svg>
            Filter
          </Button>
          <Button size="md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Log Entry
          </Button>
        </div>
      </div>

      <div className="bg-zinc-900 rounded-xl border border-zinc-800">
        <div className="px-5 py-3.5 border-b border-zinc-800">
          <p className="text-sm font-semibold text-zinc-300">Activity Log</p>
        </div>
        <div className="p-4">
          <Table columns={columns} data={[]} />
        </div>
      </div>
    </MainLayout>
  )
}

export default Tracking
