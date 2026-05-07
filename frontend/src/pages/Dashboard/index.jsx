import { Link } from 'react-router-dom'
import MainLayout from '../../components/layout/MainLayout'

const stats = [
  {
    label: 'Total Devices',
    value: '—',
    description: 'All registered ICT assets',
    accent: 'border-t-zinc-600',
    iconBg: 'bg-zinc-800',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-zinc-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: 'Active',
    value: '—',
    description: 'Devices in operation',
    accent: 'border-t-emerald-500',
    iconBg: 'bg-emerald-950',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: 'Under Repair',
    value: '—',
    description: 'Devices being serviced',
    accent: 'border-t-amber-500',
    iconBg: 'bg-amber-950',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: 'Disposed',
    value: '—',
    description: 'Decommissioned assets',
    accent: 'border-t-red-500',
    iconBg: 'bg-red-950',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
  },
]

const quickLinks = [
  { label: 'Add Inventory Record', to: '/inventory' },
  { label: 'View Device List', to: '/devices' },
  { label: 'Check Tracking Logs', to: '/tracking' },
  { label: 'Generate Report', to: '/reports' },
]

function Dashboard() {
  return (
    <MainLayout>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        {stats.map(({ label, value, description, accent, iconBg, icon }) => (
          <div
            key={label}
            className={`bg-zinc-900 rounded-xl border border-zinc-800 border-t-2 ${accent} p-5 transition-all duration-200 hover:border-zinc-700 hover:-translate-y-0.5`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{label}</p>
                <p className="text-3xl font-bold text-white mt-1">{value}</p>
                <p className="text-xs text-zinc-600 mt-1">{description}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
                {icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h2 className="text-sm font-semibold text-zinc-300 mb-4">Recent Activity</h2>
          <div className="flex flex-col items-center justify-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-zinc-800 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-sm text-zinc-600">Activity data will appear here</p>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h2 className="text-sm font-semibold text-zinc-300 mb-3">Quick Links</h2>
          <div className="space-y-0.5">
            {quickLinks.map(({ label, to }) => (
              <Link
                key={label}
                to={to}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-all duration-150 group"
              >
                <span>{label}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-zinc-700 group-hover:text-brand-500 transition-colors duration-150" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default Dashboard
