const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const Event = require('../models/Event');

// Home page
router.get('/', async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1 }).limit(3);
        res.render('index', { 
            title: 'Home',
            events
        });
    } catch (error) {
        console.error('Error:', error);
        res.render('index', { 
            title: 'Home',
            events: []
        });
    }
});

// Events page
router.get('/events', isAuthenticated, async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1 });
        res.render('events', {
            title: 'Events',
            events
        });
    } catch (error) {
        console.error('Error:', error);
        res.render('events', {
            title: 'Events',
            events: [],
            error: 'Failed to load events'
        });
    }
});

// News page
router.get('/news', async (req, res) => {
    try {
        res.render('news', {
            title: 'Latest News'
        });
    } catch (error) {
        console.error('Error:', error);
        res.render('error', {
            message: 'Failed to load news',
            error: error
        });
    }
});

// Gallery page
router.get('/gallery', async (req, res) => {
    try {
        res.render('gallery', {
            title: 'Photo Gallery'
        });
    } catch (error) {
        console.error('Error:', error);
        res.render('error', {
            message: 'Failed to load gallery',
            error: error
        });
    }
});

// Event planning page
router.get('/event-planning', isAuthenticated, (req, res) => {
    res.render('eventPlanning', {
        title: 'Event Planning'
    });
});

// Statistics page
router.get('/statistics', async (req, res) => {
    try {
        res.render('statistics', {
            title: 'Statistics'
        });
    } catch (error) {
        console.error('Error:', error);
        res.render('error', {
            message: 'Failed to load statistics',
            error: error
        });
    }
});

// Contact page
router.get('/contact', (req, res) => {
    res.render('contact', {
        title: 'Contact Us'
    });
});

// Login page
router.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    res.render('login', {
        title: 'Login'
    });
});

// Register page
router.get('/register', (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    res.render('register', {
        title: 'Register'
    });
});

// Profile page
router.get('/profile', isAuthenticated, async (req, res) => {
    try {
        const userEvents = await Event.find({ organizer: req.session.user._id });
        res.render('profile', {
            title: 'Profile',
            userEvents
        });
    } catch (error) {
        console.error('Error:', error);
        res.render('profile', {
            title: 'Profile',
            userEvents: [],
            error: 'Failed to load user events'
        });
    }
});

module.exports = router; 