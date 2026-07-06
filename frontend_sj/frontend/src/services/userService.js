import api from './api';

export const getUsers        = (search = '') => search.trim()
  ? api.get('/users', { params: { search: search.trim() } })
  : api.get('/users');
export const createUser      = (data)      => api.post('/users', data);
export const updateUser      = (id, data)  => api.put(`/users/${id}`, data);
export const deleteUser      = (id)        => api.delete(`/users/${id}`);
export const changePassword  = (data)      => api.put('/users/me/password', data);
export const resetPassword   = (id, data)  => api.post(`/users/${id}/reset-password`, data);
