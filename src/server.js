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

// Session configuration
const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: true,
    saveUninitialized: false,
    name: 'sessionId',
    rolling: true,
    proxy: true,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000
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

// Debug middleware for session tracking
app.use((req, res, next) => {
    console.log('[Session Debug]', {
        sessionID: req.sessionID,
        hasSession: !!req.session,
        user: req.session?.user?.username || 'none',
        path: req.path
    });
    next();
});

// Attach user to request if authenticated
app.use(attachUser);

// CORS configuration for API endpoints
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? [
            'https://volunteer-backend-cy21.onrender.com',
            'https://sakshamv259.github.io',
            'https://assignment1-github-io.vercel.app'
        ]
        : ['http://localhost:3000', 'http://localhost:8080'],
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

// Middleware to handle authentication for HTML routes
const authenticateHtmlRoute = (req, res, next) => {
    console.log('[Auth Route] Checking authentication for HTML route:', {
        path: req.path,
        hasSession: !!req.session,
        hasUser: !!(req.session && req.session.user),
        referrer: req.get('Referrer')
    });

    if (!req.session || !req.session.user) {
        console.log('[Auth Route] Not authenticated, storing return URL and redirecting to login');
        // Store the requested URL for post-login redirect
        req.session.returnTo = req.originalUrl || req.url;
        return res.redirect('/login');
    }

    // Clear the returnTo if we're successfully accessing a protected route
    if (req.session.returnTo) {
        delete req.session.returnTo;
    }

    console.log('[Auth Route] Authentication successful, proceeding to route');
    next();
};

// Protected routes - require authentication
app.get(['/eventPlanning', '/eventPlanning.html'], authenticateHtmlRoute, (req, res) => {
    console.log(`[${new Date().toISOString()}] Serving eventPlanning.html to user:`, req.session.user.username);
    res.sendFile(path.join(__dirname, 'public', 'eventPlanning.html'));
});

app.get(['/statistics', '/statistics.html'], authenticateHtmlRoute, (req, res) => {
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

app.get('/login', (req, res, next) => {
    // If user is already authenticated, redirect to returnTo or home
    if (req.session && req.session.user) {
        console.log('[Login Route] User already authenticated, redirecting...');
        const returnTo = req.query.returnTo || req.session.returnTo || '/';
        delete req.session.returnTo; // Clean up
        return res.redirect(returnTo);
    }

    // Store returnTo from query parameter into session if present
    if (req.query.returnTo) {
        console.log('[Login Route] Storing returnTo URL:', req.query.returnTo);
        req.session.returnTo = req.query.returnTo;
    }

    console.log('[Login Route] Serving login page');
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