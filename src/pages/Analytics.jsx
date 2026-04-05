import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import useStore from '../store/useStore'

const COLORS = ['#10b981', '#f43f5e', '#6366f1', '#f59e0b', '#3b82f6', '#ec4899', '#14b8a6']
const fmt = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0 })

function ChartCard({ title, children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/50 shadow-sm transition-colors duration-300 ${className}`}>
      <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">{title}</h2>
      {children}
    </div>
  )
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-lg rounded-xl px-4 py-3 text-sm">
      {label && <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color || p.fill }} />
          <span className="text-slate-500 dark:text-slate-400 capitalize">{p.name}:</span>
          <span className="font-medium text-slate-800 dark:text-slate-100">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function Analytics() {
  const transactions = useStore(s => s.transactions)
  const isDark       = useStore(s => s.theme) === 'dark'

  const gridColor = isDark ? '#1e293b' : '#f1f5f9'
  const tickColor = isDark ? '#64748b' : '#94a3b8'

  const catMap = {}
  transactions.filter(t => t.type === 'expense').forEach(({ category, amount }) => {
    catMap[category] = (catMap[category] || 0) + amount
  })
  const catData = Object.entries(catMap).map(([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total)

  const monthMap = {}
  transactions.forEach(({ date, amount, type }) => {
    const m = date.slice(0, 7)
    if (!monthMap[m]) monthMap[m] = { month: m, net: 0 }
    monthMap[m].net += type === 'income' ? amount : -amount
  })
  const netData = Object.values(monthMap)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map(d => ({ ...d, month: new Date(d.month + '-01').toLocaleString('default', { month: 'short' }) }))

  const srcMap = {}
  transactions.filter(t => t.type === 'income').forEach(({ category, amount }) => {
    srcMap[category] = (srcMap[category] || 0) + amount
  })
  const srcData = Object.entries(srcMap).map(([name, value]) => ({ name, value }))

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Spending by Category" className="animate-fade-up">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={catData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} tickFormatter={fmt} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} width={90} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Income Sources" className="animate-fade-up-1">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={srcData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: tickColor }}>
                {srcData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Monthly Net Savings" className="animate-fade-up-2">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={netData}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: tickColor }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: tickColor }} axisLine={false} tickLine={false} tickFormatter={fmt} />
            <Tooltip content={<ChartTooltip />} />
            <Line type="monotone" dataKey="net" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 5, fill: '#6366f1', stroke: isDark ? '#1e293b' : '#fff', strokeWidth: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
