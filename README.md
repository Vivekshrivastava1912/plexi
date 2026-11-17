# Support Ticket Management System (MERN Stack)

A full-stack Support Ticket Management System built with **React.js**, **Tailwind CSS**, **Node.js**, **Express.js**, and **MongoDB**. This project includes complete ticket lifecycle management, status filtering, metrics dashboards, form validations, and secure JWT-based authentication.

---

## 🌟 Key Features

### 1. Support Ticket Dashboard
- **Ticket Summary Metrics**: Real-time counter cards displaying:
  - **Total Tickets**
  - **Open Tickets**
  - **In Progress Tickets**
  - **Resolved Tickets**
- **Interactive Filtering**:
  - Filter tickets instantly by Status: **All**, **Open**, **In Progress**, **Resolved**
  - Instant Search by **Ticket ID**, **Customer Name**, **Customer Email**, or **Subject**
  - Filter by **Priority** (High, Medium, Low)
  - Quick-filter directly by clicking any Summary counter card
- **Responsive Ticket List**:
  - Desktop: Clean, data-dense table view with badges and inline status updater
  - Mobile: Adaptive card layout with priority and status chips
  - Shows: **Ticket ID**, **Customer Name & Email**, **Subject & Description**, **Priority**, **Status**, **Created Date**, and **Actions**

### 2. Ticket Actions
- **View Ticket Details**: Modal exhibiting complete ticket information, customer contact details, full description, creation & update timestamps.
- **Change Ticket Status**: Rapidly update status (`Open`, `In Progress`, `Resolved`) directly from the table, card, or details modal.
- **Delete Ticket**: Secure deletion with a confirmation dialog to prevent accidental removal.
- **Create Ticket Modal**: Form with input validation (required fields, email format check, priority selection, default `Open` status).

### 3. Authentication & Security
- **JWT Authentication**: Secure token-based session handling stored in `localStorage` and sent via `Authorization: Bearer <token>` headers.
- **Protected Routes**: Frontend route guard redirecting unauthenticated users to `/login`.
- **Protected APIs**: Express authentication middleware (`protect`) guarding all ticket endpoints.
- **Default Seed User**: Backend automatically provisions a default test administrator in MongoDB on boot if not already present.
- **One-Click Autofill**: Login page features a one-click button to autofill test credentials for instant evaluation.
- **Logout**: Clears JWT token from storage and immediately redirects to the Login screen.

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 18 (Vite) | Functional components with Hooks (`useState`, `useEffect`, `useContext`, `useCallback`) |
| **Styling** | Tailwind CSS | Modern, clean, responsive UI with color-coded status badges |
| **Icons** | Lucide React | Lightweight, accessible SVG icons |
| **HTTP Client** | Axios | Configured with automatic JWT request & 401 response interceptors |
| **Routing** | React Router DOM v6 | Single Page App navigation with protected route wrappers |
| **Backend** | Node.js & Express.js | Modular RESTful API architecture (controllers, routes, middleware, models) |
| **Database** | MongoDB & Mongoose | Schemas, validations, unique readable Ticket IDs (`TCK-1001`), and pre-save hooks |
| **Auth** | JSON Web Tokens & Bcrypt.js | Password hashing and signed JWT authorization |
| **Dev Tool** | Concurrently & Nodemon | Single-command root execution (`npm run dev`) for both frontend and backend |

---

## 📁 Project Structure

```
plexi/
├── package.json              # Root package orchestrating client & server concurrently
├── .env.example              # Sample environment variables
├── .gitignore
├── README.md                 # Setup and documentation
│
├── server/                   # Backend Node.js + Express + MongoDB
│   ├── package.json
│   ├── .env.example          # Backend environment template
│   ├── server.js             # Main server entry point
│   ├── config/
│   │   └── db.js             # MongoDB connection & auto-seed handler
│   ├── models/
│   │   ├── User.js           # Mongoose User Schema (email, password hash, role)
│   │   └── Ticket.js         # Mongoose Ticket Schema (ticketId, customer, status, priority)
│   ├── controllers/
│   │   ├── authController.js # Login logic & JWT generation
│   │   └── ticketController.js # Ticket CRUD, search & summary logic
│   ├── middleware/
│   │   ├── auth.js           # JWT verification middleware
│   │   └── errorHandler.js   # Centralized error formatting
│   └── routes/
│       ├── authRoutes.js     # /api/auth endpoints
│       └── ticketRoutes.js   # /api/tickets endpoints
│
└── client/                   # Frontend React.js + Tailwind CSS (Vite)
    ├── package.json
    ├── vite.config.js        # Vite dev server with proxy to backend port 5000
    ├── tailwind.config.js    # Tailwind CSS configuration
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── main.jsx          # React DOM entry
        ├── App.jsx           # Router & AuthProvider
        ├── index.css         # Tailwind base & custom styles
        ├── context/
        │   └── AuthContext.jsx # Global user auth state, login/logout methods
        ├── services/
        │   └── api.js        # Axios instance with interceptors and API methods
        ├── components/
        │   ├── Navbar.jsx            # Header with user identity & logout
        │   ├── TicketSummary.jsx     # Metric cards (Total, Open, In Progress, Resolved)
        │   ├── TicketFilter.jsx      # Status tabs, search bar, priority dropdown
        │   ├── TicketList.jsx        # Responsive table & mobile cards with actions
        │   ├── CreateTicketModal.jsx # Ticket creation form with validation
        │   ├── TicketDetailModal.jsx # Full ticket inspection & status switcher
        │   ├── DeleteConfirmModal.jsx # Confirmation dialog before deleting
        │   └── ProtectedRoute.jsx    # Guard protecting dashboard from guests
        └── pages/
            ├── LoginPage.jsx         # Sign in screen with test credentials helper
            └── DashboardPage.jsx     # Main workspace assembling all dashboard components
```

---

## 🗄️ MongoDB Schemas / Models

### 1. User Model (`server/models/User.js`)
```javascript
{
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['admin', 'agent'], default: 'admin' },
  timestamps: true // createdAt, updatedAt
}
```
*Features:*
- Automatically hashes password using `bcryptjs` with salt rounds prior to persisting.
- Custom instance method `comparePassword(candidate)` for credential verification.

### 2. Ticket Model (`server/models/Ticket.js`)
```javascript
{
  ticketId: { type: String, unique: true, trim: true },
  customerName: { type: String, required: true, trim: true, maxlength: 100 },
  customerEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
  },
  subject: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, required: true, trim: true },
  priority: {
    type: String,
    required: true,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  status: {
    type: String,
    required: true,
    enum: ['Open', 'In Progress', 'Resolved'],
    default: 'Open'
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamps: true // createdAt, updatedAt
}
```
*Features:*
- Pre-save hook automatically creates sequential, human-friendly ticket IDs (e.g., `TCK-1001`, `TCK-1002`).

---

## 📡 REST API Reference

All ticket routes require the `Authorization: Bearer <token>` header.

### Authentication APIs

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticate user & receive JWT token |
| `GET` | `/api/auth/me` | Protected | Retrieve profile of currently authenticated user |

#### Sample Login Request (`POST /api/auth/login`)
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```
#### Sample Login Response
```json
{
  "success": true,
  "message": "Logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "664b38d7213...",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

---

### Ticket APIs

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tickets` | Protected | Get all tickets (supports `status`, `priority`, `search` query parameters) and summary counts |
| `GET` | `/api/tickets/summary` | Protected | Get ticket summary metrics ({ total, open, inProgress, resolved }) |
| `GET` | `/api/tickets/:id` | Protected | Get single ticket details by MongoDB `_id` or `ticketId` |
| `POST` | `/api/tickets` | Protected | Create a new ticket (default status: `Open`) |
| `PUT` | `/api/tickets/:id` | Protected | Update ticket fields or change status (`Open`, `In Progress`, `Resolved`) |
| `DELETE` | `/api/tickets/:id` | Protected | Permanently delete a ticket |

#### Sample Create Ticket Request (`POST /api/tickets`)
```json
{
  "customerName": "Alice Johnson",
  "customerEmail": "alice@example.com",
  "subject": "Payment gateway timeout on checkout",
  "description": "Customer receives a 504 error when clicking Pay Now with credit card.",
  "priority": "High",
  "status": "Open"
}
```

---

## 🚀 Getting Started & Execution Instructions

### Prerequisites
- **Node.js** (v16+ or higher recommended, e.g. v18, v20, v22)
- **npm** (v8+ or higher)
- **MongoDB** running locally on port `27017` **OR** a cloud connection string from [MongoDB Atlas](https://www.mongodb.com/atlas).

---

### 1. Installation

Run the following command in the project root to install dependencies for root, server, and client:

```bash
# Option A: One-command install for everything
npm run install:all

# Option B: Or install individually
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
```

---

### 2. Environment Configuration

Example files are provided in `.env.example` in both root and `server/`:

```env
# server/.env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/support_ticket_db
JWT_SECRET=supersecretjwtkey_support_ticket_system_2026
DEFAULT_USER_NAME=Admin User
DEFAULT_USER_EMAIL=admin@example.com
DEFAULT_USER_PASSWORD=admin123
```

> **Note:** If using MongoDB Atlas, replace `MONGODB_URI` with your connection string:
> `MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/support_tickets?retryWrites=true&w=majority`

---

### 3. Running the Application (`npm run dev`)

You can launch **both** backend and frontend concurrently from the root directory with a single command:

```bash
npm run dev
```

This starts:
- **Backend API**: `http://localhost:5000`
- **Frontend Dashboard**: `http://localhost:5173`

*(Alternatively, you can run them in separate terminal windows: `npm run server` and `npm run client`).*

---

### 4. Logging In (Default Test Credentials)

When the backend starts up, it automatically seeds the default test user in MongoDB if not already present:

- **Email**: `admin@example.com`
- **Password**: `admin123`

On the Login page (`http://localhost:5173/login`), you can either type these credentials or click the **"Fill Credentials"** shortcut button to autofill and test immediately.

---

## ✅ Evaluation Checklist

| Requirement | Implementation Details | Status |
| :--- | :--- | :--- |
| **Ticket Summary** | Total, Open, In Progress, Resolved counts with real-time updates and interactive filtering | Completed |
| **Ticket List** | Table & card view displaying ID, Customer, Subject, Priority, Status, Date, and Actions | Completed |
| **Actions** | View ticket details modal, Change ticket status dropdown, Delete confirmation modal | Completed |
| **Create Ticket** | Customer Name, Email, Subject, Description, Priority (Low/Med/High), default status `Open`, validation | Completed |
| **REST APIs** | `POST`, `GET`, `GET :id`, `PUT :id`, `DELETE :id` in `server/routes/ticketRoutes.js` | Completed |
| **MongoDB Model** | Clean Mongoose Schema with validation, auto-generated `ticketId`, and timestamps | Completed |
| **API Integration** | React connected to Node backend via Axios with loading spinners and error alerts | Completed |
| **Status Filter** | Tabs for All, Open, In Progress, Resolved + live search and priority filter | Completed |
| **Authentication** | Login page, JWT token creation, Route protection, Logout, auto-seeded test admin | Completed |
| **Single Dev Command** | Root `package.json` with `npm run dev` running client & server concurrently | Completed |

