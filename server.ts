import express from 'express';
import http from 'http';
import path from 'path';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Server as SocketIOServer } from 'socket.io';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'saferoute_circle_super_secret_jwt_key';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

app.use(cors());
app.use(express.json());

// In-Memory Database for rapid full-stack performance (resilient, no MongoDB external setup needed)
const users: Record<string, any> = {
  'usr_demo_1': {
    id: 'usr_demo_1',
    name: 'Ananya Sharma',
    email: 'ananya.sharma@example.com',
    passwordHash: bcrypt.hashSync('password123', 10),
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date().toISOString(),
    settings: {
      locationSharingPreference: 'active_journey_only',
      saveJourneyHistory: true,
    },
  },
};

const trustedContacts: Record<string, any[]> = {
  'usr_demo_1': [
    {
      id: 'tc_1',
      userId: 'usr_demo_1',
      name: 'Mom',
      contact: '+91 98765 43210',
      relationship: 'Mom',
      verificationStatus: 'Verified',
      sharingPreference: 'Live Location',
    },
    {
      id: 'tc_2',
      userId: 'usr_demo_1',
      name: 'Priya (Sister)',
      contact: '+91 98765 43211',
      relationship: 'Sister',
      verificationStatus: 'Verified',
      sharingPreference: 'Live Location',
    },
    {
      id: 'tc_3',
      userId: 'usr_demo_1',
      name: 'Sneha (Friend)',
      contact: 'sneha.k@example.com',
      relationship: 'Friend',
      verificationStatus: 'Pending',
      sharingPreference: 'Status Only',
    },
  ],
};

const journeys: Record<string, any> = {};

// Sample initial history journey
const initialHistId = 'jrn_hist_1';
journeys[initialHistId] = {
  id: initialHistId,
  userId: 'usr_demo_1',
  shareToken: 'share_demo_token_123',
  startLocation: {
    address: 'Central Square Metro Station, North Gate',
    lat: 28.6139,
    lng: 77.2090,
  },
  destination: {
    address: 'University Women\'s Hostel & Tech Campus',
    lat: 28.6328,
    lng: 77.2197,
  },
  selectedRoute: {
    id: 'route_a',
    name: 'Route A — Grand Avenue & Metro Corridor',
    tag: 'Recommended',
    distanceKm: 4.2,
    durationMin: 15,
    safetyScore: 86,
    safetyStatus: 'Higher available safety information',
    safetyBadgeColor: 'green',
    publicFacilitiesCount: 14,
    mainRoadPercentage: 92,
    lightingRating: 'Excellent',
    reportedIncidentsNearby: 'Low',
  },
  trustedContacts: [
    { name: 'Mom', relationship: 'Mom' },
    { name: 'Priya (Sister)', relationship: 'Sister' },
  ],
  startTime: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  expectedArrival: new Date(Date.now() - 24 * 3600 * 1000 + 15 * 60 * 1000).toISOString(),
  endTime: new Date(Date.now() - 24 * 3600 * 1000 + 14 * 60 * 1000).toISOString(),
  status: 'completed',
  sharingPreference: 'Live Location',
  progressPercent: 100,
  locationHistory: [],
  lastUpdateNote: 'Completed — User confirmed I\'m Safe',
};

// --- AUTH MIDDLEWARE ---
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = decoded;
    next();
  });
};

// --- AUTH API ROUTES ---
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const existing = Object.values(users).find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'User with this email already exists' });
  }

  const id = `usr_${Date.now()}`;
  const passwordHash = bcrypt.hashSync(password, 10);
  const newUser = {
    id,
    name,
    email,
    passwordHash,
    profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    createdAt: new Date().toISOString(),
    settings: {
      locationSharingPreference: 'active_journey_only',
      saveJourneyHistory: true,
    },
  };

  users[id] = newUser;
  trustedContacts[id] = [
    {
      id: `tc_${Date.now()}_1`,
      userId: id,
      name: 'Mom',
      contact: '+91 98765 00000',
      relationship: 'Mom',
      verificationStatus: 'Verified',
      sharingPreference: 'Live Location',
    },
  ];

  const token = jwt.sign({ id, email: newUser.email, name: newUser.name }, JWT_SECRET, { expiresIn: '7d' });
  const { passwordHash: _, ...userWithoutPassword } = newUser;

  res.status(201).json({ token, user: userWithoutPassword });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = Object.values(users).find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const isValidPassword = bcrypt.compareSync(password, user.passwordHash);
  if (!isValidPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
  const { passwordHash: _, ...userWithoutPassword } = user;

  res.json({ token, user: userWithoutPassword });
});

app.get('/api/auth/me', authenticateToken, (req: any, res) => {
  const user = users[req.user.id];
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const { passwordHash, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword });
});

// --- TRUSTED CONTACTS API ROUTES ---
app.get('/api/contacts', authenticateToken, (req: any, res) => {
  const userId = req.user.id;
  const list = trustedContacts[userId] || [];
  res.json(list);
});

app.post('/api/contacts', authenticateToken, (req: any, res) => {
  const userId = req.user.id;
  const { name, contact, relationship, sharingPreference } = req.body;

  if (!name || !contact) {
    return res.status(400).json({ error: 'Name and contact are required' });
  }

  const newContact = {
    id: `tc_${Date.now()}`,
    userId,
    name,
    contact,
    relationship: relationship || 'Friend',
    verificationStatus: 'Verified',
    sharingPreference: sharingPreference || 'Live Location',
  };

  if (!trustedContacts[userId]) {
    trustedContacts[userId] = [];
  }
  trustedContacts[userId].push(newContact);

  res.status(201).json(newContact);
});

app.put('/api/contacts/:id', authenticateToken, (req: any, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const list = trustedContacts[userId] || [];
  const idx = list.findIndex((c) => c.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: 'Contact not found' });
  }

  list[idx] = { ...list[idx], ...req.body };
  res.json(list[idx]);
});

app.delete('/api/contacts/:id', authenticateToken, (req: any, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const list = trustedContacts[userId] || [];
  trustedContacts[userId] = list.filter((c) => c.id !== id);
  res.json({ success: true, id });
});

// --- JOURNEYS API ROUTES ---
app.get('/api/journeys', authenticateToken, (req: any, res) => {
  const userId = req.user.id;
  const userJourneys = Object.values(journeys).filter((j) => j.userId === userId);
  res.json(userJourneys);
});

app.post('/api/journeys', authenticateToken, (req: any, res) => {
  const userId = req.user.id;
  const { startLocation, destination, selectedRoute, trustedContacts: contactsList, sharingPreference } = req.body;

  const id = `jrn_${Date.now()}`;
  const shareToken = `st_${Math.random().toString(36).substring(2, 10)}${Date.now()}`;

  const durationMin = selectedRoute?.durationMin || 15;
  const startTime = new Date().toISOString();
  const expectedArrival = new Date(Date.now() + durationMin * 60 * 1000).toISOString();

  const newJourney = {
    id,
    userId,
    shareToken,
    startLocation,
    destination,
    selectedRoute,
    trustedContacts: contactsList || [],
    startTime,
    expectedArrival,
    status: 'active',
    sharingPreference: sharingPreference || 'Live Location',
    currentLocation: startLocation ? { lat: startLocation.lat, lng: startLocation.lng } : undefined,
    progressPercent: 0,
    locationHistory: [
      {
        lat: startLocation?.lat || 28.6139,
        lng: startLocation?.lng || 77.2090,
        timestamp: startTime,
      },
    ],
    lastUpdateNote: 'Journey started',
  };

  journeys[id] = newJourney;
  io.to(`journey:${id}`).emit('journey_started', newJourney);

  res.status(201).json(newJourney);
});

app.get('/api/journeys/:id', authenticateToken, (req: any, res) => {
  const journey = journeys[req.params.id];
  if (!journey) {
    return res.status(404).json({ error: 'Journey not found' });
  }
  res.json(journey);
});

app.get('/api/journeys/share/:token', (req, res) => {
  const journey = Object.values(journeys).find((j) => j.shareToken === req.params.token);
  if (!journey) {
    return res.status(404).json({ error: 'Journey share link invalid or expired' });
  }

  // Filter out non-essential secrets
  const user = users[journey.userId];
  res.json({
    ...journey,
    userName: user ? user.name : 'Trusted Contact User',
  });
});

app.post('/api/journeys/:id/start', authenticateToken, (req: any, res) => {
  const journey = journeys[req.params.id];
  if (!journey) return res.status(404).json({ error: 'Journey not found' });

  journey.status = 'active';
  journey.startTime = new Date().toISOString();
  io.to(`journey:${journey.id}`).emit('status_changed', { journeyId: journey.id, status: 'active', note: 'Journey started' });
  res.json(journey);
});

app.post('/api/journeys/:id/complete', authenticateToken, (req: any, res) => {
  const journey = journeys[req.params.id];
  if (!journey) return res.status(404).json({ error: 'Journey not found' });

  journey.status = 'completed';
  journey.progressPercent = 100;
  journey.endTime = new Date().toISOString();
  journey.lastUpdateNote = 'Completed — User confirmed I\'m Safe';

  io.to(`journey:${journey.id}`).emit('status_changed', {
    journeyId: journey.id,
    status: 'completed',
    note: journey.lastUpdateNote,
  });

  res.json(journey);
});

app.post('/api/journeys/:id/end', authenticateToken, (req: any, res) => {
  const journey = journeys[req.params.id];
  if (!journey) return res.status(404).json({ error: 'Journey not found' });

  journey.status = 'cancelled';
  journey.endTime = new Date().toISOString();
  journey.lastUpdateNote = 'Journey ended by user';

  io.to(`journey:${journey.id}`).emit('status_changed', {
    journeyId: journey.id,
    status: 'cancelled',
    note: journey.lastUpdateNote,
  });

  res.json(journey);
});

app.post('/api/journeys/:id/location', authenticateToken, (req: any, res) => {
  const journey = journeys[req.params.id];
  if (!journey) return res.status(404).json({ error: 'Journey not found' });

  const { lat, lng, speed, progressPercent } = req.body;
  journey.currentLocation = { lat, lng };
  if (typeof progressPercent === 'number') {
    journey.progressPercent = Math.min(100, Math.max(0, progressPercent));
  }
  journey.locationHistory.push({ lat, lng, speed, timestamp: new Date().toISOString() });

  io.to(`journey:${journey.id}`).emit('location_updated', {
    journeyId: journey.id,
    currentLocation: { lat, lng },
    progressPercent: journey.progressPercent,
    timestamp: new Date().toISOString(),
  });

  res.json({ success: true, journey });
});

app.delete('/api/journeys/:id', authenticateToken, (req: any, res) => {
  const journey = journeys[req.params.id];
  if (!journey) return res.status(404).json({ error: 'Journey not found' });
  delete journeys[req.params.id];
  res.json({ success: true, id: req.params.id });
});

// --- SOCKET.IO REALTIME ENGINE ---
io.on('connection', (socket) => {
  console.log('⚡ Socket client connected:', socket.id);

  socket.on('join_journey', (journeyId: string) => {
    const roomName = `journey:${journeyId}`;
    socket.join(roomName);
    console.log(`Socket ${socket.id} joined room ${roomName}`);
    if (journeys[journeyId]) {
      socket.emit('journey_state', journeys[journeyId]);
    }
  });

  socket.on('update_location', (data: { journeyId: string; lat: number; lng: number; progressPercent?: number }) => {
    const { journeyId, lat, lng, progressPercent } = data;
    const j = journeys[journeyId];
    if (j && j.status === 'active') {
      j.currentLocation = { lat, lng };
      if (typeof progressPercent === 'number') {
        j.progressPercent = Math.min(100, Math.max(0, progressPercent));
      }
      j.locationHistory.push({ lat, lng, timestamp: new Date().toISOString() });

      io.to(`journey:${journeyId}`).emit('location_updated', {
        journeyId,
        currentLocation: { lat, lng },
        progressPercent: j.progressPercent,
        timestamp: new Date().toISOString(),
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket client disconnected:', socket.id);
  });
});

// --- VITE MIDDLEWARE & PROD STATIC SERVING ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🛡️ SafeRoute Circle Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
