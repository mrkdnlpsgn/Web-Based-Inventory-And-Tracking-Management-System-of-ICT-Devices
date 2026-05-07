import { createSlice } from '@reduxjs/toolkit'

// Restore session from localStorage so the user stays logged in on page refresh
const savedToken = localStorage.getItem('token')
const savedUser = (() => {
  try { return JSON.parse(localStorage.getItem('auth-user') || 'null') }
  catch { return null }
})()

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:            savedUser,
    token:           savedToken,
    isAuthenticated: !!(savedToken && savedUser),
    loading:         false,
    error:           null,
  },
  reducers: {
    setCredentials: (state, action) => {
      state.user            = action.payload.user
      state.token           = action.payload.token
      state.isAuthenticated = true
    },
    logout: (state) => {
      state.user            = null
      state.token           = null
      state.isAuthenticated = false
      localStorage.removeItem('token')
      localStorage.removeItem('auth-user')
    },
  },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer
