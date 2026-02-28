# Soil Farming Agent (React + NestJS + Firebase Firestore)

Full-stack agriculture web app built from the provided project statement with role-based modules:
- User registration/login
- Admin posting/editing/deleting soil details
- Admin posting/editing/deleting distributor details
- Users viewing soil details
- Users viewing distributor details
- Search/filter/pagination for both soil and distributor lists
- Admin inline edit UI for soil and distributor cards
- Action/request logging

## Tech Stack
- Frontend: React (Vite), React Router, Axios
- Backend: Node.js, NestJS, Firebase Admin SDK
- Database: Firebase Firestore

## Runtime Requirements
- Node.js: `>=22 <24`
- npm: lockfiles are generated with npm v10
- Docker: Docker Engine with Compose support

## Project Structure
- `/frontend` React client
- `/backend` NestJS API
- `/docs/LLD.md` architecture and low-level design

## Features
1. Authentication
- `POST /auth/register`
- `POST /auth/login`
- JWT-based authorization

2. Roles
- `admin`: create/update/delete soil and distributor entries, view logs
- `user`: view soil and distributor entries

3. Soil Module (API + UI)
- `GET /soils?search=&page=&limit=` (paginated + search)
- `POST /soils` (admin)
- `PATCH /soils/:id` (admin)
- `DELETE /soils/:id` (admin)
- Admin dashboard supports inline edit and delete actions

4. Distributor Module (API + UI)
- `GET /distributors?search=&page=&limit=` (paginated + search)
- `POST /distributors` (admin)
- `PATCH /distributors/:id` (admin)
- `DELETE /distributors/:id` (admin)
- Admin dashboard supports inline edit and delete actions

5. Search/Filter/Pagination
- Independent search and pagination for soil list and distributor list
- Query params:
  - `search`: case-insensitive text filter
  - `page`: page number (1-based)
  - `limit`: records per page
- List response shape:
  - `items`: array of records
  - `total`: total matching records
  - `page`: current page
  - `limit`: page size
  - `totalPages`: total pages

6. Logging
- HTTP request logging middleware
- Activity logging for register/login/create/update/delete operations
- `GET /logs` (admin)

7. Bengali AI (Phase 2 RAG)
- `POST /ai/knowledge-docs` (admin): ingest Bengali knowledge documents
- `GET /ai/knowledge-docs` (admin): list knowledge documents
- `POST /ai/ask` (authenticated): ask Bengali agriculture questions with retrieved context
- Retrieval:
  - semantic retrieval when OpenAI key is configured
  - keyword retrieval fallback when OpenAI key is not configured

8. Agmarknet (India Mandi Price) Data
- `GET /agmarknet/prices` (authenticated): fetch live mandi price rows from Agmarknet dataset
- `POST /agmarknet/sync` (admin): fetch + upsert rows into Firestore collection `agmarknetPrices`
- Query params:
  - `state`, `district`, `market`, `commodity`, `arrivalDate`
  - `limit` (1-100), `offset` (0-5000)
- Data source:
  - [Current Daily Price of Various Commodities from Various Markets (Mandi)](https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070)

9. Pincode-based Advisory
- `GET /advice?pincode=700001` (authenticated)
- Flow:
  - Validates pincode
  - Resolves pincode to state/district (India Post, cached 30 days)
  - Resolves coordinates (geocoding, cached 30 days)
  - Fetches soil properties from SoilGrids (cached 24h)
  - Applies crop rules and merges live mandi prices from Agmarknet
  - Saves result in Firestore collection `advisories`

## Local Setup
1. Backend
```bash
cd backend
npm install
npm run start:dev
```

2. Frontend
```bash
cd frontend
npm install
npm run dev
```

## Docker (One Command)
Run the entire stack (frontend + backend):
```bash
docker compose up --build
```

Services:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

Docker uses backend env from:
- `/Users/riyadebnathdas/Desktop/Projects/Soil Farming Agent/backend/.env`
Make sure Firebase variables are set there before running compose.

## Railway Deployment
Current live deployment:
- Frontend: `https://soil-farming-frontend-production.up.railway.app`
- Backend: `https://soil-farming-backend-production.up.railway.app`

Railway service layout:
- `soil-farming-backend`: deploys from `/backend`
- `soil-farming-frontend`: deploys from `/frontend`

Deploy the current Docker targets from this repo with Railway CLI:
```bash
railway up backend --path-as-root -p 67ec375c-e6f0-4ec5-be9b-81e384bb705a -e production -s soil-farming-backend
railway up frontend --path-as-root -p 67ec375c-e6f0-4ec5-be9b-81e384bb705a -e production -s soil-farming-frontend
```

Important Railway runtime notes:
- The frontend container listens on internal port `8080` in Railway.
- The frontend nginx proxy forwards `/api/*` to the Railway backend domain.
- Set backend `FRONTEND_ORIGIN=https://soil-farming-frontend-production.up.railway.app` for browser CORS.

## Environment Variables
Backend (`/backend/.env`):
- `PORT=3000`
- `JWT_SECRET=replace-with-strong-secret`
- `FRONTEND_ORIGIN=http://localhost:5173`
- `ADMIN_EMAIL=admin@soilfarming.com`
- `ADMIN_PASSWORD=admin123`
- `FIREBASE_PROJECT_ID=your-firebase-project-id`
- `FIREBASE_CLIENT_EMAIL=your-service-account-email@your-project.iam.gserviceaccount.com`
- `FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"`
- `OPENAI_API_KEY=` (optional, for better Bengali generation)
- `OPENAI_CHAT_MODEL=gpt-4o-mini` (optional)
- `OPENAI_EMBEDDING_MODEL=text-embedding-3-small` (optional)
- `AGMARKNET_API_KEY=579b464db66ec23bdd000001d9143fc81ac74bce7ad727abc2705a8a` (optional)
- `AGMARKNET_RESOURCE_ID=9ef84268-d588-465a-a308-a864a43d0070` (optional)
- `GEOCODER_USER_AGENT=SoilFarmingAgent/1.0 (support@local)` (optional)

Frontend (`/frontend/.env`):
- `VITE_API_URL=http://localhost:3000`

## Default Admin
If `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set in backend `.env`, the app auto-creates this admin user at backend startup (only if it does not already exist).

## Firebase Notes
- Create a Firebase project and enable Firestore in Native mode.
- Create a service account and use its credentials in backend environment variables.
- Keep the private key formatted with escaped newline characters (`\\n`) when passed via env.

## Bengali RAG Usage (Example)
1. Admin login and ingest knowledge docs:
```bash
curl -X POST http://localhost:3000/ai/knowledge-docs \\
  -H \"Authorization: Bearer <ADMIN_TOKEN>\" \\
  -H \"Content-Type: application/json\" \\
  -d '{
    \"documents\": [
      {
        \"title\": \"দোআঁশ মাটির বৈশিষ্ট্য\",
        \"content\": \"দোআঁশ মাটিতে পানি ধারণ ক্ষমতা ও নিষ্কাশন দুটোই ভালো।\",
        \"source\": \"local-agri-guide\",
        \"language\": \"bn\",
        \"tags\": [\"soil\", \"loam\", \"water\"]
      }
    ]
  }'
```

2. Ask Bengali question:
```bash
curl -X POST http://localhost:3000/ai/ask \\
  -H \"Authorization: Bearer <USER_TOKEN>\" \\
  -H \"Content-Type: application/json\" \\
  -d '{\"question\":\"দোআঁশ মাটিতে কোন ফসল ভালো হয়?\", \"answerLanguage\":\"bn\", \"topK\":4}'
```

## Agmarknet Usage (Example)
1. Fetch live mandi prices (any authenticated user):
```bash
curl \"http://localhost:3000/agmarknet/prices?state=West%20Bengal&commodity=Potato&limit=5\" \\
  -H \"Authorization: Bearer <USER_TOKEN>\"
```

2. Sync live rows into Firestore (admin only):
```bash
curl -X POST \"http://localhost:3000/agmarknet/sync?state=West%20Bengal&commodity=Potato&limit=20\" \\
  -H \"Authorization: Bearer <ADMIN_TOKEN>\"
```

## Pincode Advisory Usage (Example)
```bash
curl \"http://localhost:3000/advice?pincode=700001\" \\
  -H \"Authorization: Bearer <USER_TOKEN>\"
```

## Build Validation
- Backend: `npm run build`
- Frontend: `npm run build`
- Backend lint: `npm run lint`
- Frontend lint: `npm run lint`

## Feature Screenshots
### Public Pages
1. Landing
![Landing](docs/screenshots/01-landing.png)

2. Register
![Register](docs/screenshots/02-register.png)

3. Login
![Login](docs/screenshots/03-login.png)

### Dashboard & Core Modules
4. Dashboard Overview
![Dashboard Overview](docs/screenshots/04-dashboard-overview.png)

5. Pincode-based Soil + Mandi Advisory
![Pincode Advisory](docs/screenshots/05-pincode-advisory.png)

6. Live Mandi Price Table
![Live Mandi](docs/screenshots/06-mandi-live-table.png)

7. Soil Search + Pagination
![Soil Search Pagination](docs/screenshots/07-soil-search-pagination.png)

8. Distributor Search + Pagination
![Distributor Search Pagination](docs/screenshots/08-distributor-search-pagination.png)

9. Bengali AI Assistant Popup
![AI Popup](docs/screenshots/09-ai-popup-chat.png)

10. Activity Logs
![Activity Logs](docs/screenshots/10-activity-logs.png)

11. Full Dashboard
![Full Dashboard](docs/screenshots/11-dashboard-full.png)
