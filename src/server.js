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
const galleryRoutes = require('./routes/galleryRoutes');

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Debug middleware for logging requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// CORS configuration for API endpoints
const corsOptions = {
    origin: true,
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
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
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
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/gallery', galleryRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        env: process.env.NODE_ENV
    });
});

// Serve HTML files for all routes
const routes = {
    '': 'index.html',
    'about': 'about.html',
    'contact': 'contact.html',
    'events': 'events.html',
    'gallery': 'gallery.html',
    'news': 'news.html',
    'opportunities': 'opportunities.html',
    'event-planning': 'event-planning.html',
    'login': 'login.html',
    'statistics': 'statistics.html'
};

// Route handler for all pages
Object.entries(routes).forEach(([route, file]) => {
    app.get(`/${route}`, (req, res) => {
        res.sendFile(path.join(__dirname, 'public', file));
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        success: false, 
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Handle 404
app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        message: 'Route not found' 
    });
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
}); 