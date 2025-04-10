const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Event routes
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);
router.post('/', isAuthenticated, eventController.createEvent);
router.put('/:id', isAuthenticated, eventController.updateEvent);
router.delete('/:id', isAuthenticated, eventController.deleteEvent);
router.post('/:id/join', isAuthenticated, eventController.joinEvent);
router.post('/:id/leave', isAuthenticated, eventController.leaveEvent);

module.exports = router; 