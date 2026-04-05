import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Analytics from './pages/Analytics'
import Reports from './pages/Reports'
import useStore from './store/useStore'

const pages = {
  dashboard:    Dashboard,
  transactions: Transactions,
  analytics:    Analytics,
  reports:      Reports,
}

export default function App() {
  const [activePage, setActivePage]   = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const theme             = useStore((s) => s.theme)
  const loading           = useStore((s) => s.loading)
  const error             = useStore((s) => s.error)
  const fetchTransactions = useStore((s) => s.fetchTransactions)
  const transactions      = useStore((s) => s.transactions)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    if (transactions.length === 0) fetchTransactions()
  }, [])

  const Page = pages[activePage] || Dashboard

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors duration-300">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header activePage={activePage} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {loading && transactions.length === 0 ? (
            <LoadingSkeleton />
          ) : error && transactions.length === 0 ? (
            <ErrorState message={error} onRetry={fetchTransactions} />
          ) : (
            <Page />
          )}
        </main>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  const shimmer = 'bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50'
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={`${shimmer} p-5 h-28`}>
            <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
            <div className="h-7 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
            <div className="h-2 w-20 bg-slate-100 dark:bg-slate-700/50 rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className={`lg:col-span-3 ${shimmer} h-72`} />
        <div className={`lg:col-span-2 ${shimmer} h-72`} />
      </div>
      <div className={`${shimmer} h-64`} />
    </div>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
      <div className="w-14 h-14 bg-rose-50 dark:bg-rose-900/30 rounded-full flex items-center justify-center text-2xl">
        ⚠️
      </div>
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Failed to load data</p>
      <p className="text-xs text-slate-400 max-w-xs">{message}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm rounded-xl transition-colors"
      >
        Retry
      </button>
    </div>
  )
}
