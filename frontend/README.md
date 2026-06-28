# Apex Frontend

React frontend for the Apex Node.js/Rust backend.

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure your API URL
cp .env.example .env
# Edit .env and set REACT_APP_API_URL to your backend address

# 3. Start dev server
npm start
```

## Project structure

```
src/
├── api/
│   └── client.js          # All API calls + JWT + auto-refresh logic
├── hooks/
│   ├── useAuth.js          # Global auth context (user, signin, signup, logout)
│   └── useToast.js         # Toast notification hook
├── components/
│   └── UI.jsx              # Shared components: Button, Input, Modal, Toast, Avatar, Card
├── pages/
│   ├── AuthPage.jsx        # Sign in / Sign up
│   ├── FeedPage.jsx        # GET /posts/ — public feed
│   ├── MyPostsPage.jsx     # GET|POST|PATCH|DELETE /posts/me
│   ├── ProfilePage.jsx     # GET|PATCH|DELETE /users/me
│   └── UsersPage.jsx       # GET /users/
└── App.jsx                 # Sidebar layout + page routing
```

## API endpoints used

| Method | Path | Auth | Page |
|--------|------|------|------|
| POST | /auth/signup | — | Auth |
| POST | /auth/signin | — | Auth |
| POST | /auth/refresh | — | Auto (on 401) |
| GET | /posts/ | — | Feed |
| GET | /posts/me | ✓ | My posts |
| POST | /posts/me | ✓ | My posts |
| PATCH | /posts/me/:id | ✓ | My posts |
| DELETE | /posts/me/:id | ✓ | My posts |
| GET | /users/ | ✓ | Users |
| GET | /users/me | ✓ | Profile |
| PATCH | /users/me | ✓ | Profile |
| DELETE | /users/me | ✓ | Profile |

## Notes

- Tokens are stored in memory (not localStorage) — refresh on page reload requires re-login.
- Response field names (`title`, `body`, `userId`, etc.) may need adjusting to match your actual controller output.
- CORS must be enabled on your backend for the dev URL (`http://localhost:3000` by default).
