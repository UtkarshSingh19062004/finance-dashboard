import { LayoutDashboard, ArrowLeftRight, PieChart, TrendingUp, X } from 'lucide-react'

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard',    id: 'dashboard' },
  { icon: ArrowLeftRight,  label: 'Transactions', id: 'transactions' },
  { icon: PieChart,        label: 'Analytics',    id: 'analytics' },
  { icon: TrendingUp,      label: 'Reports',      id: 'reports' },
]

export default function Sidebar({ activePage, setActivePage, isOpen, onClose }) {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={onClose} />
      )}

      <aside className={`fixed top-0 left-0 h-full w-64 z-30 flex flex-col bg-slate-900 dark:bg-slate-950 border-r border-slate-700/50 dark:border-slate-800 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700/60">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-emerald-400" size={22} />
            <span className="text-lg font-bold tracking-tight text-white">FinanceIQ</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(({ icon: Icon, label, id }) => (
            <button
              key={id}
              onClick={() => { setActivePage(id); onClose() }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                activePage === id
                  ? 'bg-emerald-500/20 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>

        <div className="px-6 py-4 border-t border-slate-700/60 text-xs text-slate-600">
          © 2026 FinanceIQ
        </div>
      </aside>
    </>
  )
}
