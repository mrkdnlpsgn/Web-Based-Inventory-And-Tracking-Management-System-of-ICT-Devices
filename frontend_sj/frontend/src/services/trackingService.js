import api from './api'

export const getTrackingLogs          = ()            => api.get('/tracking')
export const getTrackingByEquipment   = (equipmentId) => api.get(`/tracking/equipment/${equipmentId}`)
export const createTrackingLog        = (data)        => api.post('/tracking', data)
