import api from './api'

export const login          = (credentials)              => api.post('/auth/login',           credentials)
export const logout         = ()                         => api.post('/auth/logout')
export const forgotPassword = (identifier)               => api.post('/auth/forgot-password', { identifier })
export const verifyOtp      = (identifier, otp)          => api.post('/auth/verify-otp',      { identifier, otp })
export const resetPassword  = (resetToken, newPassword)  => api.post('/auth/reset-password',  { resetToken, newPassword })
