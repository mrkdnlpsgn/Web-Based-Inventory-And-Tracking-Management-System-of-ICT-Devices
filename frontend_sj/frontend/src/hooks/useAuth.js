import { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setCredentials, logout } from '../store/slices/authSlice'
import { login as loginApi, logout as logoutApi } from '../services/authService'

export function useAuth() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const { user, isAuthenticated } = useSelector((state) => state.auth)

  const login = useCallback(async ({ identifier, password }) => {
    const { data } = await loginApi({ identifier, password })
    // Backend sets the JWT as an HttpOnly cookie — only user info is in the response body
    dispatch(setCredentials({ user: data.user }))
  }, [dispatch])

  const signOut = useCallback(async () => {
    try { await logoutApi() } catch {} // clears the HttpOnly cookie on the backend
    dispatch(logout())
    navigate('/login', { replace: true })
  }, [dispatch, navigate])

  return { user, isAuthenticated, login, signOut }
}
