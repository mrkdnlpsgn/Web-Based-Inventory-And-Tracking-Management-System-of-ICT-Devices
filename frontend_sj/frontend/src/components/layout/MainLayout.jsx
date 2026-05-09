import { useState, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import IdleWarningModal from '../common/IdleWarningModal'
import { useIdleTimeout } from '../../hooks/useIdleTimeout'
import { useAuth } from '../../hooks/useAuth'

const IDLE_MS = 5 * 60 * 1000   // 5 minutes
const WARN_MS = 4 * 60 * 1000   // warn at 4 minutes (1 minute before logout)

function MainLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showWarning, setShowWarning]  = useState(false)
  const { pathname } = useLocation()
  const { signOut } = useAuth()

  const handleWarn = useCallback(() => setShowWarning(true),  [])
  const handleIdle = useCallback(() => { setShowWarning(false); signOut() }, [signOut])

  const { reset } = useIdleTimeout({
    idleAfterMs: IDLE_MS,
    warnAfterMs: WARN_MS,
    onWarn: handleWarn,
    onIdle: handleIdle,
  })

  const handleStay = () => {
    setShowWarning(false)
    reset()
  }

  const handleLogoutNow = () => {
    setShowWarning(false)
    signOut()
  }

  return (
    <div className="flex min-h-screen bg-white dark:bg-zinc-950">
      <Sidebar
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed((p) => !p)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-auto p-4 sm:p-5 lg:p-6 xl:p-8">
          <div key={pathname} className="animate-fade-slide">
            {children}
          </div>
        </main>
      </div>

      {showWarning && (
        <IdleWarningModal onStay={handleStay} onLogout={handleLogoutNow} />
      )}
    </div>
  )
}

export default MainLayout
