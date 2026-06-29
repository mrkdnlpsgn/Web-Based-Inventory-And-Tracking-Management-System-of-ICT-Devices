import api from './api';

export const getMaintenance        = (search = '') => search.trim()
  ? api.get('/maintenance', { params: { search: search.trim() } })
  : api.get('/maintenance');
export const getMaintenanceById    = (id)        => api.get(`/maintenance/${id}`);
export const getMaintenanceByAsset = (assetId)   => api.get(`/maintenance/asset/${assetId}`);
export const createMaintenance     = (data)      => api.post('/maintenance', data);
export const updateMaintenance     = (id, data)  => api.put(`/maintenance/${id}`, data);
export const deleteMaintenance     = (id, body)  => api.delete(`/maintenance/${id}`, { data: body });
