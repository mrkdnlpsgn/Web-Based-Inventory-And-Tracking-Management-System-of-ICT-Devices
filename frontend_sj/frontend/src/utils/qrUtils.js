const QR_PREFIX   = 'ict-inv:'
const QR_SALT     = 'sjmh-ict-inventory-2024'
const QR_HASH_LEN = 12   // first 12 hex chars of SHA-256

async function sha256Hex(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Builds a signed QR value: ict-inv:{id}:{hash} or ict-inv:{id}:{serial}:{hash}
 * The hash is the first 12 hex chars of SHA-256(salt:data).
 */
export async function buildQrValue(id, serial = null) {
  const data = serial ? `${id}:${serial}` : `${id}`
  const hash = (await sha256Hex(`${QR_SALT}:${data}`)).slice(0, QR_HASH_LEN)
  return `${QR_PREFIX}${data}:${hash}`
}

/**
 * Verifies a scanned QR code and returns { verified, id, serial }.
 * Non-prefixed codes (manual item code entry) pass through unverified.
 */
export async function verifyQrCode(raw) {
  if (!raw.startsWith(QR_PREFIX)) return { verified: false, id: raw.trim(), serial: null }

  const stripped = raw.slice(QR_PREFIX.length)
  const parts    = stripped.split(':')

  if (parts.length < 2) return { verified: false, id: parts[0], serial: null }

  const hash      = parts[parts.length - 1]
  const dataParts = parts.slice(0, -1)
  const id        = dataParts[0]
  const serial    = dataParts[1] || null
  const data      = dataParts.join(':')

  const expected = (await sha256Hex(`${QR_SALT}:${data}`)).slice(0, QR_HASH_LEN)
  return { verified: hash === expected, id, serial }
}
