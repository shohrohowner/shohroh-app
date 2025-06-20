# Shohroh Backend

## Admin Authentication & Management

- Admins are stored in `admins.json` (auto-created on first run).
- Initial admin:
  - **Username:** saycoko
  - **Password:** R6r25ey38t_
- Admins can log in, add, and delete other admins (except themselves).

## Setup

1. Install dependencies:
   ```sh
   npm install express cors body-parser bcryptjs jsonwebtoken
   ```
2. Start the backend:
   ```sh
   node index.js
   ```
3. The server runs on port 4000 by default.

## API Endpoints

- `POST /api/admin/login` — Login as admin (body: `{ username, password }`)
- `POST /api/admin` — Add new admin (admin only, header: `Authorization: Bearer <token>`, body: `{ username, password }`)
- `DELETE /api/admin/:username` — Delete admin (admin only, cannot delete self)

## Notes
- Passwords are hashed for security.
- All admin routes require a valid JWT token in the `Authorization` header. 