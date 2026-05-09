import { QRCodeSVG } from 'qrcode.react'
import Modal from '../../components/common/Modal'
import Button from '../../components/common/Button'
const QR_PREFIX = 'ict-inv:'

const QR_CARD_STYLES = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; }
  .card { border: 2px solid #e5e7eb; border-radius: 16px; padding: 28px 32px; text-align: center; max-width: 300px; width: 100%; }
  .card svg { display: block; margin: 0 auto 16px; }
  .title { font-size: 17px; font-weight: 700; color: #111827; margin-bottom: 4px; }
  .sub   { font-size: 12px; color: #6b7280; margin-bottom: 2px; }
  .sn    { font-size: 11px; font-family: monospace; color: #374151; margin-top: 4px; }
  .badge { display: inline-block; margin-top: 10px; padding: 3px 12px; background: #f3f4f6; border-radius: 999px; font-size: 11px; font-weight: 600; color: #374151; }
  .org   { margin-top: 14px; padding-top: 12px; border-top: 1px solid #f3f4f6; font-size: 10px; color: #9ca3af; }
`

function buildCardHTML(item, device, svgHTML) {
  const sn   = device?.serialNumber ? `<p class="sn">S/N: ${device.serialNumber}</p>` : ''
  const code = item.itemCode || ''
  return `<div class="card">
    ${svgHTML}
    <p class="title">${item.article || '—'}</p>
    <p class="sub">${item.equipmentType || ''}</p>
    <p class="sub">${[item.office, item.location].filter(Boolean).join(' · ')}</p>
    ${sn}
    <span class="badge">${code}</span>
    <p class="org">San Jose Municipal Hall · ICT Inventory System</p>
  </div>`
}

function printSingleQR(item, device, svgId) {
  const svgEl = document.getElementById(svgId)
  if (!svgEl) return
  const win = window.open('', '_blank', 'width=480,height=640')
  win.document.write(`<!DOCTYPE html><html><head>
  <title>QR Code – ${item.article || item.itemCode}</title>
  <style>${QR_CARD_STYLES}
    body { display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }
  </style></head><body>
  ${buildCardHTML(item, device, svgEl.outerHTML)}
  <script>window.onload = () => { window.print(); window.onafterprint = () => window.close() }<\/script>
  </body></html>`)
  win.document.close()
}

function printAllQRs(item, devices) {
  const cards = devices.map((device, i) => {
    const svgEl = document.getElementById(`inv-qr-svg-${i}`)
    return svgEl ? buildCardHTML(item, device, svgEl.outerHTML) : null
  }).filter(Boolean)
  if (!cards.length) return
  const win = window.open('', '_blank', 'width=900,height=700')
  win.document.write(`<!DOCTYPE html><html><head>
  <title>QR Codes – ${item.article || item.itemCode}</title>
  <style>${QR_CARD_STYLES}
    body { padding: 20px; }
    h1 { font-size: 13px; font-weight: 700; margin-bottom: 14px; color: #111; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .card { border-width: 1.5px; padding: 14px 12px; break-inside: avoid; }
    .card svg { margin-bottom: 8px; }
    .title { font-size: 12px; }
    .sub, .sn { font-size: 10px; }
    .badge { font-size: 10px; margin-top: 6px; padding: 2px 8px; }
    .org { font-size: 9px; margin-top: 8px; padding-top: 6px; }
    @media print { @page { margin: 10mm; } body { padding: 0; } }
  </style></head><body>
  <h1>ICT Inventory QR Codes — San Jose Municipal Hall (${devices.length} unit${devices.length !== 1 ? 's' : ''})</h1>
  <div class="grid">${cards.join('')}</div>
  <script>window.onload=()=>{window.print();window.onafterprint=()=>window.close()}<\/script>
  </body></html>`)
  win.document.close()
}

function qrValue(item, device) {
  return device?.serialNumber
    ? `${QR_PREFIX}${item.id}:${device.serialNumber}`
    : `${QR_PREFIX}${item.id}`
}

function QRModal({ item, onClose }) {
  const devices = item.devices?.length > 0 ? item.devices : [null]
  const isMulti = devices.length > 1

  return (
    <Modal
      title="QR Code"
      subtitle={
        isMulti
          ? `${devices.length} units — ${item.article || item.itemCode}`
          : item.article || item.itemCode
      }
      onClose={onClose}
      size={isMulti ? 'lg' : 'md'}
    >
      {isMulti ? (
        /* ── Multiple devices: scrollable grid ── */
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[420px] overflow-y-auto pr-1">
            {devices.map((device, i) => {
              const code = item.itemCode || ''
              return (
                <div key={i} className="bg-white rounded-xl p-3 flex flex-col items-center gap-1.5 shadow-sm">
                  <QRCodeSVG
                    id={`inv-qr-svg-${i}`}
                    value={qrValue(item, device)}
                    size={96}
                    bgColor="#ffffff"
                    fgColor="#111827"
                    level="H"
                  />
                  <p className="text-[11px] font-bold text-gray-900 leading-tight text-center w-full truncate">
                    {item.article || '—'}
                  </p>
                  {device?.serialNumber && (
                    <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full truncate max-w-full">
                      {device.serialNumber}
                    </span>
                  )}
                  <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold">
                    {code}
                  </span>
                  <button
                    onClick={() => printSingleQR(item, device, `inv-qr-svg-${i}`)}
                    className="flex items-center gap-1 text-[10px] font-semibold text-brand-600 hover:text-brand-500 transition-colors mt-0.5"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                    </svg>
                    Print
                  </button>
                </div>
              )
            })}
          </div>

          <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
            <Button variant="secondary" size="md" className="flex-1" onClick={onClose}>
              Close
            </Button>
            <Button size="md" className="flex-1" onClick={() => printAllQRs(item, devices)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
              </svg>
              Print All QR Codes
            </Button>
          </div>
        </div>
      ) : (
        /* ── Single device: large card (existing layout) ── */
        <div className="flex flex-col items-center gap-5 py-2">
          <div className="bg-white p-5 rounded-2xl shadow-lg">
            <QRCodeSVG
              id="inv-qr-svg-0"
              value={qrValue(item, devices[0])}
              size={180}
              bgColor="#ffffff"
              fgColor="#111827"
              level="H"
            />
          </div>

          <div className="w-full space-y-1.5 text-center">
            <p className="text-base font-semibold text-slate-900 dark:text-white">{item.article || '—'}</p>
            <p className="text-xs text-slate-500 dark:text-zinc-500">
              {[item.equipmentType, item.itemCode, item.office].filter(Boolean).join(' · ')}
            </p>
            {devices[0]?.serialNumber && (
              <p className="text-xs font-mono text-slate-400 dark:text-zinc-400">S/N: {devices[0].serialNumber}</p>
            )}
          </div>

          <div className="flex gap-2 w-full">
            <Button variant="secondary" size="md" onClick={onClose} className="flex-1">
              Close
            </Button>
            <Button size="md" onClick={() => printSingleQR(item, devices[0], 'inv-qr-svg-0')} className="flex-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
              </svg>
              Print QR
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default QRModal
