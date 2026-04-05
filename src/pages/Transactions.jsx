import { useState, useMemo } from 'react'
import {
  Search, ChevronDown, ArrowUp, ArrowDown,
  Plus, Pencil, Trash2, ArrowUpCircle, ArrowDownCircle,
  X, Check, SlidersHorizontal, Download,
} from 'lucide-react'
import useStore from '../store/useStore'
import { categories } from '../data/transactions'

const fmt = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const CATEGORY_COLORS = {
  Salary:        'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Freelance:     'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  Rent:          'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  Groceries:     'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Entertainment: 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  Utilities:     'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Transport:     'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  Healthcare:    'bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
}

const emptyForm = { date: '', amount: '', category: categories[0], type: 'expense', description: '' }

// Builds a CSV blob from the current filtered rows and triggers a download
function exportCSV(rows) {
  const lines = [
    ['Date', 'Description', 'Category', 'Type', 'Amount'].join(','),
    ...rows.map(t => [
      t.date,
      `"${t.description.replace(/"/g, '""')}"`,
      t.category,
      t.type,
      t.type === 'income' ? t.amount : -t.amount,
    ].join(',')),
  ]
  const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' }))
  Object.assign(document.createElement('a'), {
    href: url,
    download: `transactions-${new Date().toISOString().slice(0, 10)}.csv`,
  }).click()
  URL.revokeObjectURL(url)
}

function Select({ value, onChange, children, className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full appearance-none pl-3 pr-8 py-2 text-sm cursor-pointer border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-colors"
      >
        {children}
      </select>
      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  )
}

function TransactionModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial)
  const patch = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const isEdit = !!initial.id

  const inputCls = 'w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-colors'

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ ...form, amount: parseFloat(form.amount) })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg animate-scale-in border border-slate-100 dark:border-slate-700">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {isEdit ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">Description</label>
            <input type="text" required value={form.description} onChange={e => patch('description', e.target.value)} placeholder="e.g. Monthly grocery run" className={inputCls} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">Date</label>
            <input type="date" required value={form.date} onChange={e => patch('date', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">Amount ($)</label>
            <input type="number" min="0.01" step="0.01" required value={form.amount} onChange={e => patch('amount', e.target.value)} placeholder="0.00" className={inputCls} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">Category</label>
            <Select value={form.category} onChange={v => patch('category', v)}>
              {categories.map(c => <option key={c}>{c}</option>)}
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">Type</label>
            <Select value={form.type} onChange={v => patch('type', v)}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </Select>
          </div>
          <div className="col-span-2 flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex items-center gap-2 px-4 py-2 text-sm bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors font-medium">
              <Check size={14} />
              {isEdit ? 'Save Changes' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteConfirm({ tx, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-scale-in border border-slate-100 dark:border-slate-700">
        <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 size={20} className="text-rose-500" />
        </div>
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">Delete Transaction?</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">"{tx.description}" will be permanently removed.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2 text-sm bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors font-medium">
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

function Th({ children, right }) {
  return (
    <th className={`px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide ${right ? 'text-right' : 'text-left'}`}>
      {children}
    </th>
  )
}

function Chip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-xs">
      {label}
      <button onClick={onRemove} className="hover:text-rose-500 transition-colors"><X size={10} /></button>
    </span>
  )
}

export default function Transactions() {
  const role              = useStore(s => s.role)
  const transactions      = useStore(s => s.transactions)
  const filters           = useStore(s => s.filters)
  const setFilter         = useStore(s => s.setFilter)
  const addTransaction    = useStore(s => s.addTransaction)
  const updateTransaction = useStore(s => s.updateTransaction)
  const deleteTransaction = useStore(s => s.deleteTransaction)

  const [sortDir, setSortDir]           = useState('desc')
  const [addOpen, setAddOpen]           = useState(false)
  const [editTarget, setEditTarget]     = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filtered = useMemo(() => {
    const { search, category, type } = filters
    return transactions
      .filter(t => {
        const s = search.toLowerCase()
        return (!s || t.description.toLowerCase().includes(s) || t.category.toLowerCase().includes(s))
          && (category === 'All' || t.category === category)
          && (type === 'All' || t.type === type)
      })
      .sort((a, b) => sortDir === 'desc' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date))
  }, [transactions, filters, sortDir])

  const income  = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  const hasFilters  = filters.search || filters.category !== 'All' || filters.type !== 'All'
  const clearFilters = () => { setFilter('search', ''); setFilter('category', 'All'); setFilter('type', 'All') }

  const card = 'bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50 shadow-sm transition-colors duration-300'

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between animate-fade-up">
          <div>
            <h1 className="text-base font-semibold text-slate-800 dark:text-slate-100">All Transactions</h1>
            <p className="text-xs text-slate-400 mt-0.5">{transactions.length} total records</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportCSV(filtered)}
              disabled={filtered.length === 0}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="Export filtered data as CSV"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            {role === 'admin' && (
              <button
                onClick={() => setAddOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-colors shadow-sm shadow-emerald-200/50"
              >
                <Plus size={15} />
                Add Transaction
              </button>
            )}
          </div>
        </div>

        <div className={`rounded-2xl p-4 animate-fade-up-1 ${card}`}>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by description or category…"
                value={filters.search}
                onChange={e => setFilter('search', e.target.value)}
                className="w-full pl-8 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-colors"
              />
              {filters.search && (
                <button onClick={() => setFilter('search', '')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={13} />
                </button>
              )}
            </div>
            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              <Select value={filters.category} onChange={v => setFilter('category', v)} className="min-w-[140px]">
                <option value="All">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
              <Select value={filters.type} onChange={v => setFilter('type', v)} className="min-w-[120px]">
                <option value="All">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </Select>
              <button
                onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
                className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
              >
                {sortDir === 'desc'
                  ? <><ArrowDown size={13} className="text-emerald-500" /> Newest</>
                  : <><ArrowUp size={13} className="text-emerald-500" /> Oldest</>}
              </button>
            </div>
          </div>

          {hasFilters && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <SlidersHorizontal size={12} className="text-slate-400" />
              <span className="text-xs text-slate-400">Active filters:</span>
              {filters.search   && <Chip label={`"${filters.search}"`} onRemove={() => setFilter('search', '')} />}
              {filters.category !== 'All' && <Chip label={filters.category} onRemove={() => setFilter('category', 'All')} />}
              {filters.type     !== 'All' && <Chip label={filters.type}     onRemove={() => setFilter('type', 'All')} />}
              <button onClick={clearFilters} className="text-xs text-rose-500 hover:underline ml-1">Clear all</button>
            </div>
          )}
        </div>

        <div className={`rounded-2xl overflow-hidden animate-fade-up-2 ${card}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/40 border-b border-slate-100 dark:border-slate-700/50">
                  <Th>Date</Th>
                  <Th>Description</Th>
                  <Th>Category</Th>
                  <Th>Type</Th>
                  <Th right>Amount</Th>
                  {role === 'admin' && <Th right>Actions</Th>}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={role === 'admin' ? 6 : 5}>
                      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                        <svg width="120" height="96" viewBox="0 0 120 96" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-6 opacity-70">
                          <circle cx="60" cy="52" r="40" fill="currentColor" className="text-slate-100 dark:text-slate-700" />
                          <rect x="36" y="24" width="48" height="60" rx="6" fill="white" className="dark:fill-slate-800" stroke="currentColor" strokeWidth="1.5" style={{ color: '#e2e8f0' }} />
                          <rect x="44" y="36" width="32" height="3" rx="1.5" fill="currentColor" style={{ color: '#e2e8f0' }} />
                          <rect x="44" y="44" width="24" height="3" rx="1.5" fill="currentColor" style={{ color: '#e2e8f0' }} />
                          <rect x="44" y="52" width="28" height="3" rx="1.5" fill="currentColor" style={{ color: '#e2e8f0' }} />
                          <rect x="44" y="60" width="20" height="3" rx="1.5" fill="currentColor" style={{ color: '#e2e8f0' }} />
                          <circle cx="80" cy="72" r="14" fill="white" className="dark:fill-slate-800" stroke="#cbd5e1" strokeWidth="2" />
                          <circle cx="80" cy="72" r="8" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />
                          <line x1="86" y1="78" x2="94" y2="86" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
                          <line x1="77" y1="69" x2="83" y2="75" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
                          <line x1="83" y1="69" x2="77" y2="75" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <p className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-1">No transactions found</p>
                        <p className="text-sm text-slate-400 max-w-xs mb-6">No results match your current filters.</p>
                        {hasFilters && (
                          <div className="flex flex-wrap justify-center gap-2 mb-6">
                            {filters.search      && <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-xs font-medium"><Search size={10} /> "{filters.search}"</span>}
                            {filters.category !== 'All' && <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-xs font-medium">Category: {filters.category}</span>}
                            {filters.type     !== 'All' && <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-xs font-medium capitalize">Type: {filters.type}</span>}
                          </div>
                        )}
                        <button onClick={clearFilters} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-colors shadow-sm shadow-emerald-200/50">
                          <X size={14} /> Clear all filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : filtered.map((t) => (
                  <tr key={t.id} className="border-b border-slate-50 dark:border-slate-700/30 hover:bg-slate-50/70 dark:hover:bg-slate-700/20 transition-colors group">
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 whitespace-nowrap text-xs tabular-nums">
                      {new Date(t.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 dark:text-slate-200 font-medium max-w-[220px]">
                      <span className="truncate block">{t.description}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[t.category] || 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                        {t.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${t.type === 'income' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                        {t.type === 'income' ? <ArrowUpCircle size={11} /> : <ArrowDownCircle size={11} />}
                        <span className="capitalize">{t.type}</span>
                      </span>
                    </td>
                    <td className={`px-5 py-3.5 text-right font-semibold tabular-nums ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                      {t.type === 'income' ? '+' : '−'}{fmt(t.amount)}
                    </td>
                    {role === 'admin' && (
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setEditTarget(t)} title="Edit" className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => setDeleteTarget(t)} title="Delete" className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className="text-xs text-slate-400">
              Showing <span className="font-medium text-slate-600 dark:text-slate-300">{filtered.length}</span> of <span className="font-medium text-slate-600 dark:text-slate-300">{transactions.length}</span> transactions
            </p>
            {filtered.length > 0 && (
              <div className="flex items-center gap-4 text-xs">
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">+{fmt(income)} income</span>
                <span className="text-rose-500 dark:text-rose-400 font-medium">−{fmt(expense)} expenses</span>
                <span className={`font-semibold ${income - expense >= 0 ? 'text-slate-700 dark:text-slate-200' : 'text-rose-600 dark:text-rose-400'}`}>
                  Net: {income - expense >= 0 ? '+' : '−'}{fmt(Math.abs(income - expense))}
                </span>
              </div>
            )}
          </div>
        </div>

        {role === 'viewer' && (
          <p className="text-xs text-center text-slate-400">
            You're in Viewer mode. Switch to Admin to add, edit, or delete transactions.
          </p>
        )}
      </div>

      {addOpen       && <TransactionModal initial={emptyForm}  onSave={(d) => { addTransaction(d); setAddOpen(false) }}                    onClose={() => setAddOpen(false)} />}
      {editTarget    && <TransactionModal initial={editTarget} onSave={(d) => { updateTransaction(editTarget.id, d); setEditTarget(null) }} onClose={() => setEditTarget(null)} />}
      {deleteTarget  && <DeleteConfirm   tx={deleteTarget}    onConfirm={() => { deleteTransaction(deleteTarget.id); setDeleteTarget(null) }} onClose={() => setDeleteTarget(null)} />}
    </>
  )
}
