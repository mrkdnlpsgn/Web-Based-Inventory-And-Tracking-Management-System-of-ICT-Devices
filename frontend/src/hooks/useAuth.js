import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setCredentials, logout } from '../store/slices/authSlice'

// ── Static test credentials ───────────────────────────────────────────────────
// Replace / extend these with real API calls once the backend is ready.
const STATIC_USERS = [
  {
    email:    'admin@sjmh.gov.ph',
    password: 'admin123',
    name:     'Administrator',
    role:     'admin',
  },
  {
    email:    'ict@sjmh.gov.ph',
    password: 'ict2024',
    name:     'ICT Officer',
    role:     'staff',
  },
]

export function useAuth() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const { user, token, isAuthenticated } = useSelector((state) => state.auth)

  const login = async ({ email, password }) => {
    const match = STATIC_USERS.find(
      (u) =>
        u.email.toLowerCase() === email.trim().toLowerCase() &&
        u.password === password
    )
    if (!match) throw new Error('Invalid credentials')

    const { password: _omit, ...userInfo } = match
    const mockToken = `mock-token-${Date.now()}`

    localStorage.setItem('token',     mockToken)
    localStorage.setItem('auth-user', JSON.stringify(userInfo))

    dispatch(setCredentials({ user: userInfo, token: mockToken }))
  }

  const signOut = () => {
    dispatch(logout())
    navigate('/login', { replace: true })
  }

  return { user, token, isAuthenticated, login, signOut }
}
