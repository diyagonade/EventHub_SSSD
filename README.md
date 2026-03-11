## Event Management Dashboard

Full‑stack event management dashboard with a React (Vite) frontend and an Express + Prisma + PostgreSQL backend.

### Features

- **Event management**: Create and manage events and related data.
- **Dashboard UI**: Modern React interface using `react-bootstrap` and `bootstrap`.
- **API backend**: Node/Express server with Prisma ORM and PostgreSQL.
- **Auth & security**: JWT-based authentication with password hashing (`bcryptjs`).

---

### Project Structure

```bash
event-management-dashboard/
├─ backend/                # Express API + Prisma
│  ├─ prisma/              # Prisma schema & migrations
│  ├─ src/                 # Backend source (server, routes, controllers, services)
│  ├─ package.json
│  └─ ...                  # Other backend files/config
├─ frontend/               # React + Vite dashboard
│  ├─ src/                 # React components, pages, hooks, etc.
│  ├─ public/
│  ├─ index.html
│  ├─ package.json
│  └─ ...                  # Other frontend files/config
├─ README.md
└─ ...                     # Other root-level files (e.g. .gitignore, env samples)
```

---

### Tech Stack

- **Frontend**: React 19, Vite, React Router, React Bootstrap, Axios
- **Backend**: Node.js, Express 5, Prisma, PostgreSQL, JSON Web Tokens, node-cron

---

### Prerequisites

- **Node.js** (LTS recommended)
- **npm** or **yarn**
- **PostgreSQL** database instance

---

### Project Structure

- `frontend/` – React + Vite SPA (dashboard UI)
- `backend/` – Express API server and Prisma schema

---

### Backend Setup (`backend/`)

1. **Install dependencies**

   ```bash
   cd backend
   npm install
   ```

2. **Environment variables**

   Create a `.env` file in `backend/` (adjust names/values to your setup). A typical configuration might include:

   ```bash
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB_NAME?schema=public"
   JWT_SECRET="your_jwt_secret_here"
   PORT=5000
   ```

3. **Prisma setup**

   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

4. **Run the backend**

   ```bash
   # Development (with reload)
   npm run dev

   # Production-style start
   npm start
   ```

   By default the API typically runs on `http://localhost:5000` (or the value of `PORT`).

---

### Frontend Setup (`frontend/`)

1. **Install dependencies**

   ```bash
   cd frontend
   npm install
   ```

2. **Environment variables (Vite)**

   Create a `.env` or `.env.local` file in `frontend/` if the frontend needs to know the backend URL, for example:

   ```bash
   VITE_API_BASE_URL="http://localhost:5000"
   ```

3. **Run the frontend**

   ```bash
   npm run dev
   ```

   Vite will print the local dev URL, usually something like `http://localhost:5173`.

4. **Build for production**

   ```bash
   npm run build
   npm run preview
   ```

---

### Common Scripts
- **Docker**
  - docker compose up --build.
    
- **Backend**
  - `npm run dev` – Start Express server in watch mode.
  - `npm start` – Start Express server.
  - `npm run prisma:generate` – Generate Prisma client.
  - `npm run prisma:migrate` – Apply Prisma migrations.

- **Frontend**
  - `npm run dev` – Start Vite dev server.
  - `npm run build` – Build production assets.
  - `npm run preview` – Preview the production build.

---

### Development Workflow

1. Start PostgreSQL and ensure `DATABASE_URL` is correct.
2. In one terminal, run the backend (`cd backend && npm run dev`).
3. In another terminal, run the frontend (`cd frontend && npm run dev`).
4. Open the Vite dev URL in your browser and interact with the dashboard.

---

### Our Team
Our Team consists of: 
1. Sameer Lonare : Connect on <a href="https://github.com/sameer0221">Github</a>
2. Diya D. Gonade : Connect on <a href="https://github.com/diyagonade">Github</a>
3. Shreya Srivastava : Connect on <a href="https://github.com/ShreyaSrivastava27">Github</a>
4. Samriddhi Paul : Connect on <a href="https://github.com/SamrPaul">Github</a>
5. Shubhanshu Rawat : Connect on <a href="https://github.com/subhanshurawat99">Github</a>


# EventHub_SSSD
