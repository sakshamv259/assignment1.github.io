const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;

// GET /api/gallery - Get all gallery images
router.get('/', async (req, res) => {
    try {
        const galleryPath = path.join(__dirname, '../public/data/gallery.json');
        const data = await fs.readFile(galleryPath, 'utf8');
        const gallery = JSON.parse(data);
        res.json(gallery);
    } catch (error) {
        console.error('Error reading gallery data:', error);
        res.status(500).json({ error: 'Failed to load gallery data' });
    }
});

module.exports = router; 