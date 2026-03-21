# Expense Management App

A simple expense management application built with React and Node.js.

## Features

- User authentication (login/signup)
- Submit and track expenses
- Approval workflow for managers
- Receipt scanning with OCR
- Multi-currency support

## Tech Stack

- Frontend: React + Vite + TailwindCSS
- Backend: Node.js + Express + MongoDB
- Authentication: JWT
- OCR: Tesseract.js

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your MongoDB connection:
```env
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
PORT=5000
```

3. Run the application:
```bash
npm run dev
```

4. Access the app at http://localhost:5173

## Available Scripts

- `npm run dev` - Start both frontend and backend
- `npm run server` - Start backend only
- `npm run client` - Start frontend only
- `npm run build` - Build for production
