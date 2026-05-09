import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'

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

const adminNavItems = [
  {
    to: '/accounts',
    label: 'Accounts',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
      </svg>
    ),
  },
  {
    to: '/audit-logs',
    label: 'Audit Logs',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
    ),
  },
]

function Sidebar({ isCollapsed, onToggle }) {
  const user = useSelector((s) => s.auth.user)
  const isAdmin = user?.role === 'admin'

  return (
    <aside
      className={`
        ${isCollapsed ? 'w-[60px]' : 'w-60'}
        min-h-screen bg-white dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-800
        flex flex-col flex-shrink-0
        transition-all duration-300 ease-in-out
      `}
    >
      {/* Brand */}
      <div
        className={`flex items-center h-[60px] border-b border-slate-200 dark:border-zinc-800 ${
          isCollapsed ? 'justify-center' : 'justify-between px-4'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 overflow-hidden">
          <img
            src="/logo.jpg"
            alt="San Jose Municipal Hall seal"
            className="rounded-full object-cover bg-white flex-shrink-0 ring-1 ring-slate-200 dark:ring-white/10 transition-all duration-300 w-8 h-8"
          />
          {!isCollapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-900 dark:text-white whitespace-nowrap leading-tight">ICT Inventory</p>
              <p className="text-2xs text-slate-400 dark:text-zinc-500 whitespace-nowrap leading-tight mt-px">Management System</p>
            </div>
          )}
        </div>

        <button
          onClick={onToggle}
          className="p-1.5 rounded-md text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all duration-150 flex-shrink-0"
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
      <nav className="flex-1 px-2 py-3 overflow-hidden flex flex-col gap-0.5">
        {!isCollapsed && (
          <p className="text-2xs font-semibold text-slate-400 dark:text-zinc-600 uppercase tracking-widest px-2 mb-1.5 whitespace-nowrap">
            Main Menu
          </p>
        )}

        {[...navItems].map(({ to, label, icon }) => (
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
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-zinc-900'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-zinc-100',
                ].join(' ')
              }
            >
              {icon}
              {!isCollapsed && (
                <span className="whitespace-nowrap overflow-hidden">{label}</span>
              )}
            </NavLink>

            {isCollapsed && (
              <div className="
                absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50
                bg-slate-800 dark:bg-zinc-800 border border-slate-700 dark:border-zinc-700 text-white text-xs font-medium
                px-2.5 py-1.5 rounded-lg shadow-xl pointer-events-none whitespace-nowrap
                opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100
                transition-all duration-150
              ">
                {label}
                <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800 dark:border-r-zinc-800" />
              </div>
            )}
          </div>
        ))}

        {isAdmin && (
          <>
            <div className={`mt-2 mb-1.5 ${isCollapsed ? 'border-t border-slate-200 dark:border-zinc-800 mx-2 pt-2' : 'border-t border-slate-200 dark:border-zinc-800 mx-1 pt-2'}`}>
              {!isCollapsed && (
                <p className="text-2xs font-semibold text-slate-400 dark:text-zinc-600 uppercase tracking-widest px-1.5 whitespace-nowrap">
                  Administration
                </p>
              )}
            </div>
            {adminNavItems.map(({ to, label, icon }) => (
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
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-zinc-900'
                        : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-zinc-100',
                    ].join(' ')
                  }
                >
                  {icon}
                  {!isCollapsed && (
                    <span className="whitespace-nowrap overflow-hidden">{label}</span>
                  )}
                </NavLink>

                {isCollapsed && (
                  <div className="
                    absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50
                    bg-slate-800 dark:bg-zinc-800 border border-slate-700 dark:border-zinc-700 text-white text-xs font-medium
                    px-2.5 py-1.5 rounded-lg shadow-xl pointer-events-none whitespace-nowrap
                    opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100
                    transition-all duration-150
                  ">
                    {label}
                    <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800 dark:border-r-zinc-800" />
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </nav>

      {/* Footer */}
      <div
        className={`border-t border-slate-200 dark:border-zinc-800 overflow-hidden transition-all duration-300 ${
          isCollapsed ? 'max-h-0 py-0' : 'max-h-20 px-4 py-4'
        }`}
      >
        <p className="text-xs text-slate-500 dark:text-zinc-500 whitespace-nowrap">San Jose Municipal Hall</p>
        <p className="text-2xs text-slate-400 dark:text-zinc-600 mt-0.5 whitespace-nowrap">Republic of the Philippines</p>
      </div>
    </aside>
  )
}

export default Sidebar
