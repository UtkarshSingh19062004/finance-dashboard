import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '../api/transactions'

const useStore = create(
  persist(
    (set) => ({
      transactions: [],
      role:    'viewer',
      theme:   'light',
      filters: { search: '', category: 'All', type: 'All' },
      loading: false,
      error:   null,

      setRole:     (role)  => set({ role }),
      toggleTheme: ()      => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
      setFilter:   (key, value) => set((s) => ({ filters: { ...s.filters, [key]: value } })),

      fetchTransactions: async () => {
        set({ loading: true, error: null })
        try {
          const { data } = await api.getAll()
          set({ transactions: data, loading: false })
        } catch (err) {
          set({ error: err.message, loading: false })
        }
      },

      addTransaction: async (body) => {
        set({ loading: true, error: null })
        try {
          const { data } = await api.create(body)
          set((s) => ({ transactions: [data, ...s.transactions], loading: false }))
        } catch (err) {
          set({ error: err.message, loading: false })
        }
      },

      updateTransaction: async (id, patch) => {
        set({ loading: true, error: null })
        try {
          const { data } = await api.update(id, patch)
          set((s) => ({
            transactions: s.transactions.map((t) => (t.id === id ? data : t)),
            loading: false,
          }))
        } catch (err) {
          set({ error: err.message, loading: false })
        }
      },

      deleteTransaction: async (id) => {
        set({ loading: true, error: null })
        try {
          await api.remove(id)
          set((s) => ({
            transactions: s.transactions.filter((t) => t.id !== id),
            loading: false,
          }))
        } catch (err) {
          set({ error: err.message, loading: false })
        }
      },
    }),
    {
      name: 'finance-iq-store',
      // filters are intentionally excluded — reset on every session
      partialize: (s) => ({ role: s.role, theme: s.theme }),
    }
  )
)

export default useStore
