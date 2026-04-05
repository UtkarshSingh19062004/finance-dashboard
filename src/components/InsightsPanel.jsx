import { useMemo } from 'react'
import { Flame, TrendingUp, TrendingDown, Minus, AlertCircle, Trophy, Zap } from 'lucide-react'
import useStore from '../store/useStore'

const fmt = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function useInsights(transactions) {
  return useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense')
    if (!expenses.length) return null

    const months       = [...new Set(transactions.map(t => t.date.slice(0, 7)))].sort()
    const currentMonth = months[months.length - 1]
    const prevMonth    = months[months.length - 2]

    const currentExpenses = expenses.filter(t => t.date.startsWith(currentMonth))
    const prevExpenses    = expenses.filter(t => t.date.startsWith(prevMonth))

    const catTotals = {}
    currentExpenses.forEach(({ category, amount }) => {
      catTotals[category] = (catTotals[category] || 0) + amount
    })
    const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0]

    const currentTotal = currentExpenses.reduce((s, t) => s + t.amount, 0)
    const prevTotal    = prevExpenses.reduce((s, t) => s + t.amount, 0)
    const trendPct     = prevTotal > 0 ? ((currentTotal - prevTotal) / prevTotal) * 100 : null
    const trendUp      = trendPct !== null && trendPct > 0

    const largest = expenses.reduce((max, t) => t.amount > max.amount ? t : max, expenses[0])

    return {
      topCat,
      trendPct,
      trendUp,
      currentLabel: new Date(currentMonth + '-01').toLocaleString('default', { month: 'long' }),
      prevLabel:    prevMonth ? new Date(prevMonth + '-01').toLocaleString('default', { month: 'long' }) : null,
      largest,
    }
  }, [transactions])
}

function InsightCard({ icon: Icon, iconBg, iconColor, label, headline, sub, accent, delay = '' }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border p-4 shadow-sm bg-white dark:bg-slate-800/80 transition-colors duration-300 ${accent} ${delay}`}>
      <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-10 ${iconBg}`} />
      <div className="flex items-start gap-3">
        <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon size={17} className={iconColor} />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-0.5">{label}</p>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug">{headline}</p>
          {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>}
        </div>
      </div>
    </div>
  )
}

export default function InsightsPanel() {
  const transactions = useStore(s => s.transactions)
  const insights     = useInsights(transactions)

  if (!insights) {
    return (
      <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm p-5 flex items-center gap-3 text-slate-400">
        <AlertCircle size={18} />
        <p className="text-sm">Not enough data to generate insights yet.</p>
      </div>
    )
  }

  const { topCat, trendPct, trendUp, currentLabel, prevLabel, largest } = insights

  const cards = [
    topCat && {
      icon: Trophy,
      iconBg: 'bg-amber-50 dark:bg-amber-900/30', iconColor: 'text-amber-500',
      accent: 'border-amber-100 dark:border-amber-900/40',
      label: 'Highest Spending Category',
      headline: `You spent the most on ${topCat[0]} in ${currentLabel}`,
      sub: `${fmt(topCat[1])} total across all ${topCat[0].toLowerCase()} transactions`,
      delay: 'animate-fade-up',
    },
    trendPct !== null ? {
      icon: trendUp ? TrendingUp : trendPct === 0 ? Minus : TrendingDown,
      iconBg: trendUp ? 'bg-rose-50 dark:bg-rose-900/30' : 'bg-emerald-50 dark:bg-emerald-900/30',
      iconColor: trendUp ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400',
      accent: trendUp ? 'border-rose-100 dark:border-rose-900/40' : 'border-emerald-100 dark:border-emerald-900/40',
      label: 'Monthly Trend',
      headline: trendUp
        ? `Expenses up ${Math.abs(trendPct).toFixed(1)}% vs ${prevLabel}`
        : `Expenses down ${Math.abs(trendPct).toFixed(1)}% vs ${prevLabel}`,
      sub: trendUp ? 'Spending increased — keep an eye on it' : `Great job cutting back compared to ${prevLabel}`,
      delay: 'animate-fade-up-1',
    } : null,
    largest && {
      icon: Zap,
      iconBg: 'bg-violet-50 dark:bg-violet-900/30', iconColor: 'text-violet-500',
      accent: 'border-violet-100 dark:border-violet-900/40',
      label: 'Largest Single Expense',
      headline: `Your largest expense was ${fmt(largest.amount)} for ${largest.category}`,
      sub: `"${largest.description}" on ${new Date(largest.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
      delay: 'animate-fade-up-2',
    },
  ].filter(Boolean)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Flame size={15} className="text-orange-400" />
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Smart Insights</h2>
        <span className="ml-auto text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-700 dark:text-slate-400 px-2 py-0.5 rounded-full">
          Auto-calculated
        </span>
      </div>
      <div className="space-y-3">
        {cards.map((card, i) => <InsightCard key={i} {...card} />)}
      </div>
    </div>
  )
}
