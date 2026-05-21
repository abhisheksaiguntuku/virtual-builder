import express from 'express';
import mongoose from 'mongoose';
import { Plot, User } from '../db/schema.js';

const router = express.Router();

const DEFAULT_MILESTONES = [
    { id: 'm1', title: 'Foundation & Footing', description: 'Excavation, PCC, and footing reinforcement.' },
    { id: 'm2', title: 'Plinth Level', description: 'Plinth beam casting and earth filling.' },
    { id: 'm3', title: 'Lintel & Roof Casting', description: 'Brickwork up to roof level and concrete slab pouring.' },
    { id: 'm4', title: 'Plastering & Wiring', description: 'Internal/external plastering and concealed electrical.' },
    { id: 'm5', title: 'Finishing & Painting', description: 'Flooring tiles, doors/windows fitting, and painting.' }
];

/**
 * POST /api/plots/save
 * Saves a generated Master Plan to the database
 */
router.post('/save', async (req, res) => {
    try {
        const { userId, formData, apiData } = req.body;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized: You must be logged in to save.' });
        }

        let resolvedUserId = userId;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            const realUser = await User.findOne({ $or: [{ googleId: userId }, { phoneNumber: userId }] });
            if (realUser) {
                resolvedUserId = realUser._id;
            }
        }

        const newPlot = new Plot({
            userId: resolvedUserId,
            length: Number(formData.plotLength),
            width: Number(formData.plotWidth),
            facing: formData.plotFacing,
            budget: Number(formData.budget),
            city: formData.city,
            tier: formData.qualityTier,
            formData: formData,
            apiData: apiData,
            milestones: DEFAULT_MILESTONES
        });

        await newPlot.save();

        res.json({
            success: true,
            message: 'Project Saved Successfully!',
            plotId: newPlot._id
        });
    } catch (error) {
        console.error('Save Plot Error:', error);
        res.status(500).json({ success: false, error: 'Failed to save project' });
    }
});

/**
 * GET /api/plots/:userId
 * Retrieves saved plots for a user
 */
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        let resolvedUserId = userId;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            const realUser = await User.findOne({ $or: [{ googleId: userId }, { phoneNumber: userId }] });
            if (realUser) {
                resolvedUserId = realUser._id;
            }
        }

        const plots = await Plot.find({ userId: resolvedUserId }).sort({ createdAt: -1 });
        
        res.json({
            success: true,
            plots
        });
    } catch (error) {
        console.error('Fetch Plots Error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch saved projects' });
    }
});

/**
 * PUT /api/plots/:plotId/milestone
 * Toggles the completion status of a milestone
 */
router.put('/:plotId/milestone', async (req, res) => {
    try {
        const { plotId } = req.params;
        const { milestoneId, completed } = req.body;

        const plot = await Plot.findById(plotId);
        if (!plot) {
            return res.status(404).json({ success: false, error: 'Plot not found' });
        }

        const milestone = plot.milestones.find(m => m.id === milestoneId);
        if (milestone) {
            milestone.completed = completed;
            milestone.completedAt = completed ? new Date() : null;
            await plot.save();
            
            res.json({ success: true, plot });
        } else {
            res.status(404).json({ success: false, error: 'Milestone not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to update milestone' });
    }
});

export default router;
