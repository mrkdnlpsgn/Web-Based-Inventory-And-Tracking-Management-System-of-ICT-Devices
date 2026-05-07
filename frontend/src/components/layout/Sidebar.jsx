import { NavLink } from 'react-router-dom'

const navItems = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    to: '/inventory',
    label: 'Inventory',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    to: '/tracking',
    label: 'Tracking',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    to: '/reports',
    label: 'Reports',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
      </svg>
    ),
  },
  {
    to: '/qr-scanner',
    label: 'QR Scanner',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1zM11 7a1 1 0 112 0v1h1a1 1 0 110 2h-2a1 1 0 01-1-1V7zM7 11a1 1 0 100 2h1v1a1 1 0 102 0v-2a1 1 0 00-1-1H7zM13 11a1 1 0 100 2h.01a1 1 0 100-2H13zM15 13a1 1 0 100 2h.01a1 1 0 100-2H15zM13 15a1 1 0 100 2h.01a1 1 0 100-2H13z" clipRule="evenodd" />
      </svg>
    ),
  },
]

function Sidebar({ isCollapsed, onToggle }) {
  return (
    <aside
      className={`
        ${isCollapsed ? 'w-[60px]' : 'w-60'}
        min-h-screen bg-zinc-950 border-r border-zinc-800
        flex flex-col flex-shrink-0
        transition-all duration-300 ease-in-out
      `}
    >
      {/* Brand */}
      <div
        className={`flex items-center h-[60px] border-b border-zinc-800 ${
          isCollapsed ? 'justify-center' : 'justify-between px-4'
        }`}
      >
        {/* Logo + text — hidden when collapsed to prevent overlap */}
        {!isCollapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white whitespace-nowrap leading-tight">ICT Inventory</p>
              <p className="text-[11px] text-zinc-500 whitespace-nowrap leading-tight mt-px">Management System</p>
            </div>
          </div>
        )}

        <button
          onClick={onToggle}
          className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-all duration-150 flex-shrink-0"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-hidden">
        {!isCollapsed && (
          <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest px-2 mb-2 whitespace-nowrap">
            Main Menu
          </p>
        )}

        {navItems.map(({ to, label, icon }) => (
          <div key={to} className="relative group">
            <NavLink
              to={to}
              className={({ isActive }) =>
                [
                  'flex items-center rounded-md text-sm font-medium transition-all duration-150',
                  isCollapsed
                    ? 'justify-center w-10 h-10 mx-auto'
                    : 'gap-2.5 px-2.5 py-2 w-full',
                  isActive
                    ? 'bg-white text-zinc-900'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100',
                ].join(' ')
              }
            >
              {icon}
              {!isCollapsed && (
                <span className="whitespace-nowrap overflow-hidden">{label}</span>
              )}
            </NavLink>

            {/* Tooltip when collapsed */}
            {isCollapsed && (
              <div className="
                absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50
                bg-zinc-800 border border-zinc-700 text-white text-xs font-medium
                px-2.5 py-1.5 rounded-lg shadow-xl pointer-events-none whitespace-nowrap
                opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100
                transition-all duration-150
              ">
                {label}
                <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-zinc-800" />
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div
        className={`border-t border-zinc-800 overflow-hidden transition-all duration-300 ${
          isCollapsed ? 'max-h-0 py-0' : 'max-h-20 px-4 py-4'
        }`}
      >
        <p className="text-xs text-zinc-500 whitespace-nowrap">San Jose Municipal Hall</p>
        <p className="text-[11px] text-zinc-600 mt-0.5 whitespace-nowrap">Republic of the Philippines</p>
      </div>
    </aside>
  )
}

export default Sidebar
