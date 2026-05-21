import express from 'express';
import { User } from '../db/schema.js';

const router = express.Router();

/**
 * POST /api/auth/login
 * Legacy phone login (kept for backward compatibility)
 */
router.post('/login', async (req, res) => {
    try {
        const { phoneNumber, city, name } = req.body;
        if (!phoneNumber) return res.status(400).json({ success: false, error: 'Phone number is required' });

        let user = await User.findOne({ phoneNumber });
        if (!user) {
            user = new User({ phoneNumber, city: city || 'Unknown', name: name || 'Builder' });
            await user.save();
        }
        res.json({ success: true, user: { id: user._id, name: user.name, city: user.city } });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

/**
 * POST /api/auth/google
 * Google Sign-In — finds or creates user by Google ID
 */
router.post('/google', async (req, res) => {
    try {
        const { id, name, email, photo } = req.body;
        if (!id || !email) return res.status(400).json({ success: false, error: 'Invalid Google credentials' });

        // Find by googleId or email (handles existing phone-registered users)
        let user = await User.findOne({ $or: [{ googleId: id }, { email }] });

        if (!user) {
            user = new User({
                googleId: id,
                name: name || 'Builder',
                email,
                photo,
                phoneNumber: `google_${id}`, // placeholder to satisfy schema
                city: 'Not specified'
            });
            await user.save();
        } else {
            // Update photo/name if changed
            user.googleId = id;
            user.photo = photo;
            user.name = name || user.name;
            await user.save();
        }

        res.json({
            success: true,
            user: { id: user._id, name: user.name, email: user.email, photo: user.photo, city: user.city }
        });
    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(500).json({ success: false, error: 'Authentication failed' });
    }
});

export default router;
