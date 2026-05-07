import api from './api'

export const getTrackingLogs = () => api.get('/tracking')
export const getTrackingByDevice = (deviceId) => api.get(`/tracking/device/${deviceId}`)
export const createTrackingLog = (data) => api.post('/tracking', data)
