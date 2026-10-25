# LegalConnect — Legal Consultation Platform (MERN + AI-Ready Architecture)

LegalConnect is a production-grade, full-stack legal consultation platform providing role-based portals for **Clients**, **Approved Lawyers**, and **Platform Administrators**. It features real-time WebRTC video consultations with live waiting rooms and in-call controls, Razorpay payment processing, Socket.IO real-time chat, authenticated document sharing, and a verified post-consultation 5-star review system.

---

## 1. Technology Stack

- **Frontend:** React 19, Vite, React Router v7, Tailwind CSS, Lucide React, Socket.IO Client.
- **Backend:** Node.js, Express.js (CommonJS), Socket.IO, Multer, Helmet, CORS, Express-Rate-Limit, Express-Validator.
- **Database:** MongoDB Atlas (with local standalone fallback support) & Mongoose.
- **Authentication:** JWT Access (15m) & Refresh Tokens (7d), Bcrypt password hashing (cost factor 12).
- **Payments:** Razorpay Orders API, HMAC-SHA256 signature verification, rawBody webhook handling.
- **Consultation:** WebRTC peer connection with Socket.IO signaling, device previews, waiting rooms, timers, and call lifecycle state machine.
- **Documents:** Private storage (`backend/uploads/documents`), 15MB file limit, MIME validation, authenticated streaming downloads.

---

## 2. Quick Start & Setup

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB running locally (`mongodb://127.0.0.1:27017/legalconnect`) OR a MongoDB Atlas cluster URI with your current IP whitelisted.

### Installation

1. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Install Frontend Dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

---

## 3. Seed Demo Accounts (Local Development)

The backend includes a safe, idempotent seed script to populate development demo accounts, an approved lawyer profile, and bookable consultation time slots:

```bash
cd backend
npm run seed:demo
```

### Safe Demo Credentials:

| Role | Email | Password | Details |
|---|---|---|---|
| **Client** | `client.demo@example.com` | `ClientDemo@123` | Active client account (`Priya Sharma`) |
| **Lawyer** | `lawyer.demo@example.com` | `LawyerDemo@123` | Approved status, complete profile, 9 bookable future slots (`Adv. Rajesh Verma`) |
| **Admin** | `admin.demo@example.com` | `AdminDemo@123` | Full administrative access to metrics, user accounts, verifications, and disputes |

> **Note:** The seed script is strictly idempotent: running it multiple times updates records safely without creating duplicate users or overwriting existing consultations.

---

## 4. Starting the Application

### 1. Start Backend Dev Server
```bash
cd backend
npm run dev
# Server starts on http://localhost:5000
# Health check: http://localhost:5000/api/health
```

### 2. Start Frontend Dev Server
```bash
cd frontend
npm run dev
# Application starts on http://localhost:5173
```

### 3. Production Frontend Build
```bash
cd frontend
npm run build
# Compiles production assets into frontend/dist with zero errors
```

---

## 5. Environment Configuration

### Backend (`backend/.env`)
```ini
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database Connection (Atlas primary with automatic local fallback)
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority
LOCAL_MONGO_URI=mongodb://127.0.0.1:27017/legalconnect

# JWT Authentication
JWT_SECRET=your_jwt_secret_key
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Razorpay Payment Gateway (Test Mode)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
```

### Frontend (`frontend/.env`)
```ini
VITE_API_URL=http://localhost:5000/api
```

---

## 6. End-to-End Testing Walkthrough

Follow this step-by-step sequence to test all modules:

### Step 1: Browse Public Lawyers & Profile (Client)
1. Open `http://localhost:5173/lawyers`.
2. Observe lawyer cards featuring **Adv. Rajesh Verma**, showing verified badge, rating, specializations, city, and fee.
3. Click on the lawyer card to view the detailed profile (`/lawyers/:id`).
4. Review lawyer bio, education, languages, verified rating breakdown, and genuine client reviews.

### Step 2: Select Slot & Book Appointment (Client)
1. Log in as `client.demo@example.com` / `ClientDemo@123`.
2. On the lawyer profile, select any available time slot button and click **Continue to Booking**.
3. Choose consultation type (**Video Consultation**), add legal notes, and confirm booking.
4. Client is redirected to `/my-appointments` with status `pending`.

### Step 3: Confirm Appointment (Lawyer)
1. Log in via another browser/incognito window as `lawyer.demo@example.com` / `LawyerDemo@123`.
2. Navigate to **Lawyer Dashboard** (`/lawyer-dashboard`).
3. Under the **Consultations** tab, find the pending appointment request and click **Confirm**.
4. The appointment status updates to `confirmed`.

### Step 4: Complete Payment (Client)
1. In the client's window on `/my-appointments`, click **Pay Consultation Fee**.
2. Razorpay checkout modal opens with server-calculated amount.
3. In test mode, complete checkout or test webhook payment capture.
4. Once paid, the client can view and print an official payment receipt via **View Receipt**.

### Step 5: Real-Time Chat & Case Documents
1. In both client and lawyer views, click **Open Chat** on the appointment card.
2. Send messages back and forth in real-time via Socket.IO.
3. Click **Documents** to upload confidential case files (PDF, DOCX, images).
4. Download or preview uploaded files securely with authenticated access validation.

### Step 6: Join Video Consultation (WebRTC)
1. Both client and lawyer click **Join Video Consultation**.
2. The app navigates to `/video-room/:appointmentId`.
3. In the pre-call waiting room, verify camera and microphone permissions and preview video.
4. Click **Join Consultation** to enter the room.
5. In-call controls: toggle microphone, toggle camera, view elapsed call duration timer.
6. When the meeting concludes, click **End Consultation**.

### Step 7: Post-Consultation Review Prompt & Rating Recalculation
1. As soon as the consultation call ends, the client is immediately presented with the professional **Review Modal**:
   - 5 interactive stars with descriptive quality labels.
   - Specific category ratings: Communication, Professionalism, Clarity of Advice, Punctuality.
   - Written feedback textarea.
2. Submit the review.
3. The server validates that only the appointment's client can review, verifies that the appointment is completed, prevents duplicate reviews (HTTP 409), and recalculates the lawyer's average rating in MongoDB.
4. Return to the lawyer's public profile (`/lawyers/:id`) to see the verified review and updated star rating!

### Step 8: Administrative Governance & Lawyer Verification (Admin)
1. Log in as `admin.demo@example.com` / `AdminDemo@123`.
2. Access the **Admin Portal** (`/admin`):
   - **Overview:** View real-time platform metrics (total users, approved lawyers, consultations, and revenue).
   - **Lawyer Verification:** Inspect pending applications with complete credentials (State Bar Council, Law College, Graduation Year, Consultation modes, Verification documents) and approve, reject, or request additional information with documented decision reasons.
   - **User Management:** Search and filter accounts; activate or suspend users.
   - **Appointments:** Overview of platform consultations and statuses.
   - **Payments & Refunds:** View transaction IDs and process server-side refunds idempotently.
   - **Review Moderation:** Inspect reported reviews, toggle hide/restore, and trigger lawyer rating recalculations.

### Step 9: Lawyer Onboarding & Application Status (Advocate)
1. Navigate to `/lawyer/signup`.
2. Review benefits, how registration works, and click **Eligibility & Docs** (`/lawyer/documentation`).
3. Complete the 4-step application form:
   - **Step 1:** Personal Details (Full name, email, phone, city, profile image).
   - **Step 2:** Professional Credentials (Bar Council ID, State Bar Council, Law College, Graduation Year, Experience, Practice Areas, Bio).
   - **Step 3:** Consultation Information (Fee in INR, Video / In-Person modes, schedule notes).
   - **Step 4:** Verification Documents (Bar Council Certificate, ID proof, Degree proof, Compliance declaration).
4. Track real-time status: `Pending Review`, `Additional Information Required` (with admin's correction instructions allowing resubmission), `Rejected`, or `Approved`.
5. Upon approval, access the **Lawyer Dashboard** (`/lawyer-dashboard`) with the Advocate Quick-Start Setup Guide to configure slots and start accepting clients!

---

## 7. Platform Pages & Routing Map

| Route | Access | Description |
|---|---|---|
| `/` | Public | Upgraded Legal Services Homepage with dark navy/gold hero, 8 service cards, 7-step workflow, Why Choose Us, connected search, and 10 FAQ accordions |
| `/lawyers` | Public | Filterable lawyer discovery directory (specialization, city, experience, fee) |
| `/lawyers/:lawyerId` | Public | Verified advocate profile, credentials, verified reviews, and bookable slots |
| `/legal-advice` | Public | Legal guidance center, BNS, IPC, CrPC, CPC, and Hindu Marriage Act resources |
| `/ask-question` | Public | Free community legal question submission form |
| `/legal-aid` | Public | Statutory constitutional information under Legal Services Authorities Act, 1987 |
| `/lawyer/signup` | Public / Client | Advocate onboarding landing page and 4-step verification wizard with real-time status tracking |
| `/lawyer/documentation` | Public | Professional eligibility requirements, accepted document formats (PDF/JPG/PNG up to 15MB), review steps, and correction guidelines |
| `/dashboard` | Client | Client consultations portal, upcoming video sessions, and booking navigation |
| `/my-appointments` | Client | Booked consultations list, payment checkout, WebRTC meeting link, case documents, and review modal |
| `/lawyer-dashboard` | Approved Lawyer | Professional portal with quick-start setup guide, slot management, appointments, earnings, reviews, and profile settings |
| `/admin` | Administrator | Platform administration portal for metrics, lawyer verification, user management, payments, refunds, and review moderation |
| `/video-room/:id` | Authenticated | Live WebRTC video consultation room with waiting room, camera/mic preview, and duration timer |

---

## 8. Security & Architectural Highlights

- **Server-Side Authorization:** Every appointment, message, document, and review is verified on the backend against the authenticated user's ID and role.
- **Financial Integrity:** Payment amounts are calculated exclusively on the server from the lawyer's database fee; client-side price tampering is completely prevented.
- **Private Document Isolation:** Legal documents are stored outside publicly served static directories and streamed with short-lived session authorization.
- **Robust Database Transactions:** Multi-document operations support MongoDB replica sets while gracefully adapting to standalone local databases.
- **Zero Placeholder Data:** All dashboards, metrics, reviews, and appointment states derive directly from MongoDB collections.

