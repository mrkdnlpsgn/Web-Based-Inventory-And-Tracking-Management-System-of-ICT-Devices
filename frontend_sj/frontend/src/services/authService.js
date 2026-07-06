import api from './api'

export const login          = (credentials)              => api.post('/auth/login',           credentials)
export const logout         = ()                         => api.post('/auth/logout')
export const forgotPassword = (username, newPassword)    => api.post('/auth/forgot-password', { username, newPassword })
