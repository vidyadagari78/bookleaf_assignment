# 🌿 BookLeaf Publishing — Technical Assignment Submission

**Candidate:** Vidyashree Dagari  
**Role:** Full Stack Developer  
**Position:** Technical Assignment Evaluation  
**Project:** Author Support & Communication Portal  
**Submission Date:** October 2026  

---

## 📑 Table of Contents
1. [Source Code Repository](#1-source-code-repository)
2. [Setup Instructions to Run the Project](#2-setup-instructions-to-run-the-project)
3. [Test Credentials & 1-Click Demo Accounts](#3-test-credentials--1-click-demo-accounts)
4. [Notes & Assumptions Made](#4-notes--assumptions-made)
5. [Key Architectural & Engineering Decisions](#5-key-architectural--engineering-decisions)
6. [Known Limitations & Production Roadmap](#6-known-limitations--production-roadmap)

---

## 1. Source Code Repository

* **GitHub Repository:** [https://github.com/vidyadagari78/bookleaf_assignment](https://github.com/vidyadagari78/bookleaf_assignment)
* **Branch:** `main`
* **Automated Integration Test Status:** `10/10 Passed` (Zero failures)
* **Prebuilt Production Assets:** Included in `client/dist/` for zero-configuration instant serving out of the box.

---

## 2. Setup Instructions to Run the Project

### Prerequisites
* **Node.js:** v18.x or higher (tested and verified on Node v20 & v24)
* **npm:** v9.x or higher
* **Git**

### Step-by-Step Execution

```bash
# 1. Clone the repository
git clone https://github.com/vidyadagari78/bookleaf_assignment.git
cd bookleaf_assignment

# 2. Install backend and frontend dependencies
npm install
npm --prefix client install

# 3. (Recommended) Run the 10/10 automated end-to-end integration test suite
npm test
# Expected output: 🎉 ALL 10 BACKEND INTEGRATION TESTS PASSED!

# 4. Start the unified application (serves API, WebSockets, and Frontend on Port 5000)
npm start
```

### Accessing the Live Portal
* **Web Application:** [http://localhost:5000](http://localhost:5000)
* **Interactive OpenAPI 3.0 / Swagger UI:** [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
* **Raw OpenAPI Specification:** [http://localhost:5000/api/v1/docs.json](http://localhost:5000/api/v1/docs.json)
* **Real-Time WebSocket Stream:** `ws://localhost:5000/ws`

*(Optional Development Hot-Reload Mode: Run `npm run dev` in one terminal for backend nodemon and `npm run dev:client` in another for Vite HMR on port 5173).*

---

## 3. Test Credentials & 1-Click Demo Accounts

The application features an interactive **⚡ 1-Click Demo Logins** drawer on both the login page and the top navigation bar. You can log into any of the following accounts with one click without manually typing credentials:

### Operations Admins (Full Management, AI Studio, Overrides & Private Notes)
| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **Head of Publishing Operations** | Sunita Kapoor | `admin@bookleafpublishing.com` | `adminpassword123` |
| **Senior Author Success Specialist** | Kabir Verma | `support@bookleafpublishing.com` | `adminpassword123` |

### Sample Authors (Pre-seeded with official BookLeaf sample dataset: 10 Authors & 18 Books)
| Author ID | Name | Email | Password | Catalog & Scenarios Represented |
| :--- | :--- | :--- | :--- | :--- |
| `AUTH001` | **Priya Sharma** | `priya.sharma@email.com` | `password123` | 2 books (*Whispers of the Ganges*, *The Saffron Diaries*), ₹3,570 pending royalty (> ₹1,000 threshold eligible) |
| `AUTH002` | **Rohit Kapoor** | `rohit.kapoor@email.com` | `password123` | 2 books (*Code & Karma*, *Startup Sutra*), VIP Bestseller Breakthrough tier (2,079+ copies sold) |
| `AUTH003` | **Ananya Reddy** | `ananya.reddy@email.com` | `password123` | 1 book (*Between Two Temples*), first payout cycle (`last_royalty_payout_date`: null) |
| `AUTH004` | **Vikram Joshi** | `vikram.joshi@email.com` | `password123` | 2 books (*Debugging Life*, *The Last Monsoon*), critical misbound print defect report (100% free reprint guarantee) |
| `AUTH005` | **Meera Nair** | `meera.nair@email.com` | `password123` | 2 books (*Cardamom & Chaos*, *Letters from Lakshadweep*), Amazon India 24-48h stock sync inquiry |
| `AUTH006` | **Arjun Malhotra** | `arjun.malhotra@email.com` | `password123` | 1 book (*Turban Tales*), author bulk order discount inquiry |
| `AUTH007` | **Sneha Kulkarni** | `sneha.kulkarni@email.com` | `password123` | 3 books, **Pre-Publication Production Stage**: *Midnight in Mysore* (**In Production — Stage 3: Cover Design**) |
| `AUTH008` | **Farhan Sheikh** | `farhan.sheikh@email.com` | `password123` | 1 book (*Ghazal of the Forgotten*), **Zero Pending Balance**: 650 copies, ₹3,120 earned, ₹3,120 paid, ₹0 pending |
| `AUTH009` | **Kavita Deshmukh** | `kavita.deshmukh@email.com` | `password123` | 2 books, **< ₹1,000 Rollover Rule**: *The Nagpur Notebooks* (₹850 pending) + *Raising Roots* (**In Production — Stage 4: Typesetting**) |
| `AUTH010` | **Diya Chatterjee** | `diya.chatterjee@email.com` | `password123` | 2 books (*Durga's Daughters*, *Howrah Nights*), Repro India international distribution inquiry |

---

## 4. Notes & Assumptions Made

### 1. Dataset & Business Logic Alignment
* **Exact Assignment Alignment:** Replaced generic placeholder records with BookLeaf's official 10 authors (`AUTH001`–`AUTH010`) and 18 books (`BK001`–`BK018`) with fields: `author_royalty_per_copy`, `last_royalty_payout_date`, `print_partner`, and `available_on`.
* **80/20 Net Profit Split Policy:** Net profit is defined per BookLeaf policy as:  
  $$\text{Net Profit} = \text{MRP} - (\text{Production Cost} + \text{Distribution Fee})$$  
  Authors receive **80%** of net profit, and BookLeaf retains **20%**.
* **₹1,000 Minimum Payout & Rollover Rule:** Under BookLeaf policy, royalties are disbursed on a quarterly cycle within 45 days of quarter end, subject to a ₹1,000 threshold. If an author's balance is below ₹1,000 (e.g. Kavita Deshmukh's ₹850), the system displays an automatic rollover indicator: *"Balance below ₹1,000 threshold; automatically rolls over to next quarter without forfeiture"*.
* **9-Stage Production Milestone Stepper:** Books in production render a visual milestone stepper reflecting BookLeaf's actual 9 stages:  
  `Manuscript Received` $\to$ `Editing` $\to$ `Cover Design` $\to$ `Typesetting` $\to$ `Proofreading` $\to$ `ISBN Assignment` $\to$ `Printing` $\to$ `Distribution Setup` $\to$ `Published & Live`. ISBNs for in-production books are clearly indicated as *"Pending Assignment in Stage 6"*.

### 2. Dual-Engine AI Integration & Cost Management
* **Token-Aware Dynamic Policy Slicing:** Naively sending BookLeaf's entire 3,000-token Knowledge Base on every query causes token bloat. The tokenizer dynamically extracts **only** the relevant policy module (Royalty, ISBN, Print, or Distribution), reducing input token consumption by **~85%** (~450 tokens/call).
* **Zero-Downtime Deterministic Fallback:** In high-volume operations, external LLM APIs face rate limits (HTTP 429), timeouts, and network outages. If an external API key is absent or fails, the internal **BookLeaf Deterministic Knowledge Engine** synthesizes tailored responses using rules, quarter dates, and threshold math, ensuring 100% operational uptime.
* **Human-in-the-Loop Safeguards:** Operations team members retain complete editing control over AI drafts before sending, and can override AI-assigned categories and priorities with one click.

### 3. Design Aesthetics & Multi-Theme Architecture
* **Editorial Ivory Maison (Default):** Designed a literary publishing house aesthetic (warm archival parchment `#fbfaf7`, British racing green `#064e3b`, gold foil, crisp ink typography `#0f172a`, and 3D hardcover book spines with realistic drop shadows).
* **Interactive Royalty Economics:** Authors have access to an interactive 80/20 slider simulator to project future sales volumes and threshold eligibility.
* **Live Theme Switcher:** Instant 1-click toggle in the navigation bar supporting:
  1. 🏛️ **Editorial Ivory** (warm literary archival paper & British green)
  2. 🌌 **Midnight Gold** (obsidian guild & gold foil)
  3. ❄️ **Nordic Slate** (minimalist modern Linear/Vercel dark mode)

### 4. Security & Data Isolation
* **Role-Based Access Control (RBAC):** Authors access only their own catalog and tickets through role-scoped JWT tokens.
* **Confidential Internal Notes:** Admins can log private operational notes that are strictly stripped from author payloads at the database controller layer.
* **Real-Time Communication:** Native WebSockets push ticket status changes and new messages bi-directionally without page refreshes.

---

## 5. Key Architectural & Engineering Decisions

```
bookleaf_assignment/
├── client/                     # React + Vite Frontend with Multi-Theme System
│   ├── src/
│   │   ├── components/
│   │   │   ├── author/         # MyBooks (3D Covers & Calculator), SubmitQuery, MyTickets
│   │   │   ├── admin/          # AdminTicketQueue, AdminTicketDetail, AuthorsView, Analytics, KB
│   │   │   ├── Navbar.jsx      # Navigation, Live WebSocket pill, Theme Switcher & Demo Modal
│   │   │   └── LoginPage.jsx   # Auth with 1-click test credentials
│   │   ├── context/            # ThemeContext & AuthContext
│   │   └── index.css           # Design tokens (Editorial Ivory, Nordic Slate, Midnight Gold)
│   └── dist/                   # Production prebuilt bundle for immediate zero-config serving
├── server/                     # Node.js + Express + WebSocket Backend
│   ├── src/
│   │   ├── controllers/        # auth, book, ticket, admin, system controllers
│   │   ├── services/           # ai.service.js (dual-engine), websocket.service.js
│   │   ├── middleware/         # auth.middleware.js (JWT & RBAC data isolation)
│   │   ├── database/           # db.js (better-sqlite3 with WAL mode & auto-seed)
│   │   ├── data/               # bookleaf_sample_data.json & knowledge_base.json
│   │   ├── docs/               # openapi.json (OpenAPI 3.0 specification)
│   │   └── server.js           # Express app, Swagger UI, & WebSocket server
├── bookleaf_sample_data.json   # Official sample dataset (10 authors, 18 books)
├── package.json                # Unified start, test, build, and dev scripts
├── README.md                   # Complete architectural documentation
├── WRITEUP.md                  # 1-page engineering trade-offs writeup
└── SUBMISSION.md               # Submission document
```

1. **SQLite (`better-sqlite3`) with WAL Mode:** Selected for zero-configuration, zero-docker setup for the evaluation team. Provides high-throughput synchronous execution and can be swapped for PostgreSQL in multi-server horizontal deployments.
2. **Native WebSockets (`ws`):** Provides instant push notifications when tickets are created, updated, or responded to without polling.
3. **No Heavy CSS Frameworks:** Built with tailored Vanilla CSS variables, avoiding bulky TailwindCSS dependencies while providing complete control over themes, animations, and responsive layouts.

---

## 6. Known Limitations & Production Roadmap

If expanding this system across BookLeaf’s full 22,000+ title catalog:
1. **Enterprise Vector Search (pgvector):** Ingest historical resolved tickets, printer quality logs, and author contracts into PostgreSQL with `pgvector` HNSW indexes for semantic retrieval.
2. **Automated RazorpayX / Stripe Connect Payouts:** Integrate automated batch NEFT/RTGS disbursements for accounts exceeding ₹1,000 with verified bank details upon admin approval.
3. **Omnichannel Support (Email & WhatsApp):** Connect inbound webhook parsers (SendGrid/Postmark) and the WhatsApp Business API so authors can reply directly from their email or phone.
4. **Author Self-Service Knowledge Base:** Add an intelligent FAQ search with instant deflection suggestions before ticket submission.

---
*Created by **Vidyashree Dagari** for BookLeaf Publishing.*
