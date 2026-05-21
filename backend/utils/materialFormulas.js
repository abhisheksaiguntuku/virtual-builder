/**
 * Material Formulas
 * Mathematical formulas to calculate construction material quantities
 * based on the built-up area (sq. ft).
 */

/**
 * Calculates the Bill of Materials (BOM) quantities based on built-up area.
 * @param {number} builtUpArea - The built-up area in sq. ft
 * @returns {Object} Quantities of materials
 */
export function calculateBOM(builtUpArea, formData) {
    const area = builtUpArea;
    return {
        bricks: { qty: Math.ceil(area * 9), unit: 'nos', brand: 'Fly Ash / Red Clay', tip: 'Use Fly Ash bricks to save ₹2/brick' },
        cement: { qty: Math.ceil(area * 0.11), unit: 'bags', brand: 'UltraTech / Ambuja (OPC 53)', tip: 'Buy directly from stockist to save 5%' },
        sand: { qty: Math.ceil(area * 0.45), unit: 'cu.ft', brand: 'M-Sand / River Sand', tip: 'Use M-Sand instead of River Sand to cut cost' },
        steel: { qty: Math.ceil(area * 1.35), unit: 'kg', brand: 'TATA Tiscon / JSW (Fe-500D)', tip: 'Avoid cheap re-rolled steel (Safety risk)' },
        tiles: { qty: Math.ceil(area * 1.1), unit: 'sq.ft', brand: 'Kajaria / Somany', tip: 'Buy "second sort" for utility areas (40% cheaper)' },
        paint: { qty: Math.ceil((area * 3) / 100), unit: 'liters', brand: 'Asian Paints / Berger', tip: 'Mix primer locally to reduce paint coats' },
        electrical: { qty: Math.ceil(area), unit: 'sq.ft', brand: 'Polycab / Havells', tip: 'Buy full 90m coils wholesale' },
        doors: { qty: Math.ceil(area / 300), unit: 'units', brand: formData?.doors || 'Teak Wood', tip: 'Use WPC frames in bathrooms to prevent rot' },
        windows: { qty: Math.ceil(area / 200), unit: 'units', brand: formData?.windows || 'UPVC', tip: 'Standardize window sizes to reduce custom manufacturing cost' },
        exterior: { qty: area * 1.5, unit: 'sq.ft', brand: formData?.exterior || 'Textured Finish', tip: 'Use Apex Ultima to avoid repainting for 7 years' }
    };
}

/**
 * Calculates total cost based on quantities and unit prices.
 * @param {Object} quantities - Object returning from calculateBOM
 * @param {Object} prices - Object mapping material to unit price
 * @returns {Object} Breakdown of costs and total
 */
export function calculateCosts(quantities, prices, formData) {
    const tierMultiplier = formData?.qualityTier === 'Premium' ? 1.5 : formData?.qualityTier === 'Budget' ? 0.8 : 1;
    const doorMultiplier = formData?.doors?.includes('Solid') ? 1.5 : formData?.doors?.includes('WPC') ? 0.8 : 1;
    const windowMultiplier = formData?.windows?.includes('UPVC') ? 1.2 : formData?.windows?.includes('Wooden') ? 1.5 : 1;
    const exteriorMultiplier = formData?.exterior?.includes('Tiles') ? 1.8 : 1;
    const costBreakdown = {
        bricks: quantities.bricks.qty * 8 * tierMultiplier,
        cement: quantities.cement.qty * 360 * tierMultiplier,
        sand: quantities.sand.qty * 1800 * tierMultiplier,
        steel: quantities.steel.qty * 59 * tierMultiplier,
        tiles: quantities.tiles.qty * 65 * tierMultiplier,
        paint: quantities.paint.qty * 220 * tierMultiplier,
        electrical: quantities.electrical.qty * 45 * tierMultiplier,
        doors: quantities.doors.qty * 12000 * tierMultiplier * doorMultiplier,
        windows: quantities.windows.qty * 8000 * tierMultiplier * windowMultiplier,
        exterior: quantities.exterior.qty * 40 * tierMultiplier * exteriorMultiplier
    };

    const totalMaterialCost = Object.values(costBreakdown).reduce((acc, curr) => acc + curr, 0);

    // Assuming labor is approx 30% of material cost for a rough estimate if not provided explicitly
    const totalLaborCost = totalMaterialCost * 0.30; 
    
    // 10% contingency buffer
    const contingency = (totalMaterialCost + totalLaborCost) * 0.10;

    return {
        materials: costBreakdown,
        totalMaterialCost,
        totalLaborCost,
        contingency,
        total: totalMaterialCost + totalLaborCost + contingency
    };
}

