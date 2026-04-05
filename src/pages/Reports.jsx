import useStore from '../store/useStore'

const fmt = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const card = 'bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm transition-colors duration-300'

export default function Reports() {
  const transactions = useStore(s => s.transactions)
  const role         = useStore(s => s.role)

  const totalIncome  = transactions.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0)
  const savingsRate  = totalIncome > 0 ? (((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1) : 0

  const monthMap = {}
  transactions.forEach(({ date, amount, type }) => {
    const m = date.slice(0, 7)
    if (!monthMap[m]) monthMap[m] = { month: m, income: 0, expense: 0 }
    monthMap[m][type] += amount
  })
  const months = Object.values(monthMap).sort((a, b) => b.month.localeCompare(a.month))

  const catMap = {}
  transactions.filter(t => t.type === 'expense').forEach(({ category, amount }) => {
    catMap[category] = (catMap[category] || 0) + amount
  })
  const topCats = Object.entries(catMap).sort((a, b) => b[1] - a[1])

  return (
    <div className="space-y-4">
      <div className={`p-6 animate-fade-up ${card}`}>
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Financial Summary (Last 3 Months)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { label: 'Total Income',   value: fmt(totalIncome),  cls: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Total Expenses', value: fmt(totalExpense), cls: 'text-rose-500 dark:text-rose-400' },
            { label: 'Savings Rate',   value: `${savingsRate}%`, cls: 'text-violet-600 dark:text-violet-400' },
          ].map(({ label, value, cls }) => (
            <div key={label}>
              <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
              <p className={`text-xl font-bold mt-1 ${cls}`}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={`p-5 animate-fade-up-1 ${card}`}>
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Monthly Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700/50">
                {['Month', 'Income', 'Expenses', 'Net'].map((h, i) => (
                  <th key={h} className={`py-2 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase ${i === 0 ? 'text-left' : 'text-right'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {months.map(({ month, income, expense }) => {
                const net = income - expense
                return (
                  <tr key={month} className="border-b border-slate-50 dark:border-slate-700/30 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-200 font-medium">
                      {new Date(month + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-600 dark:text-emerald-400 font-medium">{fmt(income)}</td>
                    <td className="py-3 px-4 text-right text-rose-500 dark:text-rose-400 font-medium">{fmt(expense)}</td>
                    <td className={`py-3 px-4 text-right font-semibold ${net >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                      {net >= 0 ? '+' : ''}{fmt(net)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className={`p-5 animate-fade-up-2 ${card}`}>
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Top Expense Categories</h2>
        <div className="space-y-3">
          {topCats.map(([cat, amount]) => {
            const pct = ((amount / totalExpense) * 100).toFixed(1)
            return (
              <div key={cat}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600 dark:text-slate-300">{cat}</span>
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {fmt(amount)} <span className="text-slate-400 text-xs">({pct}%)</span>
                  </span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {role === 'viewer' && (
        <p className="text-xs text-slate-400 text-center">Switch to Admin role to export or edit reports.</p>
      )}
    </div>
  )
}
