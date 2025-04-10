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

// Trust proxy for Render deployments
app.set('trust proxy', 1);

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

// CORS configuration - using simple cors middleware for reliability
app.use(cors({
    origin: function(origin, callback) {
        const allowedOrigins = [
            'https://volunteer-backend-cy21.onrender.com',
            'https://sakshamv259.github.io',
            'https://assignment1-github-io.vercel.app',
            'http://localhost:3000', 
            'http://localhost:8080',
            'http://localhost:5500',
            'http://127.0.0.1:5500'
        ];
        
        // Allow requests with no origin (mobile apps, curl, etc)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            console.warn(`[CORS] Blocked request from unauthorized origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
}));

// Body parsing middleware - placed before routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'volunteer-secret-key',
    resave: true,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
};

// Configure session store and cookies based on environment
if (process.env.NODE_ENV === 'production') {
    sessionConfig.cookie.secure = true;
    sessionConfig.cookie.sameSite = 'none';
    
    // Only add MongoDB store in production to prevent local dev issues
    sessionConfig.store = MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        ttl: 24 * 60 * 60,
        autoRemove: 'native',
        touchAfter: 24 * 60 * 60
    });
}

// Apply session middleware
app.use(session(sessionConfig));

// Attach user to request if authenticated
app.use(attachUser);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/gallery', galleryRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV || 'development'
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

// Enhanced API endpoint to check authentication status
app.get('/api/auth/check', (req, res) => {
    const isAuthenticated = !!(req.session && req.session.user);
    const currentUrl = req.get('Referer') || req.query.currentUrl;
    const clientIP = req.ip;
    
    console.log('[Auth Check] Status:', { 
        isAuthenticated, 
        sessionID: req.sessionID,
        user: isAuthenticated ? req.session.user.username : null,
        currentUrl,
        returnTo: req.session?.returnTo,
        timestamp: new Date().toISOString(),
        clientIP,
        userAgent: req.get('User-Agent')
    });

    // If there's a current URL and user is not authenticated, store it for later redirect
    if (!isAuthenticated && currentUrl && !currentUrl.includes('/login')) {
        req.session.returnTo = currentUrl;
        req.session.lastAttemptedAccess = {
            url: currentUrl,
            timestamp: new Date().toISOString(),
            userAgent: req.get('User-Agent'),
            ip: clientIP
        };
        console.log('[Auth Check] Stored access attempt:', req.session.lastAttemptedAccess);
    }

    res.json({ 
        success: true,
        isAuthenticated,
        user: isAuthenticated ? {
            username: req.session.user.username,
            lastAccess: new Date().toISOString()
        } : null,
        returnTo: isAuthenticated ? (req.session.returnTo || '/') : undefined,
        sessionExpiry: req.session?.cookie?.expires
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'production' ? null : err.message
    });
});

// 404 handler
app.use((req, res) => {
    console.log(`[404] Not Found: ${req.method} ${req.url}`);
    res.status(404).json({
        success: false,
        message: 'Not found'
    });
});

// Set port and start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}); 