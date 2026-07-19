import api from './api';

export const getOffices   = (search = '') => search.trim()
  ? api.get('/offices', { params: { search: search.trim() } })
  : api.get('/offices');
export const createOffice = (data, idempotencyKey)      => api.post('/offices', data, idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined);
export const updateOffice = (id, data)  => api.put(`/offices/${id}`, data);
export const deleteOffice = (id)        => api.delete(`/offices/${id}`);
