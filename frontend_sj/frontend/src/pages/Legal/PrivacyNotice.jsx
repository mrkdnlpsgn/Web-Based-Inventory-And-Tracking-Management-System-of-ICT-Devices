import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useTheme } from '../../context/ThemeContext'

const SECTIONS = [
  {
    title: '1. Who we are',
    body: 'This Data Privacy Notice covers the San Jose GSO Enterprise Asset Management System, operated by the General Services Office of the San Jose Municipal Hall, Batangas, for the purpose of tracking municipal government property.',
  },
  {
    title: '2. What information we collect',
    body: 'The system collects and stores: (a) user account information for staff who operate the system — username, full name, role, office assignment, and email address (used only for password-reset delivery); (b) asset records — descriptions, acquisition values, locations, and the names of accountable persons responsible for government property; (c) activity records — every asset registration, transfer, maintenance action, and disposal is logged with the acting user, timestamp, and a description of the action; (d) technical/audit data — IP address, timestamp, and action type for security-relevant events such as logins and record changes.',
  },
  {
    title: '3. Why we collect it',
    body: 'This processing is necessary to comply with the General Services Office\'s mandate to maintain accurate government property records, and with Commission on Audit (COA) requirements for the Report on the Physical Count of Property, Plant and Equipment (RPCPPE) and related accountability reports. Under Republic Act No. 10173 (the Data Privacy Act of 2012), this counts as processing for the fulfillment of a public authority\'s mandate, and you are entitled to be informed of it.',
  },
  {
    title: '4. Who can access it',
    body: 'Access is restricted to authorized GSO and ICT staff accounts, gated by role (Admin or Staff). Every account holder can see their own recorded activity via the Audit Logs module. Data is not shared with third parties except where required by law — for example, COA audits or a lawful government request.',
  },
  {
    title: '5. How long we keep it',
    body: 'Asset, maintenance, and disposal records are retained in accordance with COA rules on government property and accountability records, which generally require retention for the useful life of the asset plus the applicable audit/retention period afterward. Account activity logs are retained for as long as reasonably necessary for security and audit purposes.',
  },
  {
    title: '6. Your responsibilities as a system user',
    body: 'If you are a GSO or ICT staff member with an account: enter only accurate information; never share your login credentials with anyone else, since actions taken under your account are attributed to you; and report any suspected data breach, unauthorized access, or misuse to the ICT Division immediately.',
  },
  {
    title: '7. Your rights',
    body: 'As a data subject under RA 10173, you have the right to be informed, to access your own data, to request correction of inaccurate data, and to lodge a complaint with the National Privacy Commission. For any request regarding your personal data held in this system, contact the ICT Division of the San Jose Municipal Hall.',
  },
]

function PrivacyNotice() {
  const navigate = useNavigate()
  const { isDark, toggle } = useTheme()
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated)

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <div className="max-w-3xl mx-auto px-6 py-10 sm:py-14">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-10">
          <button
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 transition-colors duration-150"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back
          </button>
          <button
            onClick={toggle}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2.5 rounded-md text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all duration-150"
          >
            {isDark ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        </div>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <img src="/logo.jpg" alt="San Jose Municipal Hall seal" className="w-12 h-12 rounded-full object-cover ring-2 ring-brand-500/20 flex-shrink-0" />
          <div>
            <p className="text-2xs font-bold text-brand-500 uppercase tracking-[0.15em]">San Jose Municipal Hall · GSO</p>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Data Privacy Notice</h1>
          </div>
        </div>

        <p className="text-sm text-slate-500 dark:text-zinc-400 mb-10 leading-relaxed">
          This notice explains what personal data the San Jose GSO Enterprise Asset Management System collects,
          why, and what rights you have over it, in compliance with Republic Act No. 10173
          (the Data Privacy Act of 2012).
        </p>

        {/* Sections */}
        <div className="space-y-8">
          {SECTIONS.map((s) => (
            <section key={s.title}>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">{s.title}</h2>
              <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">{s.body}</p>
            </section>
          ))}
        </div>

        <p className="text-xs text-slate-400 dark:text-zinc-600 mt-12 pt-6 border-t border-slate-100 dark:border-zinc-800">
          Last updated {new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}.
          Questions about this notice or your data should be directed to the ICT Division, San Jose Municipal Hall.
        </p>
      </div>
    </div>
  )
}

export default PrivacyNotice
