import express from 'express';
import { autoCorrectLayout } from '../utils/vastuEngine.js';
import { calculateBOM, calculateCosts } from '../utils/materialFormulas.js';
import { fetchLocalSuppliers } from '../services/supplierService.js';

const router = express.Router();

/**
 * POST /api/calculate
 * Calculates BOM and total cost based on plot dimensions and city pricing
 */
router.post('/calculate', async (req, res) => {
    try {
        const formData = req.body;
        const length = Number(formData.plotLength) || 40;
        const width = Number(formData.plotWidth) || 60;
        const builtUpArea = Number(formData.builtUpArea) || (length * width * 0.7);
        
        // 1. Calculate Quantities
        const quantities = calculateBOM(builtUpArea, formData);
        
        // 2. Fetch Prices from DB (Mocked here for demonstration)
        const mockPrices = {
            bricks: 8, // ₹ per brick
            cement: 360, // ₹ per bag
            sand: 1800, // ₹ per cu.ft
            steel: 59, // ₹ per kg
            tiles: 65, // ₹ per sq.ft
            paint: 220, // ₹ per liter
            wires: 15 // ₹ per sq.ft approx
        };
        
        // 3. Calculate Total Cost
        const costBreakdown = calculateCosts(quantities, mockPrices, formData);
        
        res.json({
            success: true,
            builtUpArea,
            quantities,
            costBreakdown
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/vastu-correct
 * Analyzes layout and auto-corrects according to Vastu rules
 */
router.post('/vastu-correct', (req, res) => {
    try {
        const { rooms } = req.body; // e.g. [{ type: 'Kitchen', direction: 'North-East' }]
        
        // Mock rooms if none provided from frontend yet
        const mockRooms = rooms || [
            { type: 'Kitchen', direction: 'North-East' },
            { type: 'Master Bedroom', direction: 'North' }
        ];

        const correctedLayout = autoCorrectLayout(mockRooms);
        
        res.json({
            success: true,
            original: mockRooms,
            corrected: correctedLayout.layout,
            violations: correctedLayout.violations
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/suppliers-near-me
 * Fetches local builders, suppliers, and workers within 100km
 */
router.post('/suppliers-near-me', async (req, res) => {
    try {
        const { city, lat, lng, category } = req.body;
        
        // Call the service to fetch from DB or external API (JustDial scraper logic)
        const suppliers = await fetchLocalSuppliers(city, lat, lng, category);
        
        res.json({
            success: true,
            suppliers
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
