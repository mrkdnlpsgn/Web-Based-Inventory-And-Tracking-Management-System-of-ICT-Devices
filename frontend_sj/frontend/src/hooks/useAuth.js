import { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setCredentials, logout } from '../store/slices/authSlice'
import { login as loginApi, logout as logoutApi, forceChangePassword as forceChangePasswordApi } from '../services/authService'

export function useAuth() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const { user, isAuthenticated } = useSelector((state) => state.auth)

  // Correct credentials but a temp password return { mustChangePassword: true } instead
  // of a session — the caller (Login) must prompt for a new password before this resolves.
  const login = useCallback(async ({ identifier, password }) => {
    const { data } = await loginApi({ identifier, password })
    if (data.mustChangePassword) return data
    // Backend sets the JWT as an HttpOnly cookie — only user info is in the response body
    dispatch(setCredentials({ user: data.user }))
    return data
  }, [dispatch])

  const completeForcedPasswordChange = useCallback(async ({ identifier, currentPassword, newPassword }) => {
    const { data } = await forceChangePasswordApi({ identifier, currentPassword, newPassword })
    dispatch(setCredentials({ user: data.user }))
  }, [dispatch])

  const signOut = useCallback(async () => {
    try { await logoutApi() } catch {} // clears the HttpOnly cookie on the backend
    dispatch(logout())
    navigate('/login', { replace: true })
  }, [dispatch, navigate])

  return { user, isAuthenticated, login, completeForcedPasswordChange, signOut }
}
