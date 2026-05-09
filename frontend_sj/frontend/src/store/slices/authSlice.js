import { createSlice } from '@reduxjs/toolkit'

// sessionStorage persists across page refreshes but is wiped when the tab/browser is closed.
// This forces re-login after every system close without an explicit logout.
const savedToken = sessionStorage.getItem('token')
const savedUser = (() => {
  try { return JSON.parse(sessionStorage.getItem('auth-user') || 'null') }
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
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('auth-user')
    },
  },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer
