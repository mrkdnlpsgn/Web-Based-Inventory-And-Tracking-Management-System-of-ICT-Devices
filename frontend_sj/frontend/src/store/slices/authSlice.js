import { createSlice } from '@reduxjs/toolkit'

// User info (non-sensitive) is kept in sessionStorage for page-refresh persistence.
// The JWT itself lives only in an HttpOnly cookie — inaccessible to JavaScript.
const savedUser = (() => {
  try { return JSON.parse(sessionStorage.getItem('auth-user') || 'null') }
  catch { return null }
})()

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:            savedUser,
    isAuthenticated: !!savedUser,
    loading:         false,
    error:           null,
  },
  reducers: {
    setCredentials: (state, action) => {
      state.user            = action.payload.user
      state.isAuthenticated = true
      sessionStorage.setItem('auth-user', JSON.stringify(action.payload.user))
    },
    logout: (state) => {
      state.user            = null
      state.isAuthenticated = false
      sessionStorage.removeItem('auth-user')
    },
  },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer
