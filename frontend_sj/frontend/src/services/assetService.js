import api from './api';

export const getAssets       = (search = '') => search.trim()
  ? api.get('/assets', { params: { search: search.trim() } })
  : api.get('/assets');
export const getAssetById    = (id)        => api.get(`/assets/${id}`);
export const getAssetQrCode  = (id, size = 400) => api.get(`/assets/${id}/qr`, { params: { size }, responseType: 'blob' });
export const createAsset     = (data, idempotencyKey)      => api.post('/assets', data, idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined);
export const updateAsset     = (id, data)  => api.put(`/assets/${id}`, data);
export const deleteAsset     = (id, body)  => api.delete(`/assets/${id}`, { data: body });
