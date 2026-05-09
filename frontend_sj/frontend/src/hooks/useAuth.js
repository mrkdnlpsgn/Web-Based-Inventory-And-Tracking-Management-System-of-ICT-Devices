import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setCredentials, logout } from '../store/slices/authSlice'
import { login as loginApi } from '../services/authService'

export function useAuth() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const { user, token, isAuthenticated } = useSelector((state) => state.auth)

  const login = async ({ email, password }) => {
    const { data } = await loginApi({ email, password })

    sessionStorage.setItem('token',     data.token)
    sessionStorage.setItem('auth-user', JSON.stringify(data.user))

    dispatch(setCredentials({ user: data.user, token: data.token }))
  }

  const signOut = () => {
    dispatch(logout())
    navigate('/login', { replace: true })
  }

  return { user, token, isAuthenticated, login, signOut }
}
