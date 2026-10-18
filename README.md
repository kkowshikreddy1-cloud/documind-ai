# DocuMind AI
> **Multimodal Document Intelligence & Decision Support System**  
> *"Understand. Prove. Decide."*  
> Built for HackNex 2026 Internal Qualifier (Problem Statement HNX26PSI01).

---

## 🚀 Overview

**DocuMind AI** is an enterprise-grade AI analyst that bridges complex multi-modal documents (unstructured text, multi-column tables, visual trend charts, downtime graphs, and scanned pages) with rigorous decision-support workflows.

Core Axiom: **"Every important answer must be traceable to evidence."**

---

## 💡 Key Features & Innovations

1. **True Multimodal Extraction**:
   - High-fidelity 150 DPI page rendering (`PyMuPDF`) & page thumbnail generation.
   - Table intelligence with markdown and structured JSON serialization (`pdfplumber`).
   - Chart and drawing detection with bounding-box extraction.
   - Text chunking preserving document provenance (`document_id`, `page_number`, `source_reference`).

2. **Multimodal AI Reasoning Engine**:
   - Integration with Google Gemini (`gemini-2.5-flash` / `gemini-1.5-pro`) and zero-latency local fallback reasoner.
   - Step-by-step verified mathematical reasoning (e.g. `13,000 - 10,000 = +3,000 (+30%)`, `94% - 82% = 12 percentage points`).
   - Clear classification tags: **FACT** (document quote), **INFERENCE** (extrapolated logic), and **RECOMMENDATION** (management suggestion).

3. **Interactive Evidence Inspector (Drawer)**:
   - Clicking any citation (`Page 3 — Efficiency Trend Chart`) opens a high-resolution page canvas highlighting the verified source snippet.

4. **Automated Insights Engine**:
   - Cross-modal discovery categorized into **📈 Trends**, **⚠️ Risks**, **🔎 Anomalies**, and **💡 Opportunities**.

5. **Decision Support & Action Plan**:
   - Converts findings into prioritized management actions (High / Medium / Low).
   - Interactive status toggles (`Not Started` ➔ `In Progress` ➔ `Completed`) persisted in SQLite.

6. **Scenario Lab (What-If Simulation)**:
   - Interactive parameters (Downtime reduction %, Production cadence, Stoppage cost).
   - Real-time Recharts visualization with strict disclaimer: *"Scenario estimate — not a guaranteed prediction."*

7. **One-Click Realistic Demo**:
   - Pre-packaged with a 6-page corporate operations report (*AeroTech Global Operations Report 2025*):
     - Page 1: Executive Summary & Management Discussion
     - Page 2: Quarterly Production Breakdown Table
     - Page 3: Production Efficiency Trend Chart
     - Page 4: Machine Downtime & Incident Root Cause Chart
     - Page 5: Workforce Robotics Training Log
     - Page 6: Quality Assurance & Defect Analysis Table

---

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts.
- **Backend**: Python 3.14 / 3.11+, FastAPI, Uvicorn, SQLite, ReportLab.
- **Document Intelligence**: PyMuPDF (`fitz`), `pdfplumber`, `Pillow`.
- **AI / VLM**: Google Gemini API (`google-genai`).

---

## 🏃 Quick Start Instructions

### 1. Start the FastAPI Backend
```bash
# In the project root:
& "C:\Users\KOWSHIK REDDY\AppData\Local\Python\bin\python.exe" -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend API and static page server will be live at `http://127.0.0.1:8000`.

### 2. Start the React Frontend
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Sign in
The app opens on a sign-in page. Either:
- choose **Create account** (name, email, and a password of 8+ characters), or
- click **Explore with a demo account** to enter a shared workspace without signing up.

How it works:
- Passwords are hashed with scrypt. Sessions are random tokens, and only their SHA-256 digest is stored.
- **Keep me signed in on this device** keeps you signed in for 30 days. Without it, you stay signed in for 12 hours or until you close the tab.
- After 5 wrong passwords for the same email within 5 minutes, sign-in pauses for that email and the page shows a countdown.
- Every `/api/...` data route requires sign-in. `/api/health` and `/api/auth/...` are open.
- Accounts live in the local SQLite database (`backend/documind.db`). Documents and history are shared by everyone who signs in to the same server.
- On a server other people can reach, set `ALLOW_DEMO_LOGIN=false` in `.env` to remove the demo button.

### 4. Demo Walkthrough
1. Sign in, then on the **Dashboard**, click **"Try Demo Report"**.
2. Go to **AI Analyst** and click any of the 8 pre-loaded questions:
   - *"What was the production in Q4?"*
   - *"Which quarter had the highest efficiency?"*
   - *"How much did production increase from Q2 to Q4?"*
   - *"Why did efficiency improve?"*
   - *"What are the biggest operational problems?"*
   - *"How can we improve production efficiency?"*
   - *"What should management prioritize first?"*
   - *"What happens if machine downtime is reduced by 20%?"*
3. Click any **Page Citation** (e.g. `📄 Page 3`) to slide open the **Evidence Drawer** and visually inspect the rendered page.
4. Explore **Insights**, toggle tasks in the **Action Plan**, and adjust the slider in **Scenario Lab**.

---

## 🔒 Environment Configuration

Create a `.env` file in the root directory (optional, if using Gemini API):
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
ALLOW_DEMO_LOGIN=true
```
*Note: If no API key is provided, DocuMind seamlessly uses its local deterministic multimodal reasoning engine.*
