import api from './api'

export const getInventory = () => api.get('/inventory')
export const getInventoryItem = (id) => api.get(`/inventory/${id}`)
export const createInventoryItem = (data) => api.post('/inventory', data)
export const updateInventoryItem = (id, data) => api.put(`/inventory/${id}`, data)
export const deleteInventoryItem = (id) => api.delete(`/inventory/${id}`)
