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
const viewRoutes = require('./routes/viewRoutes');

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files - before any middleware
app.use(express.static(path.join(__dirname, 'public')));

// CORS configuration - must come before other middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://volunteer-backend-cy21.onrender.com', 'http://volunteer-backend-cy21.onrender.com']
        : ['http://localhost:8080', 'http://127.0.0.1:8080'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin'],
    exposedHeaders: ['Set-Cookie']
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_super_secret_key_here',
    resave: true,
    saveUninitialized: false,
    name: 'sessionId',
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        ttl: 24 * 60 * 60 // 1 day
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
        domain: process.env.NODE_ENV === 'production' ? '.volunteer-backend-cy21.onrender.com' : undefined
    },
    rolling: true
}));

// Attach user to all responses
app.use(attachUser);

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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/', viewRoutes); // EJS rendered routes should come last

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    if (req.accepts('html')) {
        // Render error page for browser requests
        res.status(500).render('error', { 
            message: 'Something went wrong!',
            error: process.env.NODE_ENV === 'development' ? err : {}
        });
    } else {
        // Send JSON response for API requests
        res.status(500).json({ 
            message: 'Something went wrong!', 
            error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error' 
        });
    }
});

// Handle 404
app.use((req, res) => {
    if (req.accepts('html')) {
        res.status(404).render('404');
    } else {
        res.status(404).json({ message: 'Route not found' });
    }
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 