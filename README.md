# SplitWise+ 💸

A production-ready, full-stack expense splitting application built with the MERN stack.

## ✨ Features

- **🔐 Authentication** — Register/login with JWT, bcrypt password hashing
- **👥 Groups** — Create groups, add members, categorize (trip/home/friends/work/etc.)
- **💰 Expenses** — Add expenses, split equally, by exact amount, or percentage
- **⚖️ Debt Simplification** — Greedy algorithm minimizes number of transactions to settle debts
- **⇌ Settlements** — Record payments, view all settlements per group
- **📊 Analytics Dashboard** — Monthly spending chart, category breakdown, personal balance
- **🔴 Real-Time** — Socket.io live updates when group members add expenses
- **🌙 Dark/Light Mode** — Toggle between themes
- **📱 Responsive** — Mobile-friendly with collapsible sidebar

## 🏗️ Project Structure

```
splitwise-plus/
├── backend/
│   ├── server.js              # Express + Socket.io entry point
│   ├── config/db.js           # MongoDB connection
│   ├── models/
│   │   ├── User.js
│   │   ├── Group.js
│   │   ├── Expense.js
│   │   └── Settlement.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── groups.js
│   │   ├── expenses.js
│   │   ├── settlements.js
│   │   └── analytics.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── groupController.js
│   │   ├── expenseController.js
│   │   ├── settlementController.js
│   │   └── analyticsController.js
│   ├── middleware/
│   │   ├── auth.js            # JWT protect middleware
│   │   ├── errorHandler.js
│   │   └── validate.js
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── package.json
│   ├── tailwind.config.js
│   └── src/
│       ├── App.js
│       ├── index.js
│       ├── index.css
│       ├── context/
│       │   ├── AuthContext.js
│       │   └── AppContext.js
│       ├── services/
│       │   ├── api.js
│       │   └── socket.js
│       ├── pages/
│       │   ├── LoginPage.js
│       │   ├── RegisterPage.js
│       │   ├── DashboardPage.js
│       │   ├── GroupsListPage.js
│       │   ├── GroupPage.js
│       │   ├── ExpensesPage.js
│       │   ├── SettlementsPage.js
│       │   └── ProfilePage.js
│       └── components/
│           ├── common/Layout.js
│           ├── expenses/
│           │   ├── AddExpenseModal.js
│           │   └── ExpenseList.js
│           ├── groups/
│           │   ├── CreateGroupModal.js
│           │   ├── AddMemberModal.js
│           │   ├── BalancePanel.js
│           │   └── MembersPanel.js
│           └── settlements/
│               └── SettleModal.js
│
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

---

### 1. Clone the repo

```bash
git clone <repo-url>
cd splitwise-plus
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create your `.env` file:

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/splitwise-plus
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

Start the backend:

```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:5000/api`

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm start
```

The app will open at `http://localhost:3000`

---

## 📡 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### Groups
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/groups` | Get all user's groups |
| POST | `/api/groups` | Create group |
| GET | `/api/groups/:id` | Get group details |
| DELETE | `/api/groups/:id` | Archive group |
| GET | `/api/groups/:id/balances` | Get balances + simplified debts |
| POST | `/api/groups/:id/members` | Add member by email |
| DELETE | `/api/groups/:id/members/:userId` | Remove member |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/expenses` | Add expense |
| GET | `/api/expenses/group/:groupId` | Get group expenses |
| GET | `/api/expenses/my` | Get all personal expenses |
| GET | `/api/expenses/:id` | Get single expense |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |

### Settlements
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/settlements` | Record settlement |
| GET | `/api/settlements/group/:groupId` | Get group settlements |
| DELETE | `/api/settlements/:id` | Delete settlement |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/dashboard` | Dashboard stats |

---

## 🧠 Debt Simplification Algorithm

The app uses a greedy two-pointer algorithm to minimize the number of transactions needed:

1. Calculate each person's net balance (amount paid minus their share)
2. Separate into creditors (positive balance) and debtors (negative balance)
3. Match largest debtor with largest creditor
4. Record a transaction for `min(debtorAmount, creditorAmount)`
5. Repeat until all balances are zero

This guarantees the minimum number of transactions needed to settle all debts.

---

## 🔒 Security Features

- Passwords hashed with bcrypt (12 salt rounds)
- JWT tokens with expiry
- Protected routes on both frontend and backend
- Input validation with express-validator
- Helmet.js security headers
- CORS configuration
- Soft deletes (expenses marked deleted, not removed)

---

## 🌐 Deployment

### Backend (e.g., Railway, Render, Heroku)

Set environment variables:
```
MONGO_URI=mongodb+srv://...
JWT_SECRET=<strong-random-string>
CLIENT_URL=https://your-frontend.vercel.app
NODE_ENV=production
```

### Frontend (e.g., Vercel, Netlify)

```bash
cd frontend
npm run build
```

Set environment variable:
```
REACT_APP_SERVER_URL=https://your-backend.railway.app
```

Update `package.json` proxy or use the env variable in `socket.js`.

---

## 📦 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, React Router v6, Recharts |
| Styling | Tailwind CSS, Custom CSS variables |
| State | Context API + useReducer |
| Backend | Node.js, Express.js |
| Auth | JWT + bcryptjs |
| Database | MongoDB + Mongoose |
| Real-time | Socket.io |
| Validation | express-validator |
| HTTP | Axios |

---

## 🎨 Design

- **Dark-first** design with light mode toggle
- **Syne** display font (geometric, distinctive)
- **DM Sans** body font (modern, readable)
- CSS variables for consistent theming
- Smooth animations and hover effects
- Mobile-responsive with collapsible sidebar
