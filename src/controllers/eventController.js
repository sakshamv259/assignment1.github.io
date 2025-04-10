const Event = require('../models/Event');

// Create a new event
const createEvent = async (req, res) => {
    try {
        const { title, description, date, time, location, category } = req.body;
        
        const event = new Event({
            title,
            description,
            date,
            time,
            location,
            category,
            organizer: req.session.userId
        });

        await event.save();
        res.status(201).json({ message: 'Event created successfully', event });
    } catch (error) {
        res.status(500).json({ message: 'Error creating event', error: error.message });
    }
};

// Get all events
const getAllEvents = async (req, res) => {
    try {
        const events = await Event.find()
            .populate('organizer', 'username')
            .sort({ date: 1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching events', error: error.message });
    }
};

// Get event by ID
const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('organizer', 'username')
            .populate('participants', 'username');
        
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching event', error: error.message });
    }
};

// Update event
const updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check if user is the organizer or admin
        if (event.organizer.toString() !== req.session.userId && req.session.userRole !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this event' });
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json({ message: 'Event updated successfully', event: updatedEvent });
    } catch (error) {
        res.status(500).json({ message: 'Error updating event', error: error.message });
    }
};

// Delete event
const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check if user is the organizer or admin
        if (event.organizer.toString() !== req.session.userId && req.session.userRole !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this event' });
        }

        await event.remove();
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting event', error: error.message });
    }
};

// Join event
const joinEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check if user is already a participant
        if (event.participants.includes(req.session.userId)) {
            return res.status(400).json({ message: 'Already joined this event' });
        }

        event.participants.push(req.session.userId);
        await event.save();

        res.json({ message: 'Successfully joined event' });
    } catch (error) {
        res.status(500).json({ message: 'Error joining event', error: error.message });
    }
};

// Leave event
const leaveEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Remove user from participants
        event.participants = event.participants.filter(
            participant => participant.toString() !== req.session.userId
        );

        await event.save();
        res.json({ message: 'Successfully left event' });
    } catch (error) {
        res.status(500).json({ message: 'Error leaving event', error: error.message });
    }
};

module.exports = {
    createEvent,
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    joinEvent,
    leaveEvent
}; 