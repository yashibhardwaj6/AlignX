# AlignX

AlignX is a full-stack Goal Setting & Performance Tracking Portal for organizations.

Tagline: **Align Goals. Track Progress. Drive Performance.**

## Stack

- Frontend: React, Tailwind CSS, React Router, Recharts
- Backend: FastAPI, SQLAlchemy ORM, JWT authentication, REST APIs
- Database: PostgreSQL via `docker-compose.yml`

## Demo Accounts

All demo users use password `AlignX@123`.

- `employee@alignx.com`
- `manager@alignx.com`
- `admin@alignx.com`

## Run Locally

1. Start PostgreSQL:

```bash
docker compose up -d
```

2. Backend:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

3. Frontend:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Included Modules

- Role-based dashboards for Employee, Manager, and Admin/HR
- JWT login, logout, protected routes, session persistence
- Goal creation, draft editing/deletion API support, submission, manager approval/rejection/return, locking, HR unlock
- Shared departmental goal API
- Quarterly check-ins with automatic progress calculations
- Admin cycle windows, audit logs, escalation monitoring
- Notifications center
- CSV and Excel reports
- Enterprise analytics with KPI cards, pie/bar/line/area charts
# AlignX
