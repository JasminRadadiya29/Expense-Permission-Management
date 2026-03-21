# 💼 ExpenseFlow — Smart Expense Management

> A full-stack expense management platform with multi-level approvals, real-time currency conversion, and a premium dark UI.

---

## ✨ Features

### 👤 Role-Based Access
| Role | Capabilities |
|---|---|
| **Employee** | Submit expenses, track status, convert currencies |
| **Manager** | Review & approve/reject team expenses, view reports |
| **Admin** | Manage all users, assign roles & managers |

### 🧾 Expense Management
- Submit expenses with category, amount, currency, description & receipt upload
- Real-time **multi-currency conversion** (live exchange rates)
- Status tracking: `Pending → Approved / Rejected`
- Filter & search expenses by category, status, date

### ✅ Approval Workflows
- Configurable **multi-step approval rules**
- Approval types: **All Required**, **Percentage-based**, **Specific Approver**, **Hybrid**
- Managers receive itemized approval requests with comments

### 🛡️ Auth & Security
- JWT-based authentication with refresh handling
- Forced **password change** on first login (temporary password flow)
- Secure password requirements enforcement
- Email-based **forgot password** / reset flow (via EmailJS)

### 🎨 UI/UX
- **Dark glassmorphism** design system throughout
- Animated starfield background
- Toast notifications (no intrusive `alert()` dialogs)
- Fully responsive for desktop & mobile

---

## 🛠️ Tech Stack

**Frontend**
- React 18 + Vite
- Tailwind CSS
- Lucide React (icons)
- React Router DOM

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- EmailJS (transactional email)

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas account (or local MongoDB)

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/expense-management.git
cd expense-management

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
NODE_ENV=development
```

### Run the App

```bash
# Start both frontend and backend concurrently
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

---

## 📁 Project Structure

```
expense-management/
├── server/
│   ├── controllers/       # Business logic
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API routes
│   ├── middleware/        # Auth, validation, security
│   └── index.js
├── src/
│   ├── components/        # Shared UI components
│   ├── pages/             # Route-level page components
│   ├── contexts/          # Auth context
│   └── services/          # API + email services
└── index.html
```

---

## 📜 License

MIT © 2024 — Feel free to fork and build on it.
