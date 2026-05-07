import { useEffect, useRef, useState, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { Html5Qrcode } from 'html5-qrcode'
import { QRCodeSVG } from 'qrcode.react'
import MainLayout from '../../components/layout/MainLayout'
import Button from '../../components/common/Button'
import { formatDate } from '../../utils/helpers'

const QR_PREFIX  = 'ict-inv:'
const READER_ID  = 'qr-reader-viewport'

// ── QR print utility ──────────────────────────────────────────────────────────
function printItemQR(item) {
  const svgEl = document.getElementById('qr-result-svg')
  if (!svgEl) return
  const svgHTML = svgEl.outerHTML

  const win = window.open('', '_blank', 'width=480,height=640')
  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>QR Code – ${item.article || item.itemCode}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }
    .card { border: 2px solid #e5e7eb; border-radius: 16px; padding: 28px 32px; text-align: center; max-width: 300px; width: 100%; }
    .card svg { display: block; margin: 0 auto 16px; }
    .title { font-size: 17px; font-weight: 700; color: #111827; margin-bottom: 4px; }
    .sub   { font-size: 12px; color: #6b7280; margin-bottom: 2px; }
    .badge { display: inline-block; margin-top: 10px; padding: 3px 12px; background: #f3f4f6; border-radius: 999px; font-size: 11px; font-weight: 600; color: #374151; }
    .org   { margin-top: 14px; padding-top: 12px; border-top: 1px solid #f3f4f6; font-size: 10px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="card">
    ${svgHTML}
    <p class="title">${item.article || '—'}</p>
    <p class="sub">${item.equipmentType || ''}</p>
    <p class="sub">${[item.office, item.location].filter(Boolean).join(' · ')}</p>
    <span class="badge">${item.itemCode || ''}</span>
    <p class="org">San Jose Municipal Hall · ICT Inventory System</p>
  </div>
  <script>window.onload = () => { window.print(); window.onafterprint = () => window.close() }</script>
</body>
</html>`)
  win.document.close()
}

// ── Component ─────────────────────────────────────────────────────────────────
function QRScanner() {
  const inventoryItems = useSelector((s) => s.inventory.items)

  const [scanning, setScanning]       = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [result, setResult]           = useState(null)  // matched item
  const [notFound, setNotFound]       = useState(false)
  const [manualCode, setManualCode]   = useState('')

  const scannerRef  = useRef(null)
  const isRunning   = useRef(false)

  // ── Scanner lifecycle ────────────────────────────────────────────────────
  const stopScanner = useCallback(async () => {
    if (scannerRef.current && isRunning.current) {
      try { await scannerRef.current.stop() } catch {}
      isRunning.current = false
      setScanning(false)
    }
  }, [])

  useEffect(() => () => { stopScanner() }, [stopScanner])

  const startScanner = async () => {
    setCameraError('')
    setResult(null)
    setNotFound(false)

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(READER_ID)
      }
      await scannerRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        async (text) => {
          await stopScanner()
          processCode(text)
        },
        () => {}
      )
      isRunning.current = true
      setScanning(true)
    } catch {
      setCameraError('Camera access denied or unavailable. Use manual search below.')
    }
  }

  // ── Code processing ──────────────────────────────────────────────────────
  const processCode = useCallback((raw) => {
    const id = raw.startsWith(QR_PREFIX) ? raw.slice(QR_PREFIX.length) : raw.trim()
    const item = inventoryItems.find(
      (i) => i.id === id || i.itemCode?.toLowerCase() === id.toLowerCase()
    )
    if (item) { setResult(item); setNotFound(false) }
    else       { setNotFound(true); setResult(null) }
  }, [inventoryItems])

  const handleManualSearch = (e) => {
    e.preventDefault()
    if (!manualCode.trim()) return
    processCode(manualCode)
  }

  const handleClear = () => {
    setResult(null)
    setNotFound(false)
    setManualCode('')
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* ── Left: Scanner + manual input ─────────────────────────────── */}
        <div className="space-y-4">
          {/* Camera panel */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-zinc-800">
              <p className="text-sm font-semibold text-zinc-300">Camera Scanner</p>
              <p className="text-xs text-zinc-500 mt-px">Point your camera at an ICT device QR code</p>
            </div>

            {/* Video viewport */}
            <div className="relative bg-zinc-950" style={{ minHeight: 280 }}>
              {/* Html5Qrcode injects video into this div */}
              <div id={READER_ID} className="w-full" />

              {/* Idle overlay */}
              {!scanning && !cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-zinc-950">
                  <div className="w-20 h-20 rounded-2xl bg-zinc-800 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8H3a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-3M9 4H7a2 2 0 00-2 2v3a2 2 0 002 2h2a2 2 0 002-2V6a2 2 0 00-2-2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-zinc-500 text-center px-8">
                    Activate your camera to scan a QR code
                  </p>
                  <Button size="md" onClick={startScanner}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1zM11 7a1 1 0 112 0v1h1a1 1 0 110 2h-2a1 1 0 01-1-1V7zM7 11a1 1 0 100 2h1v1a1 1 0 102 0v-2a1 1 0 00-1-1H7zM13 11a1 1 0 100 2h.01a1 1 0 100-2H13zM15 13a1 1 0 100 2h.01a1 1 0 100-2H15zM13 15a1 1 0 100 2h.01a1 1 0 100-2H13z" clipRule="evenodd" />
                    </svg>
                    Start Scanner
                  </Button>
                </div>
              )}

              {/* Camera error */}
              {cameraError && !scanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 bg-zinc-950">
                  <div className="w-12 h-12 rounded-full bg-red-950 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm text-red-400 text-center">{cameraError}</p>
                </div>
              )}
            </div>

            {/* Scanning footer */}
            {scanning && (
              <div className="px-5 py-3 border-t border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-sm text-zinc-400">Scanning for QR code…</p>
                </div>
                <Button variant="secondary" size="sm" onClick={stopScanner}>Stop</Button>
              </div>
            )}
          </div>

          {/* Manual entry */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
            <p className="text-sm font-semibold text-zinc-300 mb-1">Manual Code Entry</p>
            <p className="text-xs text-zinc-500 mb-3">Type an Item Code to search directly.</p>
            <form onSubmit={handleManualSearch} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. ICT-2024-001"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-150"
              />
              <Button type="submit" size="md">Search</Button>
            </form>
          </div>
        </div>

        {/* ── Right: Result panel ───────────────────────────────────────── */}
        <div>
          {/* Default / empty state */}
          {!result && !notFound && (
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 h-full flex flex-col items-center justify-center gap-3 p-8 min-h-[320px]">
              <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-sm text-zinc-600 text-center">
                Scan a QR code or enter an Item Code to view equipment details.
              </p>
            </div>
          )}

          {/* Not found */}
          {notFound && (
            <div className="bg-zinc-900 rounded-xl border border-red-800/40 p-8 flex flex-col items-center justify-center gap-3 min-h-[320px] animate-fade-slide">
              <div className="w-12 h-12 rounded-full bg-red-950 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-red-400">Equipment Not Found</p>
              <p className="text-xs text-zinc-500 text-center">
                No matching equipment found. Make sure the QR code was generated by this system.
              </p>
              <Button variant="secondary" size="sm" onClick={handleClear}>Clear</Button>
            </div>
          )}

          {/* Found result */}
          {result && (
            <div className="bg-zinc-900 rounded-xl border border-emerald-700/40 overflow-hidden animate-fade-slide">
              <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <p className="text-sm font-semibold text-zinc-300">Equipment Found</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => printItemQR(result)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                    </svg>
                    Print QR
                  </button>
                  <button onClick={handleClear} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Clear</button>
                </div>
              </div>

              <div className="p-5 space-y-5">
                {/* QR code (hidden label — used for printing) */}
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-xl inline-block">
                    <QRCodeSVG
                      id="qr-result-svg"
                      value={`${QR_PREFIX}${result.id}`}
                      size={140}
                      bgColor="#ffffff"
                      fgColor="#111827"
                      level="H"
                    />
                  </div>
                </div>

                {/* Unified equipment + device details grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {[
                    { label: 'Article',           value: result.article },
                    { label: 'Item Code',         value: result.itemCode },
                    { label: 'Type',              value: result.type },
                    { label: 'Equipment Type',    value: result.equipmentType },
                    { label: 'Model',             value: result.model },
                    { label: 'Serial Number',     value: result.serialNumber },
                    { label: 'Amount Value',
                      value: result.amountValue
                        ? `₱${Number(result.amountValue).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
                        : null },
                    { label: 'Acquisition Date',  value: result.acquisitionDate ? formatDate(result.acquisitionDate) : null },
                    { label: 'Office',            value: result.office },
                    { label: 'Location',          value: result.location },
                    { label: 'Accountable',       value: result.accountablePerson },
                    { label: 'Description',       value: result.description, full: true },
                  ].filter((f) => f.value).map(({ label, value, full }) => (
                    <div key={label} className={full ? 'col-span-2' : ''}>
                      <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">{label}</p>
                      <p className="text-sm text-zinc-200 mt-0.5 leading-snug">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}

export default QRScanner
