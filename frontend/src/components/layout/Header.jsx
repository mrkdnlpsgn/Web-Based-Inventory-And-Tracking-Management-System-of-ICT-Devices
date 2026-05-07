import { useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const pageMeta = {
  '/dashboard': { title: 'Dashboard',            subtitle: 'Overview of ICT assets and activities' },
  '/inventory':  { title: 'Inventory Management', subtitle: 'Unified equipment and device records' },
  '/tracking':   { title: 'Tracking Logs',         subtitle: 'Monitor device movements and activities' },
  '/reports':    { title: 'Reports',               subtitle: 'Generate and export system reports' },
  '/qr-scanner': { title: 'QR Scanner',            subtitle: 'Scan or search equipment by QR code' },
}

function Header() {
  const { user, signOut } = useAuth()
  const { pathname } = useLocation()
  const meta = pageMeta[pathname] ?? { title: 'ICT Inventory', subtitle: '' }

  const name = user?.name ?? 'Administrator'
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <header className="h-[60px] bg-zinc-950 border-b border-zinc-800 px-6 flex items-center justify-between flex-shrink-0">
      <div>
        <h1 className="text-base font-semibold text-white leading-tight">{meta.title}</h1>
        <p className="text-xs text-zinc-500 mt-px">{meta.subtitle}</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="text-right hidden sm:block mr-1">
          <p className="text-sm font-medium text-zinc-200 leading-tight">{name}</p>
          <p className="text-xs text-zinc-500 leading-tight mt-px">System Administrator</p>
        </div>

        <div className="w-8 h-8 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center select-none flex-shrink-0">
          {initials}
        </div>

        <div className="w-px h-5 bg-zinc-800 mx-1" />

        <button
          onClick={signOut}
          title="Sign Out"
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-red-400 transition-colors duration-150 font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  )
}

export default Header
