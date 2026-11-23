# StockPilot – Inventory Manager (MERN)

Full-stack inventory manager: MongoDB + Express + React (Vite) + Tailwind CSS + Node. No login required.

## Features
- Dashboard: total products, inventory value, low-stock and out-of-stock counts, value by category, "needs attention" list
- Products table: search, category and status filters, sortable columns, pagination
- Add / edit products in a modal, delete with confirmation
- Quick +/- stock adjustment right in the table
- Automatic status badges (In stock / Low stock / Out of stock) based on each product's threshold
- Toast notifications, responsive layout with mobile sidebar

## Setup

### 1. Backend
```bash
cd server
npm install
cp .env.example .env   # edit MONGO_URI if needed
npm run seed           # optional: loads 15 sample products
npm run dev            # http://localhost:5000
```

### 2. Frontend
```bash
cd client
npm install
npm run dev            # http://localhost:5173
```

To change the currency, edit `CURRENCY` in `client/src/utils.js` (e.g. `'INR'`, `'EUR'`).

## API
| Method | Route | Description |
|---|---|---|
| GET | /api/products | List (`search`, `category`, `status`, `sort`, `order`, `page`, `limit`) |
| GET | /api/products/stats | Dashboard totals, category breakdown, low-stock items |
| GET | /api/products/categories | Distinct categories |
| POST | /api/products | Create |
| PUT | /api/products/:id | Update |
| PATCH | /api/products/:id/stock | Body `{ "delta": 1 }` to adjust quantity |
| DELETE | /api/products/:id | Delete |
