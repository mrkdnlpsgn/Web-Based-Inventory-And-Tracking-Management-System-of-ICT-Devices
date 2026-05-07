import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

function MainLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { pathname } = useLocation()

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <Sidebar
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed((p) => !p)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div key={pathname} className="animate-fade-slide">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default MainLayout
