# ⚖️ KSLU Circle

> **An independent student peer-learning & study resource platform for law students affiliated with Karnataka State Law University (KSLU).**

[![Frontend Deployment](https://img.shields.io/badge/Frontend-Vercel-black?style=flat&logo=vercel)](https://kslu-website.vercel.app)
[![Backend Deployment](https://img.shields.io/badge/Backend-Render-46E3B7?style=flat&logo=render)](https://kslu-website.onrender.com)
[![Database](https://img.shields.io/badge/Database-Neon%20Postgres-00E599?style=flat&logo=postgresql)](https://neon.tech)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📖 Overview

**KSLU Circle** is a dedicated open repository and collaborative study hub built for Karnataka State Law University (KSLU) students. It organizes previous year question papers (PYQs), lecture notes, syllabus frameworks, and study materials across courses, semesters, and marking schemes, making academic preparation structured, accessible, and fast.

---

## ✨ Key Features

### 🎓 Academic Coverage
- **3-Year LL.B:** All 6 semesters (Core subjects, Clinical courses, and Electives).
- **5-Year Integrated B.A. LL.B:** All 10 semesters (Arts + Law curricula).
- **5-Year Integrated B.B.A. LL.B:** All 10 semesters (Management + Law curricula).
- **B.Com. LL.B & B.Sc. LL.B:** Integrated course modules.

### 📄 Previous Year Question Papers (PYQs)
- Filter papers by **Course**, **Semester (S1–S10)**, **Subject Code/Name**, **Exam Year**, and **Exam Pattern (Scheme 80 Marks / Scheme 100 Marks)**.
- Integrated PDF previewer for in-browser inspection.
- Direct download tracking and bookmarks.

### 📝 Study Notes & Community Contributions
- Peer-contributed law notes with title, tags, description, and author credentials.
- Community upvoting/downvoting and engagement system.
- Moderation workflow: User submissions enter an admin review queue before being published.

### 🔐 Authentication & Roles
- **JWT Authentication:** Tokens stored via secure, cross-domain `HttpOnly`, `SameSite=None` cookies with Bearer token fallback.
- **Google OAuth 2.0:** One-tap sign-in for university students.
- **Role-Based Access Control:** Role hierarchy (`user`, `admin`, `superadmin`).

### ⚡ Real-Time System & Alerts
- Real-time notification engine powered by **Socket.io**.
- Instant in-app alerts on material approvals, reviews, and university announcements.

### 🛡️ Admin Moderation Dashboard
- Review, approve, reject, or feature community study uploads.
- Broadcast announcements (info, alert, urgent) across the platform.
- Activity logs, audit trails, and user management (role assignments, account bans).
- Real-time download analytics and content usage statistics.

### 🌐 Modern UX / UI
- Dual-theme support: Light and dark mode with high contrast law-gold typography.
- Multilingual toggle: English and Kannada interfaces.
- Fully responsive across mobile, tablet, and desktop viewports.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | [React 18](https://react.dev/) with [Vite](https://vitejs.dev/) |
| **Styling & Icons** | [Tailwind CSS](https://tailwindcss.com/), [Lucide React](https://lucide.dev/), [Framer Motion](https://www.framer.com/motion/) |
| **Forms & Validation** | [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) |
| **Client Routing & SEO** | [React Router v6](https://reactrouter.com/), [React Helmet Async](https://github.com/staylor/react-helmet-async) |
| **HTTP Client** | [Axios](https://axios-http.com/) (with custom interceptors & self-healing base URLs) |
| **Backend Runtime** | [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/) |
| **Database & ORM** | [PostgreSQL (Neon Serverless)](https://neon.tech/) & [Prisma ORM](https://www.prisma.io/) |
| **Real-time WebSockets**| [Socket.io](https://socket.io/) (client & server) |
| **File Storage** | [Multer](https://github.com/expressjs/multer) & [Cloudinary](https://cloudinary.com/) (with local disk fallback) |
| **Security & Headers** | [Helmet](https://helmetjs.github.io/), [CORS](https://github.com/expressjs/cors), [Express Rate Limit](https://github.com/express-rate-limit/express-rate-limit), [Bcrypt.js](https://github.com/dcodeIO/bcrypt.js) |
| **Email Service** | [Nodemailer](https://nodemailer.com/) (SMTP) |
| **Hosting & CI/CD** | Frontend: [Vercel](https://vercel.com/) • Backend: [Render](https://render.com/) |

---

## 📂 Project Architecture

```text
kslu-website/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma        # Database schema definitions & models
│   ├── src/
│   │   ├── config/              # DB connection, Socket.io setup
│   │   ├── controllers/         # Request handling (Auth, Materials, Admin, etc.)
│   │   ├── middleware/          # Auth guards, role authorization, uploads, rate limits
│   │   ├── routes/              # Express API route endpoints
│   │   ├── services/            # File storage, emails, notifications
│   │   ├── utils/               # Winston logger, helpers
│   │   └── server.js            # Main backend entry point
│   ├── uploads/                 # Local disk fallback storage for PDF files
│   ├── .env.example             # Backend environment template
│   └── package.json
│
├── frontend/
│   ├── public/                  # Static assets & icons
│   ├── src/
│   │   ├── api/                 # Axios client instance
│   │   ├── components/          # Reusable UI components (Navbar, Footer, Cards, etc.)
│   │   ├── contexts/            # React Contexts (Auth, Theme, Notification, Language)
│   │   ├── pages/               # Page views (Home, Notes, Papers, Syllabus, Admin, etc.)
│   │   ├── utils/               # Subject maps, syllabus definitions
│   │   ├── App.jsx              # Main application root
│   │   ├── routes.jsx           # Client-side router configuration
│   │   └── index.css            # Tailwind & custom CSS rules
│   ├── vercel.json              # Vercel SPA routing configuration
│   ├── .env.example             # Frontend environment template
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18.x or v20.x recommended)
- **npm** or **yarn**
- **PostgreSQL Database** (e.g., free instance on [Neon](https://neon.tech))

---

### 1. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```

Edit `backend/.env` with your credentials:
```env
PORT=5000
NODE_ENV=development

# Neon PostgreSQL connection string
DATABASE_URL="postgresql://user:password@ep-xyz.aws.neon.tech/neondb?sslmode=require"

# JWT configuration
JWT_SECRET="your-32-character-secret-key"
JWT_EXPIRE="7d"
COOKIE_EXPIRE="7"

# Frontend URL
CLIENT_URL="http://localhost:5173"
CLIENT_URL_PROD="https://kslu-website.vercel.app"

# Cloudinary (Optional - defaults to local disk uploads/ if empty or dummy)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# SMTP / Email Service (Optional - logs to console if empty)
SMTP_HOST=""
SMTP_PORT=587
SMTP_USER=""
SMTP_PASS=""
FROM_EMAIL="noreply@kslucircle.com"
FROM_NAME="KSLU Circle"
```

Sync database schema and start backend:
```bash
# Push schema to PostgreSQL and generate Prisma Client
npx prisma db push
npx prisma generate

# Start the development server
npm run dev
# The API will be running on http://localhost:5000
```

---

### 2. Frontend Setup

```bash
# Open a new terminal and navigate to frontend
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Start the Vite development server:
```bash
npm run dev
# The application will be accessible at http://localhost:5173
```

---

## 🚢 Deployment

### Frontend (Vercel)
1. Import repository on [Vercel](https://vercel.com).
2. Set root directory to `frontend`.
3. Add Environment Variables:
   - `VITE_API_URL`: Your live backend API URL (e.g. `https://kslu-website.onrender.com/api`)
   - `VITE_SOCKET_URL`: Your live backend WebSocket URL (e.g. `https://kslu-website.onrender.com`)
4. Build command: `npm run build`
5. Output directory: `dist`

### Backend (Render)
1. Create a new **Web Service** on [Render](https://render.com) pointing to this repository.
2. Set root directory to `backend`.
3. Environment: `Node`.
4. Build Command:
   ```bash
   npm install && npx prisma generate && npx prisma db push
   ```
5. Start Command:
   ```bash
   npm start
   ```
6. Add your production environment variables (`DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`, `CLIENT_URL_PROD`, etc.).

---

## 📜 Disclaimer

**KSLU Circle** is an independent student learning platform created to help law students. It is **not affiliated with, endorsed by, or operated by Karnataka State Law University**. Official notifications, circulars, examination results, and regulations should always be verified on the official KSLU portal at [kslu.karnataka.gov.in](https://kslu.karnataka.gov.in).

---

## 🤝 Contributing

Contributions are welcome from students, alumni, and developers!
1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m "Add some AmazingFeature"`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
