# BorrowBox 📦

> A college-only marketplace for borrowing, lending, selling items and earning by helping fellow students.

## 🌐 Live Demo

- **Frontend:** https://borrow-box-black.vercel.app
- **Backend API:** https://borrowbox-api.onrender.com

![BorrowBox](https://img.shields.io/badge/Stack-MERN-yellow)
![License](https://img.shields.io/badge/License-MIT-blue)
![Status](https://img.shields.io/badge/Status-Active-green)

---

## What is BorrowBox?

BorrowBox is a full-stack web application built for college students living in hostels. It is a mini campus economy platform where students can:

- 📦 **Borrow & Lend** — Rent items like calculators, guitars, laptops from fellow students
- 🏷️ **Buy & Sell** — Sell old textbooks, gadgets, clothes directly to classmates
- 🤝 **Ask for Help** — Post tasks like food delivery, assignment writing, quiz taking and earn money
- 🔒 **College-only access** — Only students with a valid college email can sign up

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js + Tailwind CSS + Vite |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT + bcryptjs |
| Deployment | Vercel (frontend) + Render (backend) |

---

## Features

- ✅ College email domain restriction (only your college can sign up)
- ✅ JWT authentication with secure password hashing
- ✅ Browse, filter and search listings by category and type
- ✅ List items for rent or sale with custom rules and pricing
- ✅ Slot-based booking system with availability tracking
- ✅ Gig marketplace — post tasks, accept tasks, earn money
- ✅ Personal dashboard with real-time listings, bookings and tasks
- ✅ Fully responsive design with brand color palette

---

## Project Structure
```
BorrowBox/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/            # API helper functions
│   │   ├── context/        # Auth context
│   │   ├── pages/          # All page components
│   │   └── main.jsx
│   └── package.json
│
└── server/                 # Node.js backend
    ├── config/             # Database connection
    ├── controllers/        # Route logic
    ├── middleware/         # Auth middleware
    ├── models/             # MongoDB schemas
    ├── routes/             # API routes
    └── index.js
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Git

### Installation

1. Clone the repository
```bash
git clone https://github.com/YOURUSERNAME/BorrowBox.git
cd BorrowBox
```

2. Install frontend dependencies
```bash
cd client
npm install
```

3. Install backend dependencies
```bash
cd ../server
npm install
```

4. Set up environment variables

Create a `.env` file inside the `server/` folder:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

5. Run the development servers

Frontend (in `client/` folder):
```bash
npm run dev
```

Backend (in `server/` folder):
```bash
npm run dev
```

6. Open `http://localhost:5173` in your browser

---

## API Endpoints

Interactive API documentation is available at `http://localhost:5000/api/docs` while the server is running.

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/me | Get current user |

### Items
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/items | Get all items |
| GET | /api/items/:id | Get item by ID |
| POST | /api/items | Create new item |
| PUT | /api/items/:id | Update item |
| DELETE | /api/items/:id | Delete item |
| GET | /api/items/mine | Get my items |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/bookings | Create booking |
| GET | /api/bookings/mine | Get my bookings |
| GET | /api/bookings/incoming | Get bookings for my items |
| PUT | /api/bookings/:id | Update booking status |

### Gigs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/gigs | Get all open gigs |
| POST | /api/gigs | Post a new gig |
| PUT | /api/gigs/:id/accept | Accept a gig |
| PUT | /api/gigs/:id/complete | Mark gig complete |
| GET | /api/gigs/mine | Get my gigs |

## Production decisions

- Booking creation and status changes use MongoDB transactions. The server returns a clear `503` error when connected to a deployment that does not support transactions; it does not fall back to unsafe availability updates.
- Browser authentication uses an HttpOnly access cookie with CSRF protection. Bearer tokens remain supported for API clients.
- Sale listings are currently informational only. The non-functional Buy Now and payment flow is intentionally not simulated.
- Chat and reviews are not advertised as working features until their persistence, authorization, and eligibility rules are implemented.
- Role selection is persisted through the authenticated backend user record and is not trusted as a permission mechanism by itself.

## Testing

```bash
cd server
npm test

cd ../client
npm run lint
npm run build
```

The transactional booking integration requires a MongoDB replica set or sharded deployment. Set up a dedicated test database before adding live integration tests; the included tests cover API shell behavior, numeric validation, and booking state transitions without modifying production data.

---

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Deep Yellow | `#F4B63E` | Primary brand color |
| Soft Lavender | `#C9C4F5` | Secondary color |
| Light Grey | `#F8F5F8` | Background |
| Dark | `#1A1A1A` | Primary text |

---

## Built With ❤️ by

**Ishika** — Built as a real-world college campus marketplace project

---

## License

This project is licensed under the MIT License.