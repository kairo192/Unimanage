# UniManage AI — Project Map

## Architecture
- **Backend**: Express.js + pg (PostgreSQL pool) on port 5050
- **Frontend**: Vite + React on port 5173 (separate repository?)
- **AI**: OpenRouter API cascade with smart data-driven fallback

## Database (PostgreSQL — Supabase)
| Table | Domain | Key FK |
|---|---|---|
| `users` | Auth & staff | — |
| `students` | Student records | `room_id → rooms` |
| `rooms` | Residence rooms | — |
| `tickets` | Maintenance tickets | `student_id → students`, `room_id → rooms` |
| `maintenance_tickets` | Export-only ticket table | `room_id → rooms` |
| `catering_inventory` | Food stock | — |
| `catering_consumption` | Food usage log | `item_id → catering_inventory`, `used_by_user_id → users` |
| `housing_inventory` | Housing supplies | — |
| `housing_transfers` | Inventory dispatch log | `item_id → housing_inventory`, `transferred_by_user_id → users` |
| `it_services` | IT service locations | — |
| `it_devices` | IT equipment | `service_id → it_services` |
| `it_issues` | IT incident reports | `device_id → it_devices` |
| `activity_logs` | Audit trail | `user_id → users` |
| `user_sessions` | Login session tracking | `user_id → users` |

## Backend Structure (`src/`)
```
src/
  app.js                  — Express setup, middleware, routes
  server.js               — Entry point, DB init, table creation
  config/
    db.js                 — pg Pool connection
  middlewares/
    authMiddleware.js     — JWT protect + isDirector guards
  routes/
    authRoutes.js         — /api/auth/*
    ticketRoutes.js       — /api/tickets/*
    dashboardRoutes.js    — /api/dashboard/*
    excelRoutes.js        — /api/excel/*
    aiRoutes.js           — /api/ai/*
    studentsRoutes.js     — /api/students/*
    cateringRoutes.js     — /api/catering/*
    housingRoutes.js      — /api/housing/*
    itRoutes.js           — /api/it/*
  controllers/
    authController.js     — Login, register, user CRUD, sessions
    ticketController.js   — Ticket CRUD
    dashboardController.js— Overview, alerts, room CRUD
    excelController.js    — Import/export Excel
    aiController.js       — AI insights + monthly report
    studentsController.js — Student CRUD + smart assign
    cateringController.js — Inventory + consumption
    housingController.js  — Inventory + transfers
    itController.js       — Services, devices, issues, topology
  models/
    userModel.js          — User DB queries
    ticketModel.js        — Ticket DB queries
  utils/
    activityLogger.js     — Audit log helper
    sessionHelper.js      — User-agent parse + IP geolocation
    dataAggregator.js     — Cross-module stats fetcher (all 14 tables) for AI + reports
```

## AI Pipeline
### Endpoints
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/ai/insights` | Full multi-module analysis (residence, maintenance, catering, housing, IT, admin) |
| GET | `/api/ai/monthly-report` | Formal monthly report covering all departments |
| GET | `/api/ai/insights/:module` | Deep-dive into a single module (residence, maintenance, catering, housing, it, activity) |
| POST | `/api/ai/query` | Natural-language question answering against live data |
| POST | `/api/ai/snapshot` | Store a manual stats snapshot for trend analysis |
| GET | `/api/ai/compare` | Compare current stats vs previous snapshot |
| GET | `/api/ai/compare/modules?a=X&b=Y` | Cross-module comparison & correlation |

### DB Table
- `stats_snapshots` — JSONB snapshots of full stats, keyed by `snapshot_date`

### Flow
1. Fetch live data via `dataAggregator.getFullStats()` or `getModuleStats(module)`
2. Build structured prompt with real numbers from all 14 tables
3. Cascade through models (configured → free)
4. On total failure → smart data-driven fallback

## Key Dependencies
- express, cors, helmet, morgan, express-rate-limit
- pg (PostgreSQL), bcryptjs, jsonwebtoken
- multer, zod
- exceljs (Excel import/export)
- node-vibrant (unused — dead dependency)
