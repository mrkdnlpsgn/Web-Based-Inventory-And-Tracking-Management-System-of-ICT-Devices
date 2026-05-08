import { QRCodeSVG } from 'qrcode.react'
import Modal from '../../components/common/Modal'
import Button from '../../components/common/Button'

const QR_PREFIX = 'ict-inv:'

function printQR(item) {
  const svgEl = document.getElementById('inv-qr-svg')
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
  <script>window.onload = () => { window.print(); window.onafterprint = () => window.close() }<\/script>
</body>
</html>`)
  win.document.close()
}

function QRModal({ item, onClose }) {
  return (
    <Modal
      title="QR Code"
      subtitle={item.article || item.itemCode}
      onClose={onClose}
      size="md"
    >
      <div className="flex flex-col items-center gap-5 py-2">
        {/* QR code */}
        <div className="bg-white p-5 rounded-2xl shadow-lg">
          <QRCodeSVG
            id="inv-qr-svg"
            value={`${QR_PREFIX}${item.id}`}
            size={180}
            bgColor="#ffffff"
            fgColor="#111827"
            level="H"
          />
        </div>

        {/* Equipment details */}
        <div className="w-full space-y-1.5 text-center">
          <p className="text-base font-semibold text-white">{item.article || '—'}</p>
          <p className="text-xs text-zinc-500">
            {[item.equipmentType, item.itemCode, item.office].filter(Boolean).join(' · ')}
          </p>
          {item.serialNumber && (
            <p className="text-xs font-mono text-zinc-600">S/N: {item.serialNumber}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 w-full">
          <Button variant="secondary" size="md" onClick={onClose} className="flex-1">
            Close
          </Button>
          <Button size="md" onClick={() => printQR(item)} className="flex-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
            </svg>
            Print QR
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default QRModal
