import api from './api';

export const getAssetHistory    = (search = '') => search.trim()
  ? api.get('/asset-history', { params: { search: search.trim() } })
  : api.get('/asset-history');
export const getHistoryByAsset  = (id)    => api.get(`/asset-history/asset/${id}`);
export const createAssetHistory = (data)  => api.post('/asset-history', data);
