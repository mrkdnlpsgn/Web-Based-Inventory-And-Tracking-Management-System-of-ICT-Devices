import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import MainLayout from '../../components/layout/MainLayout'
import Button from '../../components/common/Button'
import { useToast } from '../../context/ToastContext'
import { getEquipment } from '../../services/inventoryService'
import { getTrackingLogs } from '../../services/trackingService'

// ── Formatters ────────────────────────────────────────────────────────────────
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'
const fmtMoney = (v) =>
  v != null && v !== '' ? '₱' + Number(v).toLocaleString('en-PH', { minimumFractionDigits: 2 }) : '—'
const fmtDateTime = (dt) =>
  dt ? new Date(dt).toLocaleString('en-PH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

function groupByType(items) {
  const map = {}
  items.forEach((item) => {
    const key = item.equipmentType || 'Unclassified'
    if (!map[key]) map[key] = { equipmentType: key, count: 0, totalValue: 0, offices: new Set() }
    map[key].count++
    if (item.amountValue) map[key].totalValue += Number(item.amountValue)
    if (item.office) map[key].offices.add(item.office)
  })
  return Object.values(map)
    .sort((a, b) => b.count - a.count)
    .map((r) => ({ ...r, offices: [...r.offices].join(', ') || '—' }))
}

// ── Report definitions ────────────────────────────────────────────────────────
// Each header has:
//   label   — column heading
//   display — JSX or string for the preview table
//   raw     — plain string for Excel / PDF export
const REPORTS = [
  {
    id: 'inventory',
    title: 'Inventory Summary',
    description: 'Complete list of all ICT assets with status and location.',
    iconBg: 'bg-zinc-800',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-zinc-400" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
      </svg>
    ),
    async load() {
      return (await getEquipment()).data
    },
    headers: [
      { label: 'Type',             display: (r) => r.type || '—',                           raw: (r) => r.type || '' },
      { label: 'Equipment Type',   display: (r) => r.equipmentType || '—',                  raw: (r) => r.equipmentType || '' },
      { label: 'Item Code',        display: (r) => <span className="font-mono text-xs">{r.itemCode || '—'}</span>, raw: (r) => r.itemCode || '' },
      { label: 'Article',          display: (r) => <span className="font-medium text-white">{r.article || '—'}</span>, raw: (r) => r.article || '' },
      { label: 'Model',            display: (r) => r.model || '—',                          raw: (r) => r.model || '' },
      { label: 'Serial Number',    display: (r) => <span className="font-mono text-xs">{r.serialNumber || '—'}</span>, raw: (r) => r.serialNumber || '' },
      { label: 'Amount Value',     display: (r) => fmtMoney(r.amountValue),                 raw: (r) => r.amountValue != null ? Number(r.amountValue).toFixed(2) : '' },
      { label: 'Acquisition Date', display: (r) => fmtDate(r.acquisitionDate),              raw: (r) => r.acquisitionDate || '' },
      { label: 'Office',           display: (r) => r.office || '—',                         raw: (r) => r.office || '' },
      { label: 'Location',         display: (r) => r.location || '—',                       raw: (r) => r.location || '' },
      { label: 'Accountable',      display: (r) => r.accountablePerson || '—',              raw: (r) => r.accountablePerson || '' },
    ],
  },
  {
    id: 'status',
    title: 'Device Status Report',
    description: 'Breakdown of registered ICT devices by equipment type and office distribution.',
    iconBg: 'bg-emerald-950',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
      </svg>
    ),
    async load() {
      return groupByType((await getEquipment()).data)
    },
    headers: [
      { label: 'Equipment Type',   display: (r) => <span className="font-medium text-white">{r.equipmentType}</span>, raw: (r) => r.equipmentType },
      { label: 'Count',            display: (r) => <span className="font-semibold text-brand-400">{r.count}</span>,   raw: (r) => r.count },
      { label: 'Total Value (₱)',  display: (r) => r.totalValue > 0 ? fmtMoney(r.totalValue) : '—',                  raw: (r) => r.totalValue > 0 ? r.totalValue.toFixed(2) : '' },
      { label: 'Offices',          display: (r) => <span className="text-zinc-400 text-xs">{r.offices}</span>,        raw: (r) => r.offices },
    ],
  },
  {
    id: 'tracking',
    title: 'Tracking History',
    description: 'Full log of all device movements and activities.',
    iconBg: 'bg-orange-950',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
      </svg>
    ),
    async load() {
      return (await getTrackingLogs()).data
    },
    headers: [
      { label: 'Article',        display: (r) => <span className="font-medium text-white">{r.article || '—'}</span>, raw: (r) => r.article || '' },
      { label: 'Item Code',      display: (r) => <span className="font-mono text-xs">{r.itemCode || '—'}</span>,     raw: (r) => r.itemCode || '' },
      { label: 'Equipment Type', display: (r) => r.equipmentType || '—',                                              raw: (r) => r.equipmentType || '' },
      { label: 'Action',         display: (r) => r.action || '—',                                                     raw: (r) => r.action || '' },
      { label: 'Performed By',   display: (r) => r.performedBy || '—',                                                raw: (r) => r.performedBy || '' },
      { label: 'Location',       display: (r) => r.location || '—',                                                   raw: (r) => r.location || '' },
      { label: 'Notes',          display: (r) => r.notes ? <span className="max-w-[160px] truncate block" title={r.notes}>{r.notes}</span> : '—', raw: (r) => r.notes || '' },
      { label: 'Date & Time',    display: (r) => <span className="text-xs whitespace-nowrap">{fmtDateTime(r.createdAt)}</span>, raw: (r) => fmtDateTime(r.createdAt) },
    ],
  },
  {
    id: 'valuation',
    title: 'Asset Valuation',
    description: 'Financial summary of ICT asset acquisition values, sorted by amount.',
    iconBg: 'bg-amber-950',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
      </svg>
    ),
    async load() {
      const items = (await getEquipment()).data
      return items
        .filter((i) => i.amountValue != null && i.amountValue !== '')
        .sort((a, b) => Number(b.amountValue) - Number(a.amountValue))
    },
    headers: [
      { label: 'Article',          display: (r) => <span className="font-medium text-white">{r.article || '—'}</span>, raw: (r) => r.article || '' },
      { label: 'Item Code',        display: (r) => <span className="font-mono text-xs">{r.itemCode || '—'}</span>,     raw: (r) => r.itemCode || '' },
      { label: 'Equipment Type',   display: (r) => r.equipmentType || '—',                                              raw: (r) => r.equipmentType || '' },
      { label: 'Serial Number',    display: (r) => <span className="font-mono text-xs">{r.serialNumber || '—'}</span>, raw: (r) => r.serialNumber || '' },
      { label: 'Amount Value',     display: (r) => <span className="font-semibold text-amber-400">{fmtMoney(r.amountValue)}</span>, raw: (r) => Number(r.amountValue).toFixed(2) },
      { label: 'Acquisition Date', display: (r) => fmtDate(r.acquisitionDate),                                         raw: (r) => r.acquisitionDate || '' },
      { label: 'Office',           display: (r) => r.office || '—',                                                    raw: (r) => r.office || '' },
    ],
  },
]

// ── Export helpers ────────────────────────────────────────────────────────────
function exportExcel(rows, headers, title) {
  const data = rows.map((row) => {
    const obj = {}
    headers.forEach(({ label, raw }) => { obj[label] = raw(row) })
    return obj
  })
  const ws = XLSX.utils.json_to_sheet(data)
  // Auto-width columns
  const colWidths = headers.map(({ label, raw }) => ({
    wch: Math.max(label.length, ...rows.map((r) => String(raw(r)).length)) + 2,
  }))
  ws['!cols'] = colWidths

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, title.slice(0, 31))
  XLSX.writeFile(wb, `${title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`)
}

function exportPDF(rows, headers, title) {
  const headerCells = headers.map((h) => `<th>${h.label}</th>`).join('')
  const bodyRows = rows.map((row) =>
    `<tr>${headers.map(({ raw }) => `<td>${raw(row) || '—'}</td>`).join('')}</tr>`
  ).join('')

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; padding: 28px; color: #111827; }
    .header { margin-bottom: 18px; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px; }
    .header h1 { font-size: 18px; font-weight: 700; color: #111827; }
    .header p  { font-size: 10px; color: #6b7280; margin-top: 3px; }
    table  { width: 100%; border-collapse: collapse; font-size: 10px; }
    th     { background: #f9fafb; text-align: left; padding: 7px 8px; font-weight: 600; font-size: 9px; text-transform: uppercase; letter-spacing: .05em; border: 1px solid #e5e7eb; color: #374151; }
    td     { padding: 5px 8px; border: 1px solid #e5e7eb; vertical-align: top; color: #374151; }
    tr:nth-child(even) td { background: #f9fafb; }
    .footer { margin-top: 16px; font-size: 9px; color: #9ca3af; border-top: 1px solid #f3f4f6; padding-top: 8px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>${title}</h1>
    <p>San Jose Municipal Hall &middot; ICT Inventory &amp; Tracking Management System &middot; Generated: ${new Date().toLocaleString('en-PH')} &middot; ${rows.length} record(s)</p>
  </div>
  <table>
    <thead><tr>${headerCells}</tr></thead>
    <tbody>${bodyRows}</tbody>
  </table>
  <p class="footer">This is a system-generated report. &copy; ${new Date().getFullYear()} San Jose Municipal Hall.</p>
  <script>window.onload = () => { window.print(); window.onafterprint = () => window.close() }<\/script>
</body>
</html>`

  const win = window.open('', '_blank', 'width=1100,height=800')
  win.document.write(html)
  win.document.close()
}

// ── Totals row for Asset Valuation ────────────────────────────────────────────
function ValuationTotalsRow({ rows }) {
  const total = rows.reduce((s, r) => s + Number(r.amountValue || 0), 0)
  return (
    <tr className="border-t-2 border-zinc-700 bg-zinc-800/60">
      <td className="px-4 py-3 text-sm font-bold text-white" colSpan={4}>Total</td>
      <td className="px-4 py-3 text-sm font-bold text-amber-400">{fmtMoney(total)}</td>
      <td className="px-4 py-3" colSpan={2} />
    </tr>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────
function Reports() {
  const { show } = useToast()

  const [activeId, setActiveId]     = useState(null)
  const [reportData, setReportData] = useState([])
  const [loading, setLoading]       = useState(false)

  const previewRef = useRef(null)

  const activeReport = REPORTS.find((r) => r.id === activeId)

  const handleGenerate = async (report) => {
    if (activeId === report.id) {
      // clicking again collapses
      setActiveId(null)
      setReportData([])
      return
    }
    setLoading(true)
    setActiveId(report.id)
    setReportData([])
    try {
      const data = await report.load()
      setReportData(data)
      setTimeout(() => previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch {
      show('Failed to load report data.', 'error')
      setActiveId(null)
    } finally {
      setLoading(false)
    }
  }

  // For the valuation report, append a total row before exporting
  const getExportRows = () => {
    if (activeId !== 'valuation') return reportData
    const total = reportData.reduce((s, r) => s + Number(r.amountValue || 0), 0)
    return [
      ...reportData,
      {
        article: 'TOTAL ACQUISITION VALUE', itemCode: '', equipmentType: '',
        serialNumber: '', amountValue: total, acquisitionDate: '', office: '',
      },
    ]
  }

  const handleExcelExport = () => {
    if (!activeReport || reportData.length === 0) return
    exportExcel(getExportRows(), activeReport.headers, activeReport.title)
  }

  const handlePDFExport = () => {
    if (!activeReport || reportData.length === 0) return
    exportPDF(getExportRows(), activeReport.headers, activeReport.title)
  }

  return (
    <MainLayout>
      {/* ── Report type cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        {REPORTS.map((report) => {
          const isActive = activeId === report.id
          return (
            <div
              key={report.id}
              onClick={() => handleGenerate(report)}
              className={`bg-zinc-900 rounded-xl border p-5 flex items-start gap-4 cursor-pointer transition-all duration-200 group hover:-translate-y-0.5 ${
                isActive
                  ? 'border-brand-500/50 ring-1 ring-brand-500/30'
                  : 'border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg ${report.iconBg} flex items-center justify-center flex-shrink-0`}>
                {report.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-200">{report.title}</p>
                <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{report.description}</p>
                <button className={`mt-3 text-xs font-semibold flex items-center gap-1 transition-colors duration-150 ${
                  isActive ? 'text-brand-400' : 'text-brand-500 hover:text-brand-400'
                }`}>
                  {isActive ? 'Collapse' : 'Generate Report'}
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-3.5 w-3.5 transition-transform duration-200 ${isActive ? 'rotate-90' : 'group-hover:translate-x-0.5'}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              {isActive && (
                <span className="flex-shrink-0 w-2 h-2 rounded-full bg-brand-400 mt-1" />
              )}
            </div>
          )
        })}
      </div>

      {/* ── Report preview ─────────────────────────────────────────────── */}
      {activeId && (
        <div ref={previewRef} className="bg-zinc-900 rounded-xl border border-zinc-800">
          {/* Preview header */}
          <div className="px-5 py-3.5 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-zinc-300">{activeReport?.title}</p>
              {!loading && (
                <p className="text-xs text-zinc-500 mt-px">{reportData.length} {reportData.length === 1 ? 'record' : 'records'}</p>
              )}
            </div>
            {!loading && reportData.length > 0 && (
              <div className="flex gap-2">
                <Button variant="secondary" size="md" onClick={handleExcelExport}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Export Excel
                </Button>
                <Button variant="secondary" size="md" onClick={handlePDFExport}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                  </svg>
                  Print / PDF
                </Button>
              </div>
            )}
          </div>

          {/* Preview body */}
          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center py-16 gap-3 text-zinc-500">
                <svg className="animate-spin h-5 w-5 text-brand-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <span className="text-sm">Loading report data…</span>
              </div>
            ) : reportData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 gap-2 text-zinc-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm">No data available for this report.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-zinc-800">
                <table className="min-w-full text-sm divide-y divide-zinc-800">
                  <thead className="bg-zinc-900 sticky top-0">
                    <tr>
                      {activeReport.headers.map((h) => (
                        <th key={h.label} className="px-4 py-3 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-wider whitespace-nowrap">
                          {h.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-zinc-950 divide-y divide-zinc-800/60">
                    {reportData.map((row, i) => (
                      <tr key={i} className="hover:bg-zinc-800/50 transition-colors duration-100">
                        {activeReport.headers.map((h) => (
                          <td key={h.label} className="px-4 py-3 text-zinc-300 whitespace-nowrap">
                            {h.display(row)}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {activeId === 'valuation' && <ValuationTotalsRow rows={reportData} />}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── No active report placeholder ───────────────────────────────── */}
      {!activeId && (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 flex flex-col items-center justify-center gap-3 text-zinc-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-zinc-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm">Select a report type above to generate a preview.</p>
        </div>
      )}
    </MainLayout>
  )
}

export default Reports
