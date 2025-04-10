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

// Event planning page
router.get('/event-planning', isAuthenticated, (req, res) => {
    res.render('eventPlanning', {
        title: 'Event Planning'
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