import { TrendingUp, TrendingDown } from 'lucide-react'

const palette = {
  emerald: { icon: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', bar: 'bg-emerald-500', ring: 'ring-emerald-100 dark:ring-emerald-900/40' },
  red:     { icon: 'bg-rose-50 text-rose-500 dark:bg-rose-900/30 dark:text-rose-400',             bar: 'bg-rose-500',    ring: 'ring-rose-100 dark:ring-rose-900/40' },
  blue:    { icon: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',             bar: 'bg-blue-500',    ring: 'ring-blue-100 dark:ring-blue-900/40' },
  violet:  { icon: 'bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',     bar: 'bg-violet-500',  ring: 'ring-violet-100 dark:ring-violet-900/40' },
}

// CSS-only stagger — index maps to a pre-defined animation delay class
const stagger = ['animate-fade-up', 'animate-fade-up-1', 'animate-fade-up-2', 'animate-fade-up-3']

export default function StatCard({ title, value, icon: Icon, color = 'blue', trend, subtitle, pct, index = 0 }) {
  const c = palette[color] || palette.blue

  return (
    <div className={`bg-white dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/50 shadow-sm ring-1 ${c.ring} flex flex-col gap-3 transition-colors duration-300 ${stagger[index] ?? stagger[0]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1 leading-none">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-2.5 rounded-xl ${c.icon}`}>
          <Icon size={20} />
        </div>
      </div>

      {pct !== undefined && (
        <div>
          <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ${c.bar}`} style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{pct.toFixed(1)}% of income</p>
        </div>
      )}

      {trend && (
        <div className={`flex items-center gap-1 text-xs font-medium w-fit px-2 py-0.5 rounded-full ${
          trend.positive
            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
            : 'bg-rose-50 text-rose-500 dark:bg-rose-900/30 dark:text-rose-400'
        }`}>
          {trend.positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {trend.label}
        </div>
      )}
    </div>
  )
}
