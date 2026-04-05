# Finance Dashboard — Zorvyn Frontend Assignment

A finance dashboard built as part of the Zorvyn frontend internship assignment. It covers data visualization, role based UI, filtered transactions, and a mock API layer with realistic network behavior.

---

## Tech Stack

| Tool | Purpose |
|---|---|
| React 18 + Vite | UI and build tooling |
| Tailwind CSS | Styling and dark mode |
| Recharts | Charts (line, donut, bar) |
| Zustand | Global state management |
| Lucide React | Icons |
| MSW (Mock Service Worker) | Intercepting fetch requests to simulate a backend(Mock API integration) |

---

## Setup

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`. MSW starts automatically in development — you will see `[MSW] Mocking enabled` in the browser console confirming the worker is active.

To reset the mock database back to seed data:

```js
// Run in browser console, then refresh
localStorage.removeItem('mock_db_transactions')
```

---

## Features

- **Summary cards** — Total Balance, Income, and Expenses calculated live from state, with a savings rate indicator and expense progress bar
- **Charts** — Line chart (monthly income vs expenses), donut chart (spending by category), bar chart, and net savings line chart across the Analytics page
- **Transactions table** — Filterable by search, category, and type; sortable by date; paginated footer with live net totals
- **Smart Insights** — Three auto-calculated text insights: highest spending category, month-over-month expense trend, and largest single expense
- **Role-based UI** — Viewer and Admin roles with different UI capabilities (see below)
- **Dark mode** — Full dark/light toggle, persisted across sessions
- **Export CSV** — Downloads the currently filtered table as a `.csv` file
- **Empty state** — Illustrated empty state with active filter chips and a clear-all action

---

## Approach

### State Management — Zustand

Zustand was the right call here over something like Redux. The state shape is simple: transactions, role, theme, filters, and async status. Zustand handles all of that in one file without actions, reducers, or a provider tree. The `persist` middleware handles localStorage sync for role and theme automatically.

Filters are intentionally excluded from persistence — they reset on every session, which is the expected behavior for a filter bar.

### Role-Based UI (RBAC)

There's no routing or auth involved. The `role` value (`'viewer'` or `'admin'`) lives in global state and is toggled from the header dropdown. Components read it directly from the store:

- **Viewer** — read-only table, no action buttons
- **Admin** — Add Transaction button appears, Edit/Delete icons show on row hover, modals are accessible

Switching roles is instant because it's just a state update — the UI reacts accordingly.

### Mock API — MSW + localStorage

MSW registers a service worker that intercepts `fetch` calls at the browser level before they hit the network. The app's API client (`src/api/transactions.js`) makes real `fetch` calls to `/api/transactions` — it has no knowledge of MSW. This means swapping in a real backend later requires zero changes to the app code.

Each handler has a 500ms artificial delay to make loading states visible (skeleton loaders on initial fetch, spinner feedback on mutations).

The mock database is initialized from `src/data/transactions.js` on first load, then written to `localStorage` under the key `mock_db_transactions`. Every POST, PATCH, and DELETE syncs the in-memory array back to storage immediately after mutation. This means added, edited, or deleted transactions survive a hard refresh — the worker re-hydrates from storage on boot rather than re-seeding from the static file.

MSW is dev-only. The `prepare()` call in `main.jsx` is gated behind `import.meta.env.DEV`, so the worker and its dependencies are never included in a production build.

---

## Project Structure

```
src/
├── api/
│   └── transactions.js     # fetch wrapper (getAll, create, update, remove)
├── mocks/
│   ├── browser.js          # registers the MSW service worker
│   └── handlers.js         # mock REST endpoints with localStorage persistence
├── store/
│   └── useStore.js         # Zustand store (transactions, role, theme, filters)
├── components/
│   ├── Header.jsx          # dark mode toggle + role switcher
│   ├── Sidebar.jsx         # navigation
│   ├── StatCard.jsx        # reusable KPI card with stagger animation
│   └── InsightsPanel.jsx   # auto-calculated text insights
└── pages/
    ├── Dashboard.jsx       # summary cards, charts, recent transactions
    ├── Transactions.jsx    # full table with filters, RBAC, CSV export
    ├── Analytics.jsx       # spending breakdown charts
    └── Reports.jsx         # monthly breakdown table + category progress bars
```
