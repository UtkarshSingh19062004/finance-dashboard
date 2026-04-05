import { http, HttpResponse, delay } from 'msw'
import { transactions as seedData } from '../data/transactions'

const STORAGE_KEY = 'mock_db_transactions'
const DELAY = 500

function load() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {
    // corrupted storage — fall through to seed
  }
  const initial = seedData.map(t => ({ ...t }))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
  return initial
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// Hydrate from localStorage on worker boot, not on every request
let db = load()

export const handlers = [
  http.get('/api/transactions', async ({ request }) => {
    await delay(DELAY)
    const url      = new URL(request.url)
    const search   = url.searchParams.get('search')?.toLowerCase() || ''
    const category = url.searchParams.get('category') || 'All'
    const type     = url.searchParams.get('type') || 'All'

    const data = db.filter(t => {
      const matchSearch   = !search || t.description.toLowerCase().includes(search) || t.category.toLowerCase().includes(search)
      const matchCategory = category === 'All' || t.category === category
      const matchType     = type === 'All' || t.type === type
      return matchSearch && matchCategory && matchType
    })

    return HttpResponse.json({ data, total: db.length })
  }),

  http.post('/api/transactions', async ({ request }) => {
    await delay(DELAY)
    const body  = await request.json()
    const newTx = { ...body, id: Date.now() }
    db = [newTx, ...db]
    save(db)
    return HttpResponse.json({ data: newTx }, { status: 201 })
  }),

  http.patch('/api/transactions/:id', async ({ params, request }) => {
    await delay(DELAY)
    const body  = await request.json()
    const index = db.findIndex(t => String(t.id) === params.id)
    if (index === -1) return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    db[index] = { ...db[index], ...body }
    save(db)
    return HttpResponse.json({ data: db[index] })
  }),

  http.delete('/api/transactions/:id', async ({ params }) => {
    await delay(DELAY)
    const exists = db.some(t => String(t.id) === params.id)
    if (!exists) return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    db = db.filter(t => String(t.id) !== params.id)
    save(db)
    return new HttpResponse(null, { status: 204 })
  }),
]
