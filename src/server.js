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

// Static files - serve before any middleware
app.use(express.static(path.join(__dirname, 'public')));

// CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? ['https://sakshamv259.github.io', 'https://assignment1-github-io.vercel.app']
    : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500', 'http://localhost:8080'];

console.log('Allowed Origins:', allowedOrigins);
console.log('Environment:', process.env.NODE_ENV);

const corsOptions = {
    origin: function (origin, callback) {
        console.log('Request origin:', origin);
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Set-Cookie']
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: true,
    saveUninitialized: false,
    name: 'sessionId',
    rolling: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        domain: process.env.NODE_ENV === 'production' ? '.render.com' : undefined
    },
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        ttl: 24 * 60 * 60 // 24 hours
    })
}));

// Debug middleware
app.use((req, res, next) => {
    console.log('Request:', {
        method: req.method,
        path: req.path,
        origin: req.headers.origin,
        sessionID: req.sessionID,
        authenticated: req.session?.authenticated,
        cookies: req.cookies,
        body: req.method === 'POST' ? req.body : undefined
    });
    next();
});

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
        uptime: process.uptime()
    });
});

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
    console.error(err.stack);
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