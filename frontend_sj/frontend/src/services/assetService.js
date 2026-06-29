import api from './api';

export const getAssets       = ()          => api.get('/assets');
export const getAssetById    = (id)        => api.get(`/assets/${id}`);
export const createAsset     = (data)      => api.post('/assets', data);
export const updateAsset     = (id, data)  => api.put(`/assets/${id}`, data);
export const deleteAsset     = (id, body)  => api.delete(`/assets/${id}`, { data: body });
