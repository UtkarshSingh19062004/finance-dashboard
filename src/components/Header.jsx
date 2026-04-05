import { useState, useRef, useEffect } from 'react'
import { Menu, Bell, ChevronDown, ShieldCheck, Eye, Sun, Moon } from 'lucide-react'
import useStore from '../store/useStore'

export default function Header({ onMenuClick, activePage }) {
  const role        = useStore((s) => s.role)
  const setRole     = useStore((s) => s.setRole)
  const theme       = useStore((s) => s.theme)
  const toggleTheme = useStore((s) => s.toggleTheme)

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700/60 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10 transition-colors duration-300">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          {activePage.charAt(0).toUpperCase() + activePage.slice(1)}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          className="relative p-2 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
        >
          <Sun size={18} className={`absolute inset-0 m-auto transition-all duration-300 ${theme === 'dark' ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}`} />
          <Moon size={18} className={`transition-all duration-300 ${theme === 'dark' ? 'opacity-0 -rotate-90' : 'opacity-100 rotate-0'}`} />
        </button>

        <button className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
        </button>

        <div className="relative" ref={ref}>
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              role === 'admin'
                ? 'bg-violet-50 dark:bg-violet-900/30 border-violet-200 dark:border-violet-700 text-violet-700 dark:text-violet-300'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            {role === 'admin' ? <ShieldCheck size={15} /> : <Eye size={15} />}
            <span className="capitalize">{role}</span>
            <ChevronDown size={14} className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg dark:shadow-slate-900/50 overflow-hidden z-50 animate-scale-in">
              {['viewer', 'admin'].map((r) => (
                <button
                  key={r}
                  onClick={() => { setRole(r); setDropdownOpen(false) }}
                  className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ${
                    role === r
                      ? 'bg-slate-50 dark:bg-slate-700/50 font-medium text-slate-800 dark:text-slate-100'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/40'
                  }`}
                >
                  {r === 'admin'
                    ? <ShieldCheck size={14} className="text-violet-500" />
                    : <Eye size={14} className="text-slate-400" />}
                  <span className="capitalize">{r}</span>
                  {role === r && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
