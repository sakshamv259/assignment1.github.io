const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const connectDB = require('./config/database');
const { attachUser } = require('./middleware/auth');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Static files - serve before any middleware
app.use(express.static(path.join(__dirname, 'public')));

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://volunteer-connect.onrender.com']
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Set-Cookie']
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: true,
    saveUninitialized: false,
    name: 'sessionId',
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        ttl: 24 * 60 * 60 // 24 hours
    })
}));

// Attach user to request if authenticated
app.use((req, res, next) => {
    console.log('Session middleware:', {
        sessionID: req.sessionID,
        session: req.session,
        authenticated: req.session?.authenticated,
        user: req.session?.user
    });
    next();
});

// Debug middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, {
        sessionId: req.sessionID,
        hasSession: !!req.session,
        user: req.session?.user,
        body: req.body,
        query: req.query,
        params: req.params
    });
    next();
});

// Debug middleware for session tracking
app.use((req, res, next) => {
    console.log('Session debug:', {
        sessionID: req.sessionID,
        session: req.session,
        authenticated: req.session?.authenticated,
        user: req.session?.user,
        cookies: req.cookies,
        method: req.method,
        path: req.path
    });
    next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve HTML files for other routes
const routes = ['about', 'contact', 'events', 'gallery', 'news', 'opportunities', 'event-planning', 'login'];
routes.forEach(route => {
    app.get(`/${route}`, (req, res) => {
        res.sendFile(path.join(__dirname, 'public', `${route}.html`));
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        message: 'Something went wrong!', 
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error' 
    });
});

// Handle 404
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 