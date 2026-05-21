/**
 * Vastu Engine Logic
 * Analyzes and auto-corrects room placements based on traditional Vastu rules.
 */

export const VASTU_RULES = {
    'Kitchen': {
        best: 'South-East',
        good: ['West'],
        avoid: ['North-East', 'South-West'],
        remedy: 'Use red walls, cook facing East, add copper pyramid'
    },
    'Pooja Room': {
        best: 'North-East',
        good: ['East', 'North'],
        avoid: ['South-West', 'South'],
        remedy: 'Face East while praying, use white color'
    },
    'Master Bedroom': {
        best: 'South-West',
        good: ['West', 'South'],
        avoid: ['North-East', 'North'],
        remedy: 'Sleep head towards South, brown/beige colors'
    },
    'Bathroom': {
        best: 'North-West',
        good: ['North', 'West'],
        avoid: ['North-East', 'South-East'],
        remedy: 'Use blue color, keep door closed, camphor'
    }
};

/**
 * Automatically corrects a provided layout array.
 * @param {Array} rooms - Array of room objects: { type: 'Kitchen', direction: 'North-East' }
 * @returns {Object} { layout: [], violations: [] }
 */
export function autoCorrectLayout(rooms) {
    const correctedLayout = [];
    const violations = [];

    rooms.forEach(room => {
        const rules = VASTU_RULES[room.type];
        
        if (!rules) {
            // Room type has no strict Vastu rules defined here, pass through
            correctedLayout.push(room);
            return;
        }

        if (rules.avoid.includes(room.direction)) {
            // Violation detected
            violations.push({
                type: room.type,
                originalDirection: room.direction,
                message: `VIOLATION: ${room.type} in ${room.direction} violates Vastu.`,
                remedy: rules.remedy
            });
            
            // Auto-correct to best direction
            correctedLayout.push({
                ...room,
                direction: rules.best,
                autoCorrected: true
            });
        } else {
            // Good or Best direction
            correctedLayout.push(room);
        }
    });

    return {
        layout: correctedLayout,
        violations
    };
}

