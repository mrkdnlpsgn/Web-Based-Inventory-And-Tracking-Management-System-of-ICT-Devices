import api from './api';

export const getDisposal        = ()          => api.get('/disposal');
export const getDisposalById    = (id)        => api.get(`/disposal/${id}`);
export const getDisposalByAsset = (assetId)   => api.get(`/disposal/asset/${assetId}`);
export const createDisposal     = (data)      => api.post('/disposal', data);
export const updateDisposal     = (id, data)  => api.put(`/disposal/${id}`, data);
export const deleteDisposal     = (id, body)  => api.delete(`/disposal/${id}`, { data: body });
