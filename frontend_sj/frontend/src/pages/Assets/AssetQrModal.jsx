import { useEffect, useState } from 'react'
import Modal from '../../components/common/Modal'
import Button from '../../components/common/Button'
import { getAssetQrCode } from '../../services/assetService'
import { escapeHtml } from '../../utils/helpers'

const QR_CARD_STYLES = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }
  .card { border: 2px solid #e5e7eb; border-radius: 16px; padding: 28px 32px; text-align: center; max-width: 300px; width: 100%; }
  .card img { display: block; margin: 0 auto 16px; width: 200px; height: 200px; }
  .title { font-size: 17px; font-weight: 700; color: #111827; margin-bottom: 4px; }
  .badge { display: inline-block; margin-top: 10px; padding: 3px 12px; background: #f3f4f6; border-radius: 999px; font-size: 11px; font-weight: 600; color: #374151; }
  .org   { margin-top: 14px; padding-top: 12px; border-top: 1px solid #f3f4f6; font-size: 10px; color: #9ca3af; }
`

function printQr(asset, imgUrl) {
  const win = window.open('', '_blank', 'width=480,height=640')
  if (!win) return
  win.document.write(`<!DOCTYPE html><html><head>
  <title>QR Code – ${escapeHtml(asset.propertyNumber)}</title>
  <style>${QR_CARD_STYLES}</style></head><body>
  <div class="card">
    <img src="${imgUrl}" alt="QR code" />
    <p class="title">${escapeHtml(asset.description) || '—'}</p>
    <span class="badge">${escapeHtml(asset.propertyNumber)}</span>
    <p class="org">San Jose Municipal Hall · GSO Inventory Management System</p>
  </div>
  <script>window.onload = () => { window.print(); window.onafterprint = () => window.close() }<\/script>
  </body></html>`)
  win.document.close()
}

function AssetQrModal({ asset, onClose }) {
  const [imgUrl, setImgUrl] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let objectUrl
    let cancelled = false
    getAssetQrCode(asset.id)
      .then(({ data }) => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(data)
        setImgUrl(objectUrl)
      })
      .catch(() => { if (!cancelled) setError('Failed to generate QR code.') })
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [asset.id])

  return (
    <Modal title="Asset QR Code" subtitle={asset.propertyNumber} onClose={onClose} size="md">
      <div className="flex flex-col items-center gap-4 py-2">
        <div className="bg-white p-5 rounded-2xl shadow-lg h-[220px] w-[220px] flex items-center justify-center">
          {error ? (
            <p className="text-sm text-red-500 text-center px-2">{error}</p>
          ) : imgUrl ? (
            <img src={imgUrl} alt={`QR code for ${asset.propertyNumber}`} width={200} height={200} />
          ) : (
            <div className="animate-pulse h-[200px] w-[200px] rounded-lg bg-slate-100" />
          )}
        </div>

        <div className="space-y-1 text-center">
          <p className="text-base font-semibold text-slate-900 dark:text-white">{asset.description}</p>
          <p className="text-xs text-slate-500 dark:text-zinc-500">Scan with the mobile app to check this asset's status</p>
        </div>

        <div className="flex gap-2 w-full pt-1 border-t border-slate-100 dark:border-zinc-800">
          <Button variant="secondary" size="md" onClick={onClose} className="flex-1">Close</Button>
          <Button size="md" onClick={() => printQr(asset, imgUrl)} disabled={!imgUrl} className="flex-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
            </svg>
            Print Label
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default AssetQrModal
