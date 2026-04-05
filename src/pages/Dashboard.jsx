import { Wallet, TrendingDown, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import useStore from '../store/useStore'
import StatCard from '../components/StatCard'
import InsightsPanel from '../components/InsightsPanel'

const DONUT_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#3b82f6', '#ec4899', '#14b8a6']
const fmt = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const tooltipBase = 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-lg rounded-xl px-4 py-3 text-sm'

function LineTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className={tooltipBase}>
      <p className="font-semibold text-slate-700 dark:text-slate-200 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-500 dark:text-slate-400 capitalize">{p.dataKey}:</span>
          <span className="font-medium text-slate-800 dark:text-slate-100">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

function DonutTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  return (
    <div className={tooltipBase}>
      <p className="font-semibold text-slate-700 dark:text-slate-200">{name}</p>
      <p className="text-slate-500 dark:text-slate-400">{fmt(value)}</p>
    </div>
  )
}

function DonutLegend({ data, total }) {
  return (
    <div className="space-y-2 mt-4">
      {data.map(({ name, value }, i) => (
        <div key={name} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
          <span className="text-xs text-slate-600 dark:text-slate-400 flex-1 truncate">{name}</span>
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{((value / total) * 100).toFixed(1)}%</span>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const transactions = useStore((s) => s.transactions)
  const isDark       = useStore((s) => s.theme) === 'dark'

  const totalIncome  = transactions.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0)
  const balance      = totalIncome - totalExpense

  const monthlyMap = {}
  transactions.forEach(({ date, amount, type }) => {
    const key = date.slice(0, 7)
    if (!monthlyMap[key]) monthlyMap[key] = { key, income: 0, expense: 0 }
    monthlyMap[key][type] += amount
  })
  const lineData = Object.values(monthlyMap)
    .sort((a, b) => a.key.localeCompare(b.key))
    .map(d => ({
      month: new Date(d.key + '-01').toLocaleString('default', { month: 'short', year: '2-digit' }),
      income: d.income,
      expense: d.expense,
    }))

  const catMap = {}
  transactions.filter(t => t.type === 'expense').forEach(({ category, amount }) => {
    catMap[category] = (catMap[category] || 0) + amount
  })
  const donutData = Object.entries(catMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)

  const recent     = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)
  const gridColor  = isDark ? '#1e293b' : '#f1f5f9'
  const tickColor  = isDark ? '#64748b' : '#94a3b8'
  const dotBg      = isDark ? '#1e293b' : '#fff'
  const card       = 'bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm transition-colors duration-300'

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard index={0} title="Total Balance"  value={fmt(balance)}      icon={Wallet}       color="blue"    subtitle="Income minus expenses" trend={{ positive: balance >= 0, label: balance >= 0 ? 'Positive cashflow' : 'Negative cashflow' }} />
        <StatCard index={1} title="Total Income"   value={fmt(totalIncome)}  icon={TrendingUp}   color="emerald" subtitle="Last 3 months"         trend={{ positive: true, label: `${totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0}% saved` }} />
        <StatCard index={2} title="Total Expenses" value={fmt(totalExpense)} icon={TrendingDown} color="red"     subtitle="Last 3 months"         pct={totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className={`lg:col-span-3 p-5 animate-fade-up-1 ${card}`}>
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Income vs Expenses</h2>
              <p className="text-xs text-slate-400 mt-0.5">Monthly trend over the last 3 months</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-emerald-500 inline-block rounded" /> Income</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-rose-500 inline-block rounded" /> Expenses</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={lineData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} width={48} />
              <Tooltip content={<LineTooltip />} />
              <Line type="monotone" dataKey="income"  stroke="#10b981" strokeWidth={2.5} dot={{ r: 5, fill: '#10b981', strokeWidth: 2, stroke: dotBg }} activeDot={{ r: 7, stroke: '#10b981', strokeWidth: 2, fill: dotBg }} />
              <Line type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2.5} strokeDasharray="5 3" dot={{ r: 5, fill: '#f43f5e', strokeWidth: 2, stroke: dotBg }} activeDot={{ r: 7, stroke: '#f43f5e', strokeWidth: 2, fill: dotBg }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className={`lg:col-span-2 p-5 flex flex-col animate-fade-up-2 ${card}`}>
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Expenses by Category</h2>
          <p className="text-xs text-slate-400 mt-0.5 mb-1">Spending breakdown</p>
          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={donutData} cx="50%" cy="50%" innerRadius="52%" outerRadius="78%" paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                  {donutData.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} stroke="transparent" />)}
                </Pie>
                <Tooltip content={<DonutTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <DonutLegend data={donutData} total={totalExpense} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className={`xl:col-span-2 overflow-hidden animate-fade-up-3 ${card}`}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50 dark:border-slate-700/50">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Recent Transactions</h2>
            <span className="text-xs text-slate-400">{recent.length} of {transactions.length}</span>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-700/40">
            {recent.map((t) => (
              <div key={t.id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${t.type === 'income' ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'bg-rose-50 dark:bg-rose-900/30'}`}>
                  {t.type === 'income'
                    ? <ArrowUpRight size={16} className="text-emerald-600 dark:text-emerald-400" />
                    : <ArrowDownRight size={16} className="text-rose-500 dark:text-rose-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{t.description}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{t.category} · {t.date}</p>
                </div>
                <span className={`text-sm font-semibold shrink-0 ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                  {t.type === 'income' ? '+' : '−'}{fmt(t.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-1 animate-fade-up-4">
          <InsightsPanel />
        </div>
      </div>
    </div>
  )
}
