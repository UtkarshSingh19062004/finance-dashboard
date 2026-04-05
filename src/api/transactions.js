const BASE = '/api/transactions'

async function request(url, options = {}) {
  const res  = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options })
  if (res.status === 204) return null
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || `Request failed: ${res.status}`)
  return json
}

export const api = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.search)                          params.set('search',   filters.search)
    if (filters.category && filters.category !== 'All') params.set('category', filters.category)
    if (filters.type     && filters.type     !== 'All') params.set('type',     filters.type)
    const qs = params.toString()
    return request(`${BASE}${qs ? `?${qs}` : ''}`)
  },
  create: (body)       => request(BASE,           { method: 'POST',  body: JSON.stringify(body) }),
  update: (id, patch)  => request(`${BASE}/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  remove: (id)         => request(`${BASE}/${id}`, { method: 'DELETE' }),
}
