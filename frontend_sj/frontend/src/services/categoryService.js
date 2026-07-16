import api from './api';

export const getCategories   = (search = '') => search.trim()
  ? api.get('/categories', { params: { search: search.trim() } })
  : api.get('/categories');
export const createCategory  = (data, idempotencyKey)      => api.post('/categories', data, idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined);
export const updateCategory  = (id, data)  => api.put(`/categories/${id}`, data);
export const deleteCategory  = (id)        => api.delete(`/categories/${id}`);
