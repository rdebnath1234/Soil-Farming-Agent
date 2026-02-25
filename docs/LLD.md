# Soil Farming Agent - LLD

## 1. Problem Mapping
The system supports agriculture users by providing:
- Soil information and suitable crop guidance
- Seed/crop distributor information
- Admin-governed content updates

## 2. High-Level Architecture
- React SPA frontend calls NestJS REST API over HTTP
- NestJS API handles auth, role checks, business logic, logging
- Firebase Firestore stores users, soil details, distributor details, and activity logs

## 3. Backend Modules
- `auth`: register/login + JWT token issuance
- `users`: user persistence and default admin seed
- `soils`: CRUD for soil details
- `distributors`: CRUD for distributor details
- `activity-logs`: stores action-level logs and admin log view
- `common`: request logger middleware, guards, decorators

## 4. Data Models
1. User
- `name`, `email`, `password(hash)`, `role(admin|user)`, timestamps

2. Soil
- `soilType`, `phRange`, `suitableCrops`, `nutrients`, `irrigationTips`, `postedBy`, timestamps

3. Distributor
- `name`, `contactPerson`, `phone`, `email`, `address`, `seedsAvailable`, `postedBy`, timestamps

4. ActivityLog
- `action`, `actorEmail`, `actorRole`, `message`, timestamps

## 5. Security Design
- JWT bearer token auth
- Role-based access control via `@Roles()` and `RolesGuard`
- Password hashing with bcrypt
- Validation pipes with whitelist and non-whitelist rejection

## 6. Logging Design
- Middleware logs each HTTP request/response status and duration
- Activity logs persist business actions: register/login/create/update/delete

## 7. Frontend Flow
- Public routes: Login, Register
- Protected route: Dashboard
- Dashboard behavior:
  - user: read soil/distributor lists with search + pagination
  - admin: read + create + edit + delete + logs

## 8. Scalability and Maintainability
- Modular NestJS feature folders
- Separation of concerns across controller/service/schema layers
- DTO validation for safe API contracts
- Role guards avoid duplicated authorization checks
