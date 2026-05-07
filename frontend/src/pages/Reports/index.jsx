import MainLayout from '../../components/layout/MainLayout'
import Button from '../../components/common/Button'

const reportTypes = [
  {
    title: 'Inventory Summary',
    description: 'Complete list of all ICT assets with status and location.',
    iconBg: 'bg-zinc-800',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-zinc-400" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    title: 'Device Status Report',
    description: 'Breakdown of devices by operational status.',
    iconBg: 'bg-emerald-950',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    title: 'Tracking History',
    description: 'Log of all device movements and activities.',
    iconBg: 'bg-orange-950',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    title: 'Asset Valuation',
    description: 'Financial summary of ICT asset acquisition values.',
    iconBg: 'bg-amber-950',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
      </svg>
    ),
  },
]

function Reports() {
  return (
    <MainLayout>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        {reportTypes.map(({ title, description, icon, iconBg }) => (
          <div
            key={title}
            className="bg-zinc-900 rounded-xl border border-zinc-800 p-5 flex items-start gap-4 hover:border-zinc-700 hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer"
          >
            <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-200">{title}</p>
              <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{description}</p>
              <button className="mt-3 text-xs font-semibold text-brand-500 hover:text-brand-400 flex items-center gap-1 transition-colors duration-150">
                Generate Report
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform duration-150" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <h2 className="text-sm font-semibold text-zinc-300 mb-1">Export Data</h2>
        <p className="text-xs text-zinc-500 mb-4">Download records in your preferred format.</p>
        <div className="flex gap-3 flex-wrap">
          <Button variant="secondary" size="md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Export as Excel
          </Button>
          <Button variant="secondary" size="md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Export as PDF
          </Button>
        </div>
      </div>
    </MainLayout>
  )
}

export default Reports
