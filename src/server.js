const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const connectDB = require('./config/database');
const { attachUser, isAuthenticated } = require('./middleware/auth');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const galleryRoutes = require('./routes/galleryRoutes');

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Debug middleware for logging requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    if (req.session && req.session.user) {
        console.log(`Authenticated user: ${req.session.user.username}`);
    }
    next();
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// CORS configuration for API endpoints
const corsOptions = {
    origin: ['https://volunteer-backend-cy21.onrender.com', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin'],
    exposedHeaders: ['Set-Cookie']
};

// Trust first proxy for secure cookies
app.enable('trust proxy');
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    name: 'sessionId',
    rolling: true,
    proxy: true,
    cookie: {
        httpOnly: true,
        secure: true, // Always true for Render deployment
        sameSite: 'none', // Required for cross-origin cookies
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        ttl: 24 * 60 * 60,
        autoRemove: 'native',
        touchAfter: 24 * 3600,
        crypto: {
            secret: process.env.SESSION_SECRET || 'your-secret-key'
        }
    })
};

// Apply session middleware
app.use(session(sessionConfig));

// Attach user to request if authenticated
app.use(attachUser);

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/gallery', require('./routes/galleryRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        env: process.env.NODE_ENV
    });
});

// Protected routes - require authentication
app.get(['/eventPlanning', '/eventPlanning.html'], isAuthenticated, (req, res) => {
    console.log(`[${new Date().toISOString()}] Serving eventPlanning.html to user:`, req.session.user.username);
    res.sendFile(path.join(__dirname, 'public', 'eventPlanning.html'));
});

app.get(['/statistics', '/statistics.html'], isAuthenticated, (req, res) => {
    console.log(`[${new Date().toISOString()}] Serving statistics.html to user:`, req.session.user.username);
    res.sendFile(path.join(__dirname, 'public', 'statistics.html'));
});

// Public routes with enhanced logging
app.get(['/gallery', '/gallery.html'], (req, res) => {
    console.log(`[${new Date().toISOString()}] Serving gallery.html`);
    res.sendFile(path.join(__dirname, 'public', 'gallery.html'));
});

app.get(['/events', '/events.html'], (req, res) => {
    console.log(`[${new Date().toISOString()}] Serving events.html`);
    res.sendFile(path.join(__dirname, 'public', 'events.html'));
});

app.get('/news', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'news.html'));
});

app.get('/opportunities', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'opportunities.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint to check authentication status
app.get('/api/auth/check', (req, res) => {
    const isAuthenticated = !!(req.session && req.session.user);
    console.log('[Auth Check] Status:', { 
        isAuthenticated, 
        sessionID: req.sessionID,
        user: isAuthenticated ? req.session.user.username : null
    });
    res.json({ 
        success: true,
        isAuthenticated,
        user: isAuthenticated ? req.session.user : null
    });
});

// Error handling middleware with improved logging
app.use((err, req, res, next) => {
    console.error(`[${new Date().toISOString()}] Error:`, {
        url: req.url,
        method: req.method,
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
    res.status(500).json({ 
        success: false, 
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Handle 404 - Keep this as the last route
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
}); 