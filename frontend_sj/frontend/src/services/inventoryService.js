import api from './api'

// ── Equipment ─────────────────────────────────────────────────────────────────
export const getEquipment    = ()           => api.get('/equipment')
export const createEquipment = (data, idempotencyKey)       => api.post('/equipment', data, idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined)
export const updateEquipment = (id, data)   => api.put(`/equipment/${id}`, data)
export const deleteEquipment = (id)         => api.delete(`/equipment/${id}`)

// ── Mock Hardware Scanner Integration ────────────────────────────────────────
export const mockScannerReceive = (payload) => api.post('/scanner/receive', payload)

// ── Devices (nested under equipment) ─────────────────────────────────────────
export const addDevice    = (equipmentId, data, idempotencyKey)           => api.post(`/equipment/${equipmentId}/devices`, data, idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined)
export const updateDevice = (equipmentId, deviceId, data) => api.put(`/equipment/${equipmentId}/devices/${deviceId}`, data)
export const deleteDevice = (equipmentId, deviceId)       => api.delete(`/equipment/${equipmentId}/devices/${deviceId}`)
