# 🛡️ SafeRoute Circle — Modern Women Safety & Journey Sharing Platform

**SafeRoute Circle** is a full-stack safety-technology product built to empower women to travel smarter using facility-backed route comparison safety data and stay connected with trusted contacts during active journeys.

---

## 🌟 Key Features

1. **🗺️ SafeRoute Comparison Engine**:
   - Compare available routes using facility density (24/7 pharmacies, police booths, transit stations, hospitals), street illumination index, main road coverage, and community reports.
   - Computes transparent **Safety Information Scores** (0–100) with detailed route breakdowns.
   - Includes important ethical disclaimers (noting scores represent available data rather than absolute safety guarantees).

2. **👥 Trusted Circle Management**:
   - Add, edit, verify, or remove family members and trusted friends (e.g., Mom, Sister, Friend).
   - Set contact-specific default sharing preferences (`Live Location` vs `Status Only`).

3. **📍 Active Journey & Real-Time Tracking**:
   - Live location stream powered by **Socket.IO** rooms.
   - Interactive Leaflet map displaying real-time movement along selected routes, safety markers, and active trusted contact indicators.
   - Simulation controls (Normal speed, Fast Forward, Pause) for hackathons and demo reviews.
   - **💚 "I'm Safe"** completion trigger that stops sharing and notifies trusted contacts instantly.
   - **Arrival Check Timer / Prompt**: Automatic "Have you reached your destination?" popup upon arrival.

4. **🔗 Secure Public Journey Share View**:
   - Encrypted share token links (`/share/:shareToken`) allowing trusted contacts to follow journey progress live on any device without requiring login.

5. **📜 Journey History Dashboard**:
   - Review past trip logs, safety scores, notified contact summaries, and delete history items.

6. **🔒 Authentication & Privacy**:
   - User Sign Up & Login with `bcryptjs` password hashing and `JWT` token authentication.
   - Privacy controls: Active-journey-bound location sharing (never continuous background tracking).

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide React Icons, Leaflet Maps (`leaflet`), Socket.IO Client (`socket.io-client`).
- **Backend**: Node.js, Express, Socket.IO Server (`socket.io`), JSON Web Tokens (`jsonwebtoken`), Bcrypt (`bcryptjs`).
- **Build System**: Vite, `tsx`, `esbuild`.

---

## 📁 Directory Structure

```text
├── server.ts                 # Full-stack Express + Socket.IO server & REST API
├── index.html                # Main HTML entry with Leaflet CSS CDN
├── metadata.json             # Applet metadata
├── package.json              # NPM dependencies and full-stack scripts
├── tsconfig.json             # TypeScript compiler settings
├── vite.config.ts            # Vite configuration
├── .env.example              # Environment variables template
│
└── src/
    ├── main.tsx              # React entry point
    ├── App.tsx               # Main application controller & state router
    ├── index.css             # Tailwind CSS global styles
    ├── types.ts              # TypeScript interface definitions
    │
    ├── data/
    │   └── mockData.ts       # Sample routes, safety markers, demo user dataset
    │
    ├── services/
    │   └── api.ts            # API client wrapper for Auth, Contacts, Journeys & Socket.IO
    │
    ├── components/
    │   ├── Navbar.tsx        # Responsive desktop/mobile header
    │   ├── MobileBottomNav.tsx # Mobile bottom bar navigation
    │   ├── Footer.tsx        # App footer with disclaimers
    │   ├── LeafletMap.tsx    # Interactive map component with safety markers
    │   ├── Toast.tsx         # Toast notification container
    │   └── AuthModal.tsx     # Login / Sign Up modal
    │
    └── pages/
        ├── HomePage.tsx            # Page 1: Hero & feature workflow
        ├── SafeRoutePage.tsx       # Page 2: Route comparison matrix & planner
        ├── TrustedCirclePage.tsx   # Page 3: Trusted contact manager
        ├── StartJourneyPage.tsx    # Page 4: Journey setup & contact selection
        ├── ActiveJourneyPage.tsx   # Page 5: Live journey tracking dashboard
        ├── MyJourneysPage.tsx      # Page 6: Journey history logs
        ├── SharedJourneyPage.tsx   # Page 7: Public trusted contact share view
        ├── AboutPage.tsx           # Page 8: Safety methodology & ethics
        └── ProfilePage.tsx         # Page 9: User profile & privacy settings
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` or configure variables in your deployment environment:

```env
# GEMINI_API_KEY: Optional AI key
GEMINI_API_KEY="YOUR_GEMINI_KEY"

# APP_URL: Service host URL
APP_URL="http://localhost:3000"

# JWT_SECRET: Secret key for signing JWT tokens
JWT_SECRET="saferoute_circle_super_secret_jwt_key"

# MONGODB_URI: Optional MongoDB connection string (app falls back to resilient in-memory store if unset)
MONGODB_URI="mongodb://localhost:27017/saferoute_circle"
```

---

## 🚀 How to Run

### Development Mode

Run the full-stack server (Express + Socket.IO + Vite dev middleware) on port `3000`:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

### Production Build & Start

Build the client assets with Vite and bundle `server.ts` with `esbuild`:

```bash
npm run build
npm start
```

---

## 🗺️ How to Connect Real Maps APIs

The application uses Leaflet with OpenStreetMap tiles out of the box (requiring zero API key configuration).

To connect Google Maps or Mapbox:
1. Replace `LeafletMap.tsx` with `@react-google-maps/api` or `mapbox-gl`.
2. Provide your API key in `import.meta.env.VITE_MAPS_API_KEY`.
3. Update coordinate paths in `mockData.ts` or connect a routing server (e.g., OSRM / Google Directions API).

---

## 🍃 How to Connect MongoDB

The Express server in `server.ts` includes an in-memory database store for high-speed demo environments.

To connect MongoDB:
1. Install Mongoose: `npm install mongoose`
2. Define `User`, `TrustedContact`, and `Journey` schemas matching `types.ts`.
3. Call `mongoose.connect(process.env.MONGODB_URI!)` inside `server.ts` before starting the HTTP server.

---

## ✨ Testing Demo Mode

1. Click the **Demo Mode** badge on the top right bar to enable test data.
2. Click **Plan a SafeRoute** -> Enter destination -> Click **Find Routes**.
3. Select **Route A (Recommended)** -> Click **Select Route**.
4. Choose trusted contacts (e.g. Mom, Sister) -> Click **Start Journey Now**.
5. Watch the live animated marker move along the route in real-time or speed up using **5x Speed**.
6. Open the **Trusted Contact Link** in a new browser tab to test live sharing.
7. Click **I'm Safe** to complete the journey and notify your circle!
