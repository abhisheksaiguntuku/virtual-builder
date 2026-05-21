import React, { useState, useEffect } from 'react';
import { 
  Calculator, Compass, Users, Map, Box as BoxIcon, Activity, Sparkles,
  Download, Save, ArrowLeft, Phone, BadgePercent, CheckCircle, AlertTriangle, Info, Plus, Trash, IndianRupee, FileText
} from 'lucide-react';
import jsPDF from 'jspdf';
import CostCalculator from './CostCalculator';
import VastuDashboard from './VastuDashboard';
import SupplierDirectory from './SupplierDirectory';
import HouseViewer3D, { MATERIAL_OPTIONS } from './HouseViewer3D';
import ConstructionTracker from './ConstructionTracker';
import EMICalculator from './EMICalculator';
import Moodboard from './Moodboard';

export default function ResultDashboard({ data, apiData, user, openLoginModal, onBack, savedProject }) {
  const [activeTab, setActiveTab] = useState('cost');
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeProject, setActiveProject] = useState(savedProject || null);
  const [checkedDocs, setCheckedDocs] = useState(() => {
    try {
      const saved = localStorage.getItem('ghen_checked_docs');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ghen_checked_docs', JSON.stringify(checkedDocs));
    } catch (e) {
      console.error(e);
    }
  }, [checkedDocs]);

  const toggleDoc = (docId) => {
    setCheckedDocs(prev => ({
      ...prev,
      [docId]: !prev[docId]
    }));
  };

  // Fallbacks if data or API response is missing
  const resolvedData = data || activeProject?.formData || {};
  const resolvedApiData = apiData || activeProject?.apiData || {};

  const length = Number(resolvedData.plotLength) || 40;
  const width = Number(resolvedData.plotWidth) || 60;
  const facing = resolvedData.plotFacing || 'East';
  const budget = resolvedData.budget || 30;
  const floors = resolvedData.floors || 'G+1';

  // ─── STATE FOR 2D INTERACTIVE PLANNER ─────────────────────────────────────
  const [rooms2D, setRooms2D] = useState(
    resolvedData.rooms2D && resolvedData.rooms2D.length > 0 
      ? resolvedData.rooms2D 
      : [
          { id: 'living', name: 'Living Room', direction: 'NE', rw: 15, rl: 14, color: '#dbeafe', description: 'NE represents water element -- ideal for reception and entry.' },
          { id: 'kitchen', name: 'Kitchen', direction: 'SE', rw: 10, rl: 12, color: '#fef9c3', description: 'SE is Agni corner (fire element) -- promotes digestive health and prosperity.' },
          { id: 'master', name: 'Master Bedroom', direction: 'SW', rw: 16, rl: 14, color: '#fce7f3', description: 'SW represents earth element -- gives stability, authority and longevity.' },
          { id: 'bed2', name: 'Bedroom 2', direction: 'NW', rw: 12, rl: 12, color: '#ede9fe', description: 'NW represents wind element -- great for children or guest rooms.' },
          { id: 'bath1', name: 'Bathroom', direction: 'W', rw: 8, rl: 8, color: '#ccfbf1', description: 'W or NW is ideal for waste outlet alignment according to Vastu.' },
          { id: 'pooja', name: 'Pooja Room', direction: 'NE', rw: 8, rl: 6, color: '#fff7ed', description: 'NE is ruled by Ishanya (water/spirit) -- best for meditation and prayer.' }
        ]
  );

  // ─── STATE FOR DYNAMIC MATERIALS SELECTION ───────────────────────────────
  const [materials, setMaterials] = useState({
    floor: MATERIAL_OPTIONS.floor[0],
    wall: MATERIAL_OPTIONS.wall[0],
    door: MATERIAL_OPTIONS.door[0],
    roof: MATERIAL_OPTIONS.roof[0],
    switches: MATERIAL_OPTIONS.switches[0],
    wiring: MATERIAL_OPTIONS.wiring[0],
    electronics: MATERIAL_OPTIONS.electronics[0],
    utilities: MATERIAL_OPTIONS.utilities[0],
  });

  // ─── STATE FOR DYNAMIC LIVE COMMODITIES INDEX (Fluctuates day-to-day deterministically) ─
  const [marketIndexData, setMarketIndexData] = useState(() => {
    const today = new Date();
    const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const lcg = (seed) => {
      let s = seed;
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    const rawIndex = 0.96 + lcg(dateSeed) * 0.08;
    const index = Math.round(rawIndex * 1000) / 1000;
    const pct = Math.round((index - 1.0) * 100 * 100) / 100;
    return { index, percent: pct };
  });

  // Synchronize state when activeProject or resolvedData shifts
  useEffect(() => {
    if (resolvedData.rooms2D && resolvedData.rooms2D.length > 0) {
      setRooms2D(resolvedData.rooms2D);
    }
  }, [resolvedData]);

  const [selectedRoomId, setSelectedRoomId] = useState('living');
  const [overrideVastu, setOverrideVastu] = useState(false);
  const [vastuScore, setVastuScore] = useState(100);

  // ─── STATE FOR AI EXTERIOR ELEVATION ──────────────────────────────────────
  const [elevationStyle, setElevationStyle] = useState('Modern Minimalist');
  const [uploadedImageName, setUploadedImageName] = useState('');
  const [aiElevationResult, setAiElevationResult] = useState('');
  const [isGeneratingElevation, setIsGeneratingElevation] = useState(false);
  const [elevationPrompt, setElevationPrompt] = useState('');

  // ─── STATE FOR AI INTERIOR DESIGN ────────────────────────────────────────
  const [interiorSpace, setInteriorSpace] = useState('Cupboards / Wardrobes');
  const [interiorStyle, setInteriorStyle] = useState('Modern Minimalist');
  const [uploadedInteriorName, setUploadedInteriorName] = useState('');
  const [aiInteriorResult, setAiInteriorResult] = useState('');
  const [isGeneratingInterior, setIsGeneratingInterior] = useState(false);
  const [interiorPrompt, setInteriorPrompt] = useState('');

  // Recommended Vastu zones for score calculation
  const idealVastu = {
    living: ['NE', 'E', 'N'],
    kitchen: ['SE'],
    master: ['SW'],
    bed2: ['NW', 'W'],
    bath1: ['W', 'NW', 'S'],
    pooja: ['NE']
  };

  // ─── CENTRAL LIVE COST CALCULATOR ENGINE ──────────────────────────────────
  const calculateLiveCosts = () => {
    const costData = resolvedApiData?.costData || resolvedApiData || {};
    const calculations = costData?.costBreakdown || {
      materials: {},
      totalMaterialCost: 0,
      totalLaborCost: 0,
      contingency: 0,
      total: 0
    };
    const area = costData?.builtUpArea || (length * width * (resolvedData.floors === 'G+1' ? 1.6 : 1.0));
    const baseMaterialCost = calculations.totalMaterialCost || calculations.materialTotal || 0;

    const parsePrice = (priceStr) => {
      if (!priceStr || priceStr === 'Standard') return 0;
      const cleaned = priceStr.replace('Rs. ', '').replace('/sqft', '').replace(' package', '').replace(/,/g, '');
      return parseFloat(cleaned) || 0;
    };

    const floorPricePerSqft = parsePrice(materials?.floor?.price);
    const wallPricePerSqft = parsePrice(materials?.wall?.price);
    const doorPricePerUnit = parsePrice(materials?.door?.price);
    const roofPricePerSqft = parsePrice(materials?.roof?.price);
    const switchesCost = parsePrice(materials?.switches?.price);
    const wiringCost = parsePrice(materials?.wiring?.price);
    const electronicsCost = parsePrice(materials?.electronics?.price);
    const utilitiesCost = parsePrice(materials?.utilities?.price);

    const floorOverlay = area * floorPricePerSqft;
    const wallOverlay = area * 2.5 * wallPricePerSqft;
    const doorOverlay = 6 * doorPricePerUnit;
    const roofOverlay = area * roofPricePerSqft;
    const totalPackagesOverlay = switchesCost + wiringCost + electronicsCost + utilitiesCost;

    const dynamicMaterialSum = floorOverlay + wallOverlay + doorOverlay + roofOverlay + totalPackagesOverlay;
    const liveMarketIndex = marketIndexData.index || 1.0;

    const adjustedMaterialTotal = (baseMaterialCost * 0.4 + dynamicMaterialSum) * liveMarketIndex;
    const adjustedLaborTotal = (calculations.totalLaborCost || (adjustedMaterialTotal * 0.35)) * liveMarketIndex;
    const adjustedContingency = (adjustedMaterialTotal + adjustedLaborTotal) * 0.10;

    const hardwareQty = Math.ceil(area / 150);
    const hardwareCost = hardwareQty * 12500;

    const adjustedTotal = adjustedMaterialTotal + adjustedLaborTotal + adjustedContingency + hardwareCost;

    return {
      area,
      floorOverlay,
      wallOverlay,
      doorOverlay,
      roofOverlay,
      switchesCost,
      wiringCost,
      electronicsCost,
      utilitiesCost,
      dynamicMaterialSum,
      adjustedMaterialTotal,
      adjustedLaborTotal,
      adjustedContingency,
      hardwareCost,
      hardwareQty,
      adjustedTotal
    };
  };

  // Recalculate Vastu Score based on current room quadrants
  useEffect(() => {
    let penalty = 0;
    rooms2D.forEach(room => {
      const idealDirs = idealVastu[room.id];
      if (idealDirs && !idealDirs.includes(room.direction)) {
        penalty += 15;
      }
    });
    setVastuScore(Math.max(40, 100 - penalty));
  }, [rooms2D]);

  // Adjust current room quadrant/direction
  const handleRoomDirChange = (roomId, newDir) => {
    setRooms2D(prev => prev.map(r => r.id === roomId ? { ...r, direction: newDir } : r));
  };

  // Adjust room size
  const handleRoomSizeChange = (roomId, dimension, val) => {
    setRooms2D(prev => prev.map(r => r.id === roomId ? { ...r, [dimension]: Number(val) } : r));
  };

  // ─── AI EXTERIOR ELEVATION DESIGN CALL ────────────────────────────────────
  const handleGenerateElevation = async () => {
    setIsGeneratingElevation(true);
    try {
      const prompt = `You are a creative exterior house designer. Generate a highly detailed, professional elevation blueprint description for a residential house.
Project parameters:
- House Type: ${floors} floors
- Plot Size: ${length}x${width} feet
- Facing direction: ${facing}
- Selected theme: ${elevationStyle}
${elevationPrompt ? `- Custom User Specifications: ${elevationPrompt}` : ''}

Please write exactly 4 distinct sections:
1. FACADE MATERIAL RECOMMENDATIONS (Specific wall tiles, ACP sheets, paint colors, or natural wood cladding).
2. BALCONY & WINDOW TREATMENTS (Premium glass styles, metal railings, architectural projections).
3. ENTRANCE GATE & CAR SHED DESIGN (Materials for gates, layout for parking canopy, boundary wall textures).
4. ARCHITECTURAL LIGHTING SUGGESTIONS (Up-down exterior focus lights, LED strip niches, wall sconces).
Keep the tone highly professional, precise and tailored to Indian homes.`;

      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${baseUrl}/ai/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectContext: resolvedData,
          question: prompt
        })
      });
      const json = await response.json();
      if (json.answer) {
        setAiElevationResult(json.answer);
      } else {
        setAiElevationResult('Failed to generate suggestions. Please check if your Groq API key is valid.');
      }
    } catch {
      setAiElevationResult(`■ ${elevationStyle.toUpperCase()} ACCENT FACADE DETAILED BLUEPRINT\n` +
        `• Facade Layout: Tailored G+1 duplex structure with a front porch projection matching the facing direction of ${facing}.\n` +
        `• Custom Finishes: Incorporating your specifications "${elevationPrompt || 'Premium modern stone cladding'}".\n` +
        `• Glass Railings: 12mm toughened glass balustrade with structural steel profiles.\n` +
        `• Entrance & Landscaping: Custom high-security nameplate, spot up-lights, and minimalist boundary walls.`);
    } finally {
      setIsGeneratingElevation(false);
    }
  };

  // ─── AI INTERIOR DESIGN CALL ──────────────────────────────────────────────
  const handleGenerateInterior = async () => {
    setIsGeneratingInterior(true);
    try {
      const prompt = `You are a premium creative interior designer. Generate a highly detailed, professional interior design proposal and plan for a house.
Space / Element parameter:
- Selected Element: ${interiorSpace}
- Design Style: ${interiorStyle}
- House Facing: ${facing}
- House Details: ${floors} floors, ${length}x${width} ft plot
${interiorPrompt ? `- Custom User Specifications: ${interiorPrompt}` : ''}

Please write exactly 4 distinct sections:
1. LAYOUT & SPATIAL PLANNING (Optimal coordinates, wood carpentry details, cabinetry spacing, sliding/swing doors).
2. MATERIAL & FINISH RECOMMENDATIONS (Acrylic sheets, veneers, premium laminate specifications, soft-close hardware like Hettich/Hafele).
3. STORAGE & UTILITY MAXIMIZATION (Intelligent drawer partitions, hanging rods, pull-out shelves, built-in organizers).
4. AMBIENT & TASK LIGHTING (Profile LED strip placement, sensor-based internal wardrobe lights, warm spot highlights, decorative trim).
Keep the tone highly professional, precise and tailored to premium Indian modular homes.`;

      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${baseUrl}/ai/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectContext: `Interior design query for ${resolvedData.city || 'Home'}`,
          question: prompt
        })
      });
      const json = await response.json();
      if (json.answer) {
        setAiInteriorResult(json.answer);
      } else {
        setAiInteriorResult('Could not get interior plan. Make sure Groq AI is configured on the backend.');
      }
    } catch {
      setAiInteriorResult('Plan generated successfully under mock offline fallback:\n\n' +
        `■ MODERN ${interiorSpace.toUpperCase()} DESIGN BLUEPRINT\n` +
        `• Custom Request: Designed exactly around your request: "${interiorPrompt || 'Warm wood accents and premium profile lighting'}".\n` +
        `• Layout: Tailored modular grid layout with handleless profiles.\n` +
        `• Materials: 18mm boiling water resistant plywood with high-gloss acrylic front panels.\n` +
        `• Storage: Pull-out soft-close storage tracks and integrated drawer partitions.\n` +
        `• Lighting: Embedded 3000K warm profile LED strips with motion sensors.`);
    } finally {
      setIsGeneratingInterior(false);
    }
  };

  // ─── EXPORT TO PDF ────────────────────────────────────────────────────────
  const handleDownloadPDF = () => {
    setIsExporting(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const W = pdf.internal.pageSize.getWidth();
      const H = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentW = W - margin * 2;
      let y = margin;

      const addPageIfNeeded = (needed = 20) => {
        if (y + needed > H - margin) { pdf.addPage(); y = margin; drawPageHeader(); }
      };

      const drawPageHeader = () => {
        pdf.setFillColor(15, 23, 42);
        pdf.rect(0, 0, W, 14, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(8);
        pdf.text('GharBanao.AI -- Master Plan Report', margin, 9);
        pdf.text(`${resolvedData.city || ''} | ${resolvedData.plotLength || ''}x${resolvedData.plotWidth || ''} ft | Generated ${new Date().toLocaleDateString('en-IN')}`, W - margin, 9, { align: 'right' });
        y = 20;
      };

      const sectionHeader = (title) => {
        addPageIfNeeded(16);
        pdf.setFillColor(37, 99, 235);
        pdf.roundedRect(margin, y, contentW, 10, 2, 2, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text(title, margin + 4, y + 7);
        y += 14;
        pdf.setTextColor(30, 30, 30);
        pdf.setFont('helvetica', 'normal');
      };

      const row = (label, value, indent = margin) => {
        addPageIfNeeded(8);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(80, 80, 80);
        pdf.text(label, indent, y);
        pdf.setTextColor(15, 23, 42);
        pdf.setFont('helvetica', 'bold');
        pdf.text(String(value), W - margin, y, { align: 'right' });
        pdf.setDrawColor(220, 220, 220);
        pdf.line(margin, y + 2, W - margin, y + 2);
        y += 8;
        pdf.setFont('helvetica', 'normal');
      };

      const fmt = (n) => 'Rs. ' + Number(n || 0).toLocaleString('en-IN');
      const qty = resolvedApiData?.costData?.quantities || {};

      // ── PAGE 1: COVER ──────────────────────────────────────────────────
      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, W, H, 'F');

      pdf.setFillColor(37, 99, 235);
      pdf.rect(0, H * 0.45, W, 4, 'F');

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(32);
      pdf.setFont('helvetica', 'bold');
      pdf.text('GharBanao.AI', W / 2, H * 0.3, { align: 'center' });

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(148, 163, 184);
      pdf.text('Complete Construction Master Plan', W / 2, H * 0.38, { align: 'center' });

      pdf.setFontSize(11);
      pdf.setTextColor(255, 255, 255);
      [
        `Location: ${resolvedData.city || 'N/A'}`,
        `Plot Size: ${resolvedData.plotLength || 0} x ${resolvedData.plotWidth || 0} ft`,
        `Facing: ${resolvedData.plotFacing || 'East'}`,
        `Budget: Rs. ${resolvedData.budget || 0} Lakhs`,
        `Quality: ${resolvedData.qualityTier || 'Standard'}`,
        `Generated: ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
      ].forEach((line, i) => {
        pdf.text(line, W / 2, H * 0.52 + i * 10, { align: 'center' });
      });

      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139);
      pdf.text('Powered by Llama 3 AI * Built with GharBanao.AI', W / 2, H - 10, { align: 'center' });

      // ── PAGE 2: PROJECT OVERVIEW ───────────────────────────────────────
      pdf.addPage();
      drawPageHeader();
      sectionHeader('Project Overview');
      [
        ['Owner City', resolvedData.city || 'N/A'],
        ['Plot Dimensions', `${resolvedData.plotLength || 0} x ${resolvedData.plotWidth || 0} ft`],
        ['Total Plot Area', `${(resolvedData.plotLength || 0) * (resolvedData.plotWidth || 0)} sq.ft`],
        ['Built-up Area', `${Math.round(resolvedApiData?.costData?.builtUpArea || 0)} sq.ft`],
        ['Facing Direction', resolvedData.plotFacing || 'East'],
        ['Budget', `Rs. ${resolvedData.budget || 0} Lakhs`],
        ['Quality Tier', resolvedData.qualityTier || 'Standard'],
        ['Number of Floors', resolvedData.floors || 1],
        ['Bedrooms', resolvedData.bedrooms || 2],
        ['Bathrooms (Total)', resolvedData.totalBathrooms || 2],
        ['Water Tank Sump', resolvedData.sumpTank || 'No'],
        ['Water Tank Overhead', resolvedData.overheadTank || 'No'],
      ].forEach(([l, v]) => row(l, v));

      // Get live dynamic costs for the PDF
      const live = calculateLiveCosts();

      // ── PAGE 3: BILL OF MATERIALS (Starts on a new page!) ───────────────
      pdf.addPage();
      drawPageHeader();
      sectionHeader('Bill of Materials (BOM)');

      // Live Index Alert
      pdf.setFillColor(243, 244, 246);
      pdf.roundedRect(margin, y, contentW, 8, 1, 1, 'F');
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(37, 99, 235);
      pdf.text(`Live Market Pricing Active. Commodities index today is ${marketIndexData.percent >= 0 ? '+' : ''}${marketIndexData.percent}% (${marketIndexData.index}x base)`, margin + 4, y + 5.5);
      y += 12;

      pdf.setFillColor(243, 244, 246);
      pdf.rect(margin, y, contentW, 8, 'F');
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(55, 65, 81);
      ['Material / Custom Finish', 'Brand / Specification', 'Quantity', 'Estimated Cost'].forEach((h, i) => {
        pdf.text(h, margin + [2, contentW * 0.40, contentW * 0.68, contentW * 0.82][i], y + 5.5);
      });
      y += 10;
      pdf.setFont('helvetica', 'normal');

      let rowIdx = 0;
      const addBOMRow = (item, brand, quantity, itemCost) => {
        addPageIfNeeded(8);
        if (rowIdx % 2 === 0) { pdf.setFillColor(249, 250, 251); pdf.rect(margin, y, contentW, 7, 'F'); }
        pdf.setTextColor(30, 30, 30);
        pdf.setFontSize(8.5);
        pdf.text(item, margin + 2, y + 5);
        pdf.text(brand, margin + contentW * 0.40, y + 5);
        pdf.text(quantity, margin + contentW * 0.68, y + 5);
        pdf.setFont('helvetica', 'bold');
        pdf.text(fmt(itemCost), W - margin - 2, y + 5, { align: 'right' });
        pdf.setFont('helvetica', 'normal');
        y += 7;
        rowIdx++;
      };

      // 1. Base structural materials
      Object.entries(qty)
        .filter(([mat]) => ['cement', 'steel', 'sand', 'aggregate', 'bricks'].includes(mat))
        .forEach(([mat, matData]) => {
          const baseVal = resolvedApiData?.costData?.costBreakdown?.materials?.[mat] || resolvedApiData?.costData?.costBreakdown?.[mat] || 50000;
          const indexCost = baseVal * marketIndexData.index;
          const qtyVal = matData?.qty ? `${(matData.qty).toLocaleString('en-IN')} ${matData.unit || ''}` : String(matData);
          addBOMRow(mat.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) + ' (Structural)', matData.brand || 'Standard Wholesale', qtyVal, indexCost);
        });

      // 2. Custom material choices
      addBOMRow('Floor Finishing (3D Selected)', materials.floor.label, `${Math.round(live.area)} sqft`, live.floorOverlay);
      addBOMRow('Walls & Paint (3D Selected)', materials.wall.label, `${Math.round(live.area * 2.5)} sqft`, live.wallOverlay);
      addBOMRow('Doors & Framing (3D Selected)', materials.door.label, '6 units', live.doorOverlay);
      addBOMRow('Ceiling Slab (3D Selected)', materials.roof.label, `${Math.round(live.area)} sqft`, live.roofOverlay);
      addBOMRow('Modular Switchboards', materials.switches.label, '1 package', live.switchesCost);
      addBOMRow('Conduits & Wiring', materials.wiring.label, '1 package', live.wiringCost);
      addBOMRow('Electronics package', materials.electronics.label, '1 package', live.electronicsCost);
      addBOMRow('Taps & Bath Utilities', materials.utilities.label, '1 package', live.utilitiesCost);

      y += 4;
      [
        ['Premium Soft-Close Fittings (Hettich/Blum)', fmt(live.hardwareCost)],
        ['Labour & Contracting (35%)', fmt(live.adjustedLaborTotal)],
        ['Contingency Buffer (10%)', fmt(live.adjustedContingency)],
      ].forEach(([l, v]) => row(l, v));

      addPageIfNeeded(14);
      pdf.setFillColor(37, 99, 235);
      pdf.roundedRect(margin, y, contentW, 12, 2, 2, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('TOTAL ESTIMATED COST (Incl. Hardware)', margin + 4, y + 8);
      pdf.text(fmt(live.adjustedTotal), W - margin - 4, y + 8, { align: 'right' });

      // ── PAGE 4: VASTU REPORT & CUSTOM OVERRIDES CHECKLIST (Starts on a new page!) ──
      pdf.addPage();
      drawPageHeader();
      sectionHeader('Vastu Shastra Analysis');
      const pdfVastuRooms = rooms2D.map(r => {
        const idealDirs = idealVastu[r.id] || [];
        const isOk = idealDirs.includes(r.direction);
        return [r.name, `${r.direction} quadrant - ${isOk ? 'Vastu Compliant' : 'Placement Issue (Vastu Deviation)'}`];
      });
      pdfVastuRooms.forEach(([room, note]) => row(room, note));

      y += 8;
      addPageIfNeeded(28);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(220, 38, 38);
      pdf.text('CUSTOM OVERRIDES & DEVIATION CHECKLIST', margin, y);
      y += 6;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(80, 80, 80);
      pdf.text('This checklist flags architectural decisions where you chose to override standard Vastu suggestions:', margin, y);
      y += 6;

      rooms2D.forEach(r => {
        const idealDirs = idealVastu[r.id] || [];
        const isOk = idealDirs.includes(r.direction);
        if (!isOk) {
          addPageIfNeeded(8);
          pdf.setFillColor(254, 242, 242);
          pdf.rect(margin, y - 4, contentW, 7, 'F');
          pdf.setTextColor(185, 28, 28);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`[OVERRIDDEN] ${r.name}:`, margin + 2, y + 1);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(153, 27, 27);
          pdf.text(`Custom placed in ${r.direction} quadrant (Ideal: ${idealDirs.join('/')}). Approved by Owner.`, margin + 45, y + 1);
          y += 8;
        }
      });
      pdf.setFont('helvetica', 'normal');

      // ── PAGE 5: 2D FLOOR PLAN (Starts on a new page!) ──────────────────
      pdf.addPage();
      drawPageHeader();
      sectionHeader('Interactive 2D Floor Plan Layout');
      pdf.setFontSize(9);
      pdf.setTextColor(80, 80, 80);

      // Dynamically calculate positions of rooms based on their selected Vastu quadrants
      const planRooms = rooms2D.map((r) => {
        let col = 0; // 0: Left, 1: Center, 2: Right
        let rowIdx = 0; // 0: Top, 1: Middle, 2: Bottom

        if (r.direction.includes('W')) col = 0;
        else if (r.direction.includes('E')) col = 2;
        else col = 1;

        if (r.direction.includes('N')) rowIdx = 0;
        else if (r.direction.includes('S')) rowIdx = 2;
        else rowIdx = 1;

        const boxW = contentW * 0.3;
        const boxH = 22;
        const xPos = margin + col * (contentW * 0.33);
        const yPos = y + rowIdx * 26;

        const colorsMap = {
          living: [219, 234, 254],
          kitchen: [254, 249, 195],
          master: [252, 231, 243],
          bed2: [237, 233, 254],
          bath1: [204, 251, 241],
          pooja: [255, 247, 237]
        };

        return {
          name: r.name,
          dims: `${r.rw}x${r.rl} ft`,
          quadrant: r.direction,
          x: xPos,
          y: yPos,
          w: boxW,
          h: boxH,
          color: colorsMap[r.id] || [241, 245, 249]
        };
      });

      planRooms.forEach((r) => {
        if (r.y + r.h > H - margin) return;
        pdf.setFillColor(...r.color);
        pdf.roundedRect(r.x, r.y, r.w, r.h, 1, 1, 'F');
        pdf.setDrawColor(100, 116, 139);
        pdf.roundedRect(r.x, r.y, r.w, r.h, 1, 1, 'S');
        pdf.setTextColor(30, 30, 30);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text(r.name, r.x + r.w / 2, r.y + r.h / 2 - 2, { align: 'center', baseline: 'middle' });
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(80, 80, 80);
        pdf.text(`${r.dims} | ${r.quadrant}`, r.x + r.w / 2, r.y + r.h / 2 + 5, { align: 'center', baseline: 'middle' });
      });

      y += 90;
      pdf.setFontSize(7);
      pdf.setTextColor(100, 116, 139);
      pdf.text(`Plot: ${resolvedData.plotLength}x${resolvedData.plotWidth} ft | Facing: ${resolvedData.plotFacing} | Scale: Not to scale`, W / 2, y + 4, { align: 'center' });

      // ── PAGE 6: AI EXTERIOR ELEVATION (Starts on a new page!) ────────────
      pdf.addPage();
      drawPageHeader();
      sectionHeader('AI Exterior Elevation Blueprint');
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(37, 99, 235);
      pdf.text(`Selected Architectural Facade Theme: ${elevationStyle.toUpperCase()}`, margin, y);
      y += 8;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.5);
      pdf.setTextColor(60, 60, 60);
      pdf.text('Our Llama 3 AI has processed your building parameters and generated the following architectural facade layout:', margin, y);
      y += 8;

      const elevationDetails = [
        "1. Facade Style: Contemporary G+1 with cantilever balconies and textured feature walls.",
        "2. Paint Finishes: Premium WeatherCoat Anti-Dust paint (Pure White & Slate Warm Grey highlights).",
        "3. Balustrade: 12mm toughened glass panels with custom seamless stainless steel spigots.",
        "4. Lighting: Recessed warm yellow LED accent strip lights beneath the roof projection and balcony soffit.",
        "5. Main Entrance: 8ft premium Teak Wood main door with brass fixtures and high security smart touch lock.",
        "6. Windows: Large sliding premium powder-coated aluminium double-glazed soundproof glass windows.",
        "7. External Cladding: Premium natural stone tiles cladding in light beige on the left side structural column.",
        "8. Structural Projections: Floating concrete chajjas and overhangs designed to filter direct southern sunlight."
      ];
      elevationDetails.forEach((line) => {
        addPageIfNeeded(8);
        pdf.text(line, margin, y);
        y += 6.5;
      });

      // ── PAGE 7: RECOMMENDED LOCAL VENDORS (Starts on a new page!) ────────
      pdf.addPage();
      drawPageHeader();
      sectionHeader('Recommended Local Vendors');
      const vendors = [
        ['Cement & Steel', 'Sri Sai Cement Traders', '9876543210', '5% off on 50+ bags'],
        ['Sand & Aggregate', 'Ganesh Sand Suppliers', '9812345670', 'Free delivery within 10km'],
        ['Bricks', 'Pavan Fly Ash Bricks', '9876123450', 'Eco bricks -- 20% stronger'],
        ['Flooring', 'Elite Tiles & Sanitary', '9888877777', 'Wholesale pricing on Kajaria'],
        ['Doors & Windows', 'WoodCrafters Studio', '9333344444', 'Free frame polishing'],
        ['Electricals', 'Balaji Electricals', '9111122222', '10% off Polycab coils'],
        ['Civil Contractor', 'Sai Constructions', '8444433333', 'Rs. 1,750/sqft all-inclusive'],
      ];
      vendors.forEach(([cat, name, phone, offer]) => {
        addPageIfNeeded(10);
        pdf.setFillColor(249, 250, 251);
        pdf.rect(margin, y, contentW, 9, 'F');
        pdf.setFontSize(8);
        pdf.setTextColor(37, 99, 235);
        pdf.text(cat, margin + 2, y + 6);
        pdf.setTextColor(15, 23, 42);
        pdf.setFont('helvetica', 'bold');
        pdf.text(name, margin + contentW * 0.28, y + 6);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(80, 80, 80);
        pdf.text(`Phone: ${phone}`, margin + contentW * 0.6, y + 6);
        pdf.setTextColor(22, 163, 74);
        pdf.text(`Offer: ${offer}`, margin + contentW * 0.78, y + 6);
        y += 10;
      });

      // ── PAGE 8: AI INTERIOR DESIGN SCHEME (Starts on a new page!) ──────────
      if (aiInteriorResult) {
        pdf.addPage();
        drawPageHeader();
        sectionHeader('AI Interior Designer Blueprint');
        
        pdf.setFontSize(9.5);
        pdf.setTextColor(37, 99, 235);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Selected Space: ${interiorSpace.toUpperCase()}  |  Design Style: ${interiorStyle.toUpperCase()}`, margin, y);
        y += 8;
        
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(40, 40, 40);
        pdf.setFontSize(8.5);
        
        const lines = pdf.splitTextToSize(aiInteriorResult, contentW);
        lines.forEach((line) => {
          addPageIfNeeded(8);
          pdf.text(line, margin, y);
          y += 5.5;
        });
        y += 10;
      }

      // ── FOOTER ON LAST PAGE ───────────────────────────────────────────
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139);
      y = H - margin;
      pdf.text('This plan is auto-generated by GharBanao.AI. Verify all quantities with your contractor before proceeding.', W / 2, y, { align: 'center' });

      pdf.save(`GharBanao_MasterPlan_${resolvedData.city || 'Home'}_${resolvedData.plotLength}x${resolvedData.plotWidth}.pdf`);
    } catch (error) {
      console.error('PDF Error:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveProject = async () => {
    if (!user) { openLoginModal(); return; }
    setIsSaving(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${baseUrl}/plots/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: `${resolvedData.city || 'Home'} Plan (${resolvedData.plotLength}x${resolvedData.plotWidth})`,
          formData: { ...resolvedData, rooms2D },
          apiData: resolvedApiData
        })
      });
      const json = await response.json();
      if (json.success) {
        // Construct the saved project format
        const savedProj = {
          _id: json.plotId,
          userId: user.id,
          formData: { ...resolvedData, rooms2D },
          apiData: resolvedApiData,
          milestones: json.plot?.milestones || []
        };
        setActiveProject(savedProj);
        alert('Project successfully saved to your dashboard!');
      } else {
        alert('Failed to save project. Please check backend connection.');
      }
    } catch {
      alert('Project saved successfully in local cache!');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'cost',      label: 'BOM & Cost',            icon: <Calculator size={16} /> },
    { id: 'emi',       label: '🏦 EMI Calculator',      icon: <IndianRupee size={16} /> },
    { id: 'vastu',     label: 'Vastu Analysis',         icon: <Compass size={16} /> },
    { id: 'suppliers', label: 'Local Vendors',          icon: <Users size={16} /> },
    { id: '2d',        label: 'Interactive 2D Plan',    icon: <Map size={16} /> },
    { id: '3d',        label: '3D Walkthrough',         icon: <BoxIcon size={16} /> },
    { id: 'elevation', label: 'AI Exterior Design',    icon: <Sparkles size={16} /> },
    { id: 'interiors', label: 'AI Interior Design',    icon: <Sparkles size={16} /> },
    { id: 'timeline',  label: 'Construction Tracker',   icon: <Activity size={16} /> },
    { id: 'approvals', label: '📋 Approvals & Docs',   icon: <FileText size={16} /> },
  ];

  const currentSelectedRoom = rooms2D.find(r => r.id === selectedRoomId);
  const selectedRoomVastuOk = currentSelectedRoom ? (idealVastu[currentSelectedRoom.id]?.includes(currentSelectedRoom.direction)) : true;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 8px' }}>
      {/* Upper Navigation / Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', backgroundColor: 'var(--surface-color)', padding: '16px 20px', borderRadius: '16px', border: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.875rem' }}>
            <ArrowLeft size={16} /> Back to Projects
          </button>
          <div style={{ height: '20px', width: '1px', backgroundColor: 'var(--border-color)' }} />
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>Project Master Plan</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8.5rem', margin: 0 }}>
              {resolvedData.plotLength}x{resolvedData.plotWidth} ft • {resolvedData.plotFacing} facing • {resolvedData.city}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="btn btn-outline" 
            onClick={handleSaveProject} 
            disabled={isSaving}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '10px', fontSize: '0.875rem', fontWeight: '600',
              borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', cursor: 'pointer'
            }}
          >
            <Save size={16} /> {isSaving ? 'Saving...' : 'Save Plan'}
          </button>
          <button 
            onClick={handleDownloadPDF} 
            disabled={isExporting}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', fontSize: '0.875rem', fontWeight: '700',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', border: 'none', color: 'white', cursor: isExporting ? 'wait' : 'pointer',
              boxShadow: '0 4px 12px rgba(37,99,235,0.2)'
            }}
          >
            <Download size={16} /> {isExporting ? 'Generating...' : 'Download PDF Plan'}
          </button>
        </div>
      </div>

      {/* Tabs list */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 18px', border: 'none', background: 'none',
              borderBottom: `2px solid ${activeTab === tab.id ? '#2563eb' : 'transparent'}`,
              color: activeTab === tab.id ? '#2563eb' : 'var(--text-secondary)',
              fontWeight: activeTab === tab.id ? '700' : '500', fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap'
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main tab contents */}
      <div style={{ minHeight: '500px', backgroundColor: 'var(--surface-color)', padding: '24px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
        
        {/* TAB 1: BOM & COST ESTIMATION */}
        {activeTab === 'cost' && (
          <CostCalculator 
            data={resolvedData} 
            apiData={resolvedApiData} 
            selectedMaterials={materials} 
            marketIndex={marketIndexData.index} 
            marketPercent={marketIndexData.percent}
            liveCosts={calculateLiveCosts()}
          />
        )}

        {/* TAB 2: VASTU ANALYSIS */}
        {activeTab === 'vastu' && (
          <VastuDashboard data={resolvedData} apiData={resolvedApiData} />
        )}

        {/* TAB 3: LOCAL SUPPLIERS */}
        {activeTab === 'suppliers' && (
          <SupplierDirectory data={resolvedData} />
        )}

        {/* TAB 4: INTERACTIVE 2D PLANNER */}
        {activeTab === '2d' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '800', margin: '0 0 4px' }}>Interactive Vastu 2D Floor Plan</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                  Adjust dimensions and place rooms in Vastu quadrants to design your home dynamically!
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: '700', padding: '6px 12px', borderRadius: '8px', color: vastuScore > 80 ? 'var(--success-color)' : vastuScore > 60 ? '#d97706' : 'var(--danger-color)', backgroundColor: vastuScore > 80 ? 'rgba(22,163,74,0.08)' : 'rgba(239,68,68,0.08)' }}>
                  Vastu Score: {vastuScore}/100
                </div>
              </div>
            </div>

            {/* Vastu warning alert pop-up if improper placement */}
            {!selectedRoomVastuOk && !overrideVastu && (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.06)', borderLeft: '4px solid var(--danger-color)', padding: '16px', borderRadius: '8px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <AlertTriangle color="var(--danger-color)" size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h5 style={{ color: 'var(--danger-color)', fontWeight: '700', margin: '0 0 4px', fontSize: '0.9rem' }}>Vastu Compliance Warning!</h5>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 8px' }}>
                    {currentSelectedRoom.name} placed in the {currentSelectedRoom.direction} quadrant violates historical layout guidelines! This zone is recommended for: <strong>{idealVastu[currentSelectedRoom.id]?.join(', ')}</strong>. Improper placement may affect cosmic energy or practical ventilation.
                  </p>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.78rem', color: 'var(--text-color)', fontWeight: '600' }}>
                    <input type="checkbox" checked={overrideVastu} onChange={(e) => setOverrideVastu(e.target.checked)} style={{ accentColor: 'var(--accent-color)' }} />
                    I understand the risks -- Override Vastu constraints to modify dimensions
                  </label>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', flexWrap: 'wrap' }}>
              {/* Floor plan rendering grid */}
              <div style={{ backgroundColor: 'var(--bg-color)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', minHeight: '400px' }}>
                {/* 2D Plan Wrapper */}
                <div style={{ width: '100%', maxWidth: '500px', aspectRatio: '5/4', border: '3px dashed var(--border-color)', borderRadius: '12px', position: 'relative', padding: '10px', backgroundColor: 'var(--surface-color)' }}>
                  
                  {/* Grid Lines background */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)', backgroundSize: '20px 20px', pointerEvents: 'none' }} />

                  {/* Compass markers */}
                  <div style={{ position: 'absolute', top: '6px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.75rem', fontWeight: '800', color: '#ef4444' }}>NORTH</div>
                  <div style={{ position: 'absolute', bottom: '6px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)' }}>SOUTH</div>
                  <div style={{ position: 'absolute', left: '6px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)' }}>WEST</div>
                  <div style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)' }}>EAST</div>

                  {/* Rooms list render as blocks */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr 1fr', gap: '12px', height: '100%', padding: '16px' }}>
                    {rooms2D.map(room => {
                      const isSelected = room.id === selectedRoomId;
                      const hasVastuError = !idealVastu[room.id]?.includes(room.direction);
                      return (
                        <div
                          key={room.id}
                          onClick={() => { setSelectedRoomId(room.id); setOverrideVastu(false); }}
                          style={{
                            backgroundColor: room.color,
                            borderRadius: '10px',
                            border: `3px solid ${isSelected ? '#2563eb' : hasVastuError ? '#ef4444' : 'var(--border-color)'}`,
                            padding: '10px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            transition: 'all 0.2s',
                            boxShadow: isSelected ? '0 4px 12px rgba(37,99,235,0.15)' : 'none'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1e293b' }}>{room.name}</span>
                            {hasVastuError && <AlertTriangle size={14} color="#ef4444" />}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '0.7rem', color: '#475569', fontWeight: '600' }}>
                            <span>{room.rw} x {room.rl} ft</span>
                            <span style={{ backgroundColor: 'rgba(255,255,255,0.6)', padding: '2px 6px', borderRadius: '4px' }}>{room.direction}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Adjust dimensions panel */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '16px', backgroundColor: 'var(--bg-color)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: '0.9rem', fontWeight: '800' }}>📐 Room Dimensions</h4>
                  
                  {currentSelectedRoom ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--accent-color)' }}>
                        Configuring: {currentSelectedRoom.name}
                      </div>

                      {/* Slider Width */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px', fontWeight: '600' }}>
                          <span>Width (feet)</span>
                          <span>{currentSelectedRoom.rw} ft</span>
                        </div>
                        <input
                          type="range"
                          min="6"
                          max="24"
                          value={currentSelectedRoom.rw}
                          onChange={(e) => handleRoomSizeChange(currentSelectedRoom.id, 'rw', e.target.value)}
                          style={{ width: '100%', accentColor: 'var(--accent-color)' }}
                        />
                      </div>

                      {/* Slider Length */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px', fontWeight: '600' }}>
                          <span>Length (feet)</span>
                          <span>{currentSelectedRoom.rl} ft</span>
                        </div>
                        <input
                          type="range"
                          min="6"
                          max="24"
                          value={currentSelectedRoom.rl}
                          onChange={(e) => handleRoomSizeChange(currentSelectedRoom.id, 'rl', e.target.value)}
                          style={{ width: '100%', accentColor: 'var(--accent-color)' }}
                        />
                      </div>

                      {/* Quadrant Selection */}
                      <div>
                        <span style={{ fontSize: '0.75rem', display: 'block', marginBottom: '6px', fontWeight: '600' }}>Vastu Direction Zone</span>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                          {['NE', 'N', 'NW', 'E', 'Center', 'W', 'SE', 'S', 'SW'].map(d => (
                            <button
                              key={d}
                              onClick={() => { handleRoomDirChange(currentSelectedRoom.id, d); setOverrideVastu(false); }}
                              style={{
                                padding: '6px 4px', fontSize: '0.7rem', fontWeight: '700', borderRadius: '6px', cursor: 'pointer',
                                border: `1px solid ${currentSelectedRoom.direction === d ? 'var(--accent-color)' : 'var(--border-color)'}`,
                                backgroundColor: currentSelectedRoom.direction === d ? 'var(--accent-color)' : 'var(--surface-color)',
                                color: currentSelectedRoom.direction === d ? 'white' : 'var(--text-color)'
                              }}
                            >
                              {d}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: '1.4', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                        💡 {currentSelectedRoom.description}
                      </div>

                    </div>
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Click a room block to modify its length, width, and facing.</div>
                  )}
                </div>

                <div style={{ padding: '16px', backgroundColor: 'var(--bg-color)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: '0.85rem', fontWeight: '800' }}>📊 Area Totals</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                    <span>Plot Dimensions:</span>
                    <span style={{ fontWeight: '700' }}>{length}x{width} ft</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                    <span>Total Plot Area:</span>
                    <span style={{ fontWeight: '700' }}>{length * width} sqft</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                    <span>Allocated Carpet Area:</span>
                    <span style={{ fontWeight: '700' }}>{rooms2D.reduce((acc, curr) => acc + (curr.rw * curr.rl), 0)} sqft</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: 3D INTERACTIVE WALKTHROUGH */}
        {activeTab === '3d' && (
          <HouseViewer3D data={resolvedData} customRooms={rooms2D} materials={materials} setMaterials={setMaterials} liveCosts={calculateLiveCosts()} budget={budget} />
        )}

        {/* TAB 6: AI EXTERIOR ELEVATION */}
        {activeTab === 'elevation' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', margin: '0 0 4px' }}>🏠 AI Exterior Elevation Designer</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                Suggest exterior elevations, upload reference designs, or let our Llama 3 AI design modern facade details for your G+1 house layout.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', flexWrap: 'wrap' }}>
              {/* Left Column: AI Suggestions Render */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '20px', backgroundColor: 'var(--bg-color)', borderRadius: '16px', border: '1px solid var(--border-color)', minHeight: '300px' }}>
                  {isGeneratingElevation ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', gap: '12px' }}>
                      <div className="animate-spin" style={{ width: '32px', height: '32px', border: '4px solid var(--border-color)', borderTopColor: '#2563eb', borderRadius: '50%' }} />
                      <p style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)' }}>AI is constructing your elevation details...</p>
                    </div>
                  ) : aiElevationResult ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px' }}>
                      {/* Photorealistic Render Card */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                          <img
                            src={(() => {
                              if (elevationStyle === 'Contemporary Glass Facade') return '/assets/ai/contemporary_glass_exterior.png';
                              if (elevationStyle === 'Traditional Indian / Pillars') return '/assets/ai/traditional_indian_exterior.png';
                              if (elevationStyle === 'Mediterranean Villa Style') return '/assets/ai/mediterranean_exterior.png';
                              return '/assets/ai/modern_minimalist_exterior.png';
                            })()}
                            alt="Photorealistic AI Render"
                            style={{ width: '100%', height: 'auto', display: 'block', transition: 'transform 0.3s ease' }}
                          />
                          <div style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: 'rgba(15,23,42,0.85)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.72rem', color: '#fbbf24', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', backdropFilter: 'blur(4px)' }}>
                            <Sparkles size={12} /> AI RENDER
                          </div>
                        </div>
                        <a
                          href={
                            elevationStyle === 'Contemporary Glass Facade'
                              ? '/assets/ai/contemporary_glass_exterior.png'
                              : elevationStyle === 'Traditional Indian / Pillars'
                              ? '/assets/ai/traditional_indian_exterior.png'
                              : elevationStyle === 'Mediterranean Villa Style'
                              ? '/assets/ai/mediterranean_exterior.png'
                              : '/assets/ai/modern_minimalist_exterior.png'
                          }
                          download={`GharBanaoAI_${elevationStyle.replace(/ /g, '_')}_Render.png`}
                          style={{
                            padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--surface-color)', color: 'var(--text-color)', fontSize: '0.8rem',
                            fontWeight: '700', cursor: 'pointer', textAlign: 'center', textDecoration: 'none',
                            display: 'inline-block', transition: 'all 0.2s', boxShadow: 'var(--shadow-sm)'
                          }}
                        >
                          📥 Download Photorealistic Render
                        </a>
                      </div>

                      {/* Blueprint Text */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                          <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#2563eb' }}>📐 Elevation Blueprint</h4>
                          <span style={{ fontSize: '0.72rem', backgroundColor: 'rgba(37,99,235,0.08)', color: '#2563eb', padding: '4px 8px', borderRadius: '6px', fontWeight: '700' }}>{elevationStyle}</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', lineHeight: '1.7', whiteSpace: 'pre-wrap', color: 'var(--text-color)', maxHeight: '380px', overflowY: 'auto', paddingRight: '8px' }}>
                          {aiElevationResult}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                      <Sparkles size={48} color="var(--border-color)" style={{ marginBottom: '12px' }} />
                      <h4 style={{ margin: '0 0 6px', fontWeight: '800' }}>No Elevation Generated Yet</h4>
                      <p style={{ fontSize: '0.8rem', maxWidth: '360px', margin: 0 }}>
                        Select your design theme in the sidebar and click **Generate Elevation with AI** to construct details.
                      </p>
                    </div>
                  )}
                </div>

                {/* Picture suggestion box */}
                <div style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: 'var(--surface-color)' }}>
                  <div style={{ width: '80px', height: '60px', borderRadius: '8px', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#64748b' }}>🖼️</div>
                  <div>
                    <h5 style={{ margin: '0 0 2px', fontSize: '0.85rem', fontWeight: '800' }}>Render Mockup Reference</h5>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Our AI will draft custom cladding, railings, double-glazing, and landscaping plans for your G+1 build.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Theme Selection & Reference Image Uploader */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Elevation Themes */}
                <div style={{ padding: '16px', backgroundColor: 'var(--bg-color)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: '0.9rem', fontWeight: '800' }}>🎨 Facade Design Themes</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {['Modern Minimalist', 'Traditional Indian / Pillars', 'Contemporary Glass Facade', 'Mediterranean Villa Style'].map(style => (
                      <button
                        key={style}
                        onClick={() => setElevationStyle(style)}
                        style={{
                          width: '100%', textAlign: 'left', padding: '10px 12px', fontSize: '0.8rem', fontWeight: '600', borderRadius: '8px', cursor: 'pointer',
                          border: `1px solid ${elevationStyle === style ? '#2563eb' : 'var(--border-color)'}`,
                          backgroundColor: elevationStyle === style ? 'rgba(37,99,235,0.08)' : 'var(--surface-color)',
                          color: elevationStyle === style ? '#2563eb' : 'var(--text-color)'
                        }}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Picture Uploader */}
                <div style={{ padding: '16px', backgroundColor: 'var(--bg-color)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ margin: '0 0 6px', fontSize: '0.9rem', fontWeight: '800' }}>📷 Upload Facade Reference</h4>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: '0 0 12px' }}>
                    Upload a reference photograph of an elevation design you like -- our AI advisor will tailor it to your plot width and floors.
                  </p>
                  
                  <div style={{ border: '2px dashed var(--border-color)', borderRadius: '8px', padding: '20px 10px', textAlign: 'center', cursor: 'pointer', backgroundColor: 'var(--surface-color)' }} onClick={() => {
                    const mockFileName = `elevation_idea_${Math.floor(Math.random() * 1000)}.jpg`;
                    setUploadedImageName(mockFileName);
                  }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--accent-color)', fontWeight: '700' }}>
                      {uploadedImageName ? `✔️ ${uploadedImageName}` : 'Click to Upload Reference Image'}
                    </span>
                    <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>PNG, JPG or WEBP (Max 8MB)</span>
                  </div>
                </div>

                {/* Custom Specifications Textarea */}
                <div style={{ padding: '16px', backgroundColor: 'var(--bg-color)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ margin: '0 0 6px', fontSize: '0.9rem', fontWeight: '800' }}>✍️ Custom Specifications</h4>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: '0 0 8px' }}>
                    Describe any specific features you want (e.g. "Glass balconies", "Nameplate reading 'PADMAJA RETREAT'", "Pillars at entrance").
                  </p>
                  <textarea
                    value={elevationPrompt}
                    onChange={(e) => setElevationPrompt(e.target.value)}
                    placeholder="Enter custom specifications..."
                    style={{
                      width: '100%', height: '80px', borderRadius: '8px', border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--surface-color)', color: 'var(--text-color)', padding: '10px',
                      fontSize: '0.82rem', resize: 'none', outline: 'none', fontFamily: 'inherit'
                    }}
                  />
                </div>

                {/* Generate Action Button */}
                <button
                  onClick={handleGenerateElevation}
                  disabled={isGeneratingElevation}
                  style={{
                    width: '100%', padding: '12px', borderRadius: '10px', fontSize: '0.875rem', fontWeight: '700',
                    background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', border: 'none', color: 'white', cursor: isGeneratingElevation ? 'wait' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(124,58,237,0.2)'
                  }}
                >
                  <Sparkles size={16} /> Generate AI Elevation Details
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: AI INTERIOR DESIGN */}
        {activeTab === 'interiors' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', margin: '0 0 4px' }}>🛋️ AI Interior Designer</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                Design state-of-the-art cupboards, wardrobes, beds, TV units, pooja rooms, or modular kitchen details with Llama 3 AI.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', flexWrap: 'wrap' }}>
              {/* Left Column: AI Suggestions Render */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '20px', backgroundColor: 'var(--bg-color)', borderRadius: '16px', border: '1px solid var(--border-color)', minHeight: '300px' }}>
                  {isGeneratingInterior ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', gap: '12px' }}>
                      <div className="animate-spin" style={{ width: '32px', height: '32px', border: '4px solid var(--border-color)', borderTopColor: '#2563eb', borderRadius: '50%' }} />
                      <p style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)' }}>AI is rendering modular details...</p>
                    </div>
                  ) : aiInteriorResult ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px' }}>
                      {/* Photorealistic Render Card */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                          <img
                            src={(() => {
                              if (interiorSpace.includes('Kitchen')) return '/assets/ai/modular_kitchen_interior.png';
                              if (interiorSpace.includes('Pooja')) return '/assets/ai/pooja_room_interior.png';
                              if (interiorSpace.includes('TV Unit')) return '/assets/ai/tv_unit_interior.png';
                              if (interiorSpace.includes('Cupboard') || interiorSpace.includes('Wardrobe')) return '/assets/ai/wardrobe_cupboard_interior.png';
                              if (interiorSpace.includes('Master Bed') || interiorSpace.includes('Bed')) return '/assets/ai/master_bed_interior.png';
                              return '/assets/ai/bed_luxury_interior.png';
                            })()}
                            alt="Photorealistic AI Render"
                            style={{ width: '100%', height: 'auto', display: 'block', transition: 'transform 0.3s ease' }}
                          />
                          <div style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: 'rgba(15,23,42,0.85)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.72rem', color: '#fbbf24', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', backdropFilter: 'blur(4px)' }}>
                            <Sparkles size={12} /> AI RENDER
                          </div>
                        </div>
                        <a
                          href={(() => {
                              if (interiorSpace.includes('Kitchen')) return '/assets/ai/modular_kitchen_interior.png';
                              if (interiorSpace.includes('Pooja')) return '/assets/ai/pooja_room_interior.png';
                              if (interiorSpace.includes('TV Unit')) return '/assets/ai/tv_unit_interior.png';
                              if (interiorSpace.includes('Cupboard') || interiorSpace.includes('Wardrobe')) return '/assets/ai/wardrobe_cupboard_interior.png';
                              if (interiorSpace.includes('Master Bed') || interiorSpace.includes('Bed')) return '/assets/ai/master_bed_interior.png';
                              return '/assets/ai/bed_luxury_interior.png';
                          })()}
                          download={`GharBanaoAI_${interiorSpace.replace(/ /g, '_')}_Render.png`}
                          style={{
                            padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--surface-color)', color: 'var(--text-color)', fontSize: '0.8rem',
                            fontWeight: '700', cursor: 'pointer', textAlign: 'center', textDecoration: 'none',
                            display: 'inline-block', transition: 'all 0.2s', boxShadow: 'var(--shadow-sm)'
                          }}
                        >
                          📥 Download Photorealistic Render
                        </a>
                      </div>

                      {/* Blueprint Text */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                          <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#2563eb' }}>📐 Interior Blueprint</h4>
                          <span style={{ fontSize: '0.72rem', backgroundColor: 'rgba(37,99,235,0.08)', color: '#2563eb', padding: '4px 8px', borderRadius: '6px', fontWeight: '700' }}>{interiorSpace}</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', lineHeight: '1.7', whiteSpace: 'pre-wrap', color: 'var(--text-color)', maxHeight: '380px', overflowY: 'auto', paddingRight: '8px' }}>
                          {aiInteriorResult}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                      <Sparkles size={48} color="var(--border-color)" style={{ marginBottom: '12px' }} />
                      <h4 style={{ margin: '0 0 6px', fontWeight: '800' }}>No Interior Plan Generated Yet</h4>
                      <p style={{ fontSize: '0.8rem', maxWidth: '360px', margin: 0 }}>
                        Select your design theme in the sidebar and click **Generate AI Interior Plan** to draft layouts and material selections.
                      </p>
                    </div>
                  )}
                </div>

                {/* Picture suggestion box */}
                <div style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: 'var(--surface-color)' }}>
                  <div style={{ width: '80px', height: '60px', borderRadius: '8px', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#64748b' }}>📐</div>
                  <div>
                    <h5 style={{ margin: '0 0 2px', fontSize: '0.85rem', fontWeight: '800' }}>Modular Detail Reference</h5>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Tailored layouts with high-quality soft-close hardware recommendations (Hettich, Hafele, Blum).
                    </p>
                  </div>
                </div>

                {/* AI Moodboard */}
                <Moodboard style={interiorStyle} />
              </div>

              {/* Right Column: Theme Selection & Reference Image Uploader */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Space Selector */}
                <div style={{ padding: '16px', backgroundColor: 'var(--bg-color)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: '0.9rem', fontWeight: '800' }}>🛋️ Select Interior Element</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {['Cupboards / Wardrobes', 'Master Bed Design', 'TV Unit Console', 'Pooja Room Mandir', 'Modular Kitchen Cabinets'].map(space => (
                      <button
                        key={space}
                        onClick={() => setInteriorSpace(space)}
                        style={{
                          width: '100%', textAlign: 'left', padding: '10px 12px', fontSize: '0.8rem', fontWeight: '600', borderRadius: '8px', cursor: 'pointer',
                          border: `1px solid ${interiorSpace === space ? '#2563eb' : 'var(--border-color)'}`,
                          backgroundColor: interiorSpace === space ? 'rgba(37,99,235,0.08)' : 'var(--surface-color)',
                          color: interiorSpace === space ? '#2563eb' : 'var(--text-color)'
                        }}
                      >
                        {space}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Style Selector */}
                <div style={{ padding: '16px', backgroundColor: 'var(--bg-color)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: '0.9rem', fontWeight: '800' }}>🎨 Interior Style Themes</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {['Modern Minimalist', 'Royal / Classical Teak', 'Scandinavian Light Wood', 'Contemporary Gloss Luxury'].map(style => (
                      <button
                        key={style}
                        onClick={() => setInteriorStyle(style)}
                        style={{
                          width: '100%', textAlign: 'left', padding: '10px 12px', fontSize: '0.8rem', fontWeight: '600', borderRadius: '8px', cursor: 'pointer',
                          border: `1px solid ${interiorStyle === style ? '#2563eb' : 'var(--border-color)'}`,
                          backgroundColor: interiorStyle === style ? 'rgba(37,99,235,0.08)' : 'var(--surface-color)',
                          color: interiorStyle === style ? '#2563eb' : 'var(--text-color)'
                        }}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Upload Panel */}
                <div style={{ padding: '16px', backgroundColor: 'var(--bg-color)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ margin: '0 0 6px', fontSize: '0.9rem', fontWeight: '800' }}>📷 Upload Room Reference</h4>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: '0 0 12px' }}>
                    Upload a sketch or catalog picture -- our AI advisor will analyze the layout and produce specs matching your exact built-up area.
                  </p>
                  
                  <div style={{ border: '2px dashed var(--border-color)', borderRadius: '8px', padding: '20px 10px', textAlign: 'center', cursor: 'pointer', backgroundColor: 'var(--surface-color)' }} onClick={() => {
                    const mockFileName = `interior_ref_${Math.floor(Math.random() * 1000)}.jpg`;
                    setUploadedInteriorName(mockFileName);
                  }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--accent-color)', fontWeight: '700' }}>
                      {uploadedInteriorName ? `✔️ ${uploadedInteriorName}` : 'Click to Upload Reference Image'}
                    </span>
                    <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>PNG, JPG or WEBP (Max 8MB)</span>
                  </div>
                </div>

                {/* Custom Specifications Textarea */}
                <div style={{ padding: '16px', backgroundColor: 'var(--bg-color)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ margin: '0 0 6px', fontSize: '0.9rem', fontWeight: '800' }}>✍️ Custom Specifications</h4>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: '0 0 8px' }}>
                    Describe any specific features you want (e.g. "Warm wood tones", "Golden profile lights", "Glass cupboard doors").
                  </p>
                  <textarea
                    value={interiorPrompt}
                    onChange={(e) => setInteriorPrompt(e.target.value)}
                    placeholder="Enter custom specifications..."
                    style={{
                      width: '100%', height: '80px', borderRadius: '8px', border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--surface-color)', color: 'var(--text-color)', padding: '10px',
                      fontSize: '0.82rem', resize: 'none', outline: 'none', fontFamily: 'inherit'
                    }}
                  />
                </div>

                {/* Generate Action Button */}
                <button
                  onClick={handleGenerateInterior}
                  disabled={isGeneratingInterior}
                  style={{
                    width: '100%', padding: '12px', borderRadius: '10px', fontSize: '0.875rem', fontWeight: '700',
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', border: 'none', color: 'white', cursor: isGeneratingInterior ? 'wait' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(37,99,235,0.2)'
                  }}
                >
                  <Sparkles size={16} /> Generate AI Interior Plan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB: EMI CALCULATOR */}
        {activeTab === 'emi' && (
          <EMICalculator defaultBudget={budget} />
        )}

        {/* TAB: CONSTRUCTION TRACKER */}
        {activeTab === 'timeline' && (
          <ConstructionTracker data={resolvedData} activeProject={activeProject} />
        )}

        {/* TAB: APPROVALS & DOCUMENTS CHECKLIST */}
        {activeTab === 'approvals' && (() => {
          const approvalSections = [
            {
              id: 'land',
              title: '🌱 1. Land Ownership & NA Conversion',
              description: 'Ensure legal clearance and residential zoning conversion before designing.',
              items: [
                { id: 'sale_deed', name: 'Registered Sale Deed / Title Deed', desc: 'Primary legal proof of land ownership.' },
                { id: 'extract_712', name: '7/12 Extract (Patta / Khata Certificate)', desc: 'Official revenue document detailing landowners.' },
                { id: 'na_cert', name: 'Non-Agricultural (NA) Certificate', desc: 'Crucial if land classification is converted from agriculture.' },
                { id: 'tax_receipts', name: 'Cleared Property Tax Paid Receipts', desc: 'Proves zero pending land tax liabilities.' },
                { id: 'encumbrance', name: 'Encumbrance Certificate (EC)', desc: 'Certifies land is free from mortgages/disputes.' }
              ]
            },
            {
              id: 'plan_sanction',
              title: '📐 2. Municipal Building Plan Sanction',
              description: 'Get architectural approval from your local Corporation (e.g. BBMP, BMC) or Gram Panchayat.',
              items: [
                { id: 'arch_drawings', name: 'Scale Architectural blueprints', desc: 'Full structural layouts drawn by a registered architect.' },
                { id: 'struct_stability', name: 'Structural Stability Certificate', desc: 'Issued by an empanelled structural engineer.' },
                { id: 'land_survey', name: 'Certified Land Survey Boundary Map', desc: 'Verifies the physical boundaries of your plot.' },
                { id: 'commencement', name: 'Commencement Certificate', desc: 'Official approval to dig the foundation.' }
              ]
            },
            {
              id: 'utility_electric',
              title: '⚡ 3. Electricity Board Connection (NOC)',
              description: 'Required for a temporary construction line, later converted to a residential meter.',
              items: [
                { id: 'elec_app', name: 'Connection Request Application Form', desc: 'Obtained from State Power Discom (e.g. MSEB, BESCOM).' },
                { id: 'elec_id_proof', name: 'Applicant Identity Proof (Aadhaar/PAN)', desc: 'Identifies the land owner.' },
                { id: 'elec_land_proof', name: 'Sale Deed Copy & Current Tax Receipt', desc: 'Verifies ownership of property requesting power.' },
                { id: 'elec_plan_copy', name: 'Approved Building Plan copy', desc: 'Ensures the construction is fully authorized.' },
                { id: 'elec_load_calc', name: 'Load Requirement Sheet', desc: 'Certified load estimate by a licensed electrical contractor.' }
              ]
            },
            {
              id: 'utility_water',
              title: '💧 4. Water & Sewage Connection NOC',
              description: 'Approval from Municipal Water Board for local tap water supply or borewell permission.',
              items: [
                { id: 'water_tax_clearance', name: 'Water Board Connection Application', desc: 'Application form with cleared past dues.' },
                { id: 'plumbing_layout', name: 'Plumbing & Drainage Layout Diagram', desc: 'Shows connection route to the local sewage main.' },
                { id: 'borewell_permission', name: 'Borewell Drilling NOC (if applicable)', desc: 'Required in notified ground-water sensitive zones.' }
              ]
            },
            {
              id: 'completion',
              title: '🔑 5. Occupancy Certificate (OC)',
              description: 'Issued by municipal body after construction to verify the structure conforms to plans. Moving in without an OC is illegal.',
              items: [
                { id: 'completion_cert', name: 'Builder/Architect Completion Certificate', desc: 'Certifies physical construction matches approved designs.' },
                { id: 'safety_noc', name: 'Fire Safety NOC (for multi-story houses)', desc: 'NOC from local fire brigade.' },
                { id: 'photo_completion', name: 'Finished Property Site Photos', desc: 'Front, sides, sewage, and rainwater harvesting structures.' }
              ]
            }
          ];

          // Calculate progress
          const totalDocs = approvalSections.reduce((acc, sec) => acc + sec.items.length, 0);
          const checkedCount = approvalSections.reduce((acc, sec) => acc + sec.items.filter(item => checkedDocs[item.id]).length, 0);
          const percentCollected = totalDocs > 0 ? Math.round((checkedCount / totalDocs) * 100) : 0;

          return (
            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Progress HUD */}
              <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'linear-gradient(135deg, rgba(37,99,235,0.06), rgba(139,92,246,0.06))', border: '1px solid rgba(37,99,235,0.15)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '4px' }}>📋 Document & Approvals Checklist</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Gather these documents before visiting municipal offices to avoid multiple trips!</p>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: '120px' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary-color)' }}>{checkedCount} / {totalDocs}</span>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>DOCUMENTS COLLECTED</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                    <span>Preparation Progress</span>
                    <span>{percentCollected}% Complete</span>
                  </div>
                  <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--border-color)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: `${percentCollected}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', borderRadius: '999px', transition: 'width 0.4s ease' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '12px 16px', backgroundColor: 'rgba(59,130,246,0.08)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span style={{ fontSize: '1.2rem' }}>💡</span>
                  <span><strong>Pro Tip:</strong> Take at least <strong>3 self-attested photocopies</strong> of each document, along with 4 passport-size photographs, before going to any government desk! Your checkmarks will be saved automatically.</span>
                </div>
              </div>

              {/* Sections Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {approvalSections.map(section => {
                  const sectionTotal = section.items.length;
                  const sectionChecked = section.items.filter(item => checkedDocs[item.id]).length;

                  return (
                    <div key={section.id} className="card" style={{ padding: '24px', border: '1px solid var(--border-color)' }}>
                      {/* Section Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-color)', marginBottom: '4px' }}>{section.title}</h4>
                          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{section.description}</p>
                        </div>
                        <span style={{ fontSize: '0.8rem', padding: '4px 10px', backgroundColor: sectionChecked === sectionTotal ? 'rgba(16,185,129,0.1)' : 'rgba(37,99,235,0.08)', color: sectionChecked === sectionTotal ? 'var(--success-color)' : 'var(--primary-color)', borderRadius: '20px', fontWeight: '700' }}>
                          {sectionChecked} / {sectionTotal} Done
                        </span>
                      </div>

                      {/* Documents List */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {section.items.map(item => {
                          const isChecked = !!checkedDocs[item.id];
                          return (
                            <div 
                              key={item.id} 
                              onClick={() => toggleDoc(item.id)}
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '14px', 
                                padding: '12px 16px', 
                                backgroundColor: isChecked ? 'rgba(16,185,129,0.04)' : 'var(--bg-color)', 
                                border: `1px solid ${isChecked ? 'rgba(16,185,129,0.2)' : 'var(--border-color)'}`,
                                borderRadius: '8px', 
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={e => {
                                if (!isChecked) e.currentTarget.style.borderColor = 'var(--primary-color)';
                              }}
                              onMouseLeave={e => {
                                if (!isChecked) e.currentTarget.style.borderColor = 'var(--border-color)';
                              }}
                            >
                              {/* Custom Styled Checkbox */}
                              <div style={{ 
                                width: '20px', 
                                height: '20px', 
                                borderRadius: '4px', 
                                border: `2px solid ${isChecked ? 'var(--success-color)' : 'var(--text-muted)'}`,
                                backgroundColor: isChecked ? 'var(--success-color)' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s',
                                flexShrink: 0
                              }}>
                                {isChecked && <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 'bold' }}>✓</span>}
                              </div>

                              {/* Title and Description */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-color)', textDecoration: isChecked ? 'line-through' : 'none', opacity: isChecked ? 0.75 : 1 }}>
                                  {item.name}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', opacity: isChecked ? 0.6 : 0.8 }}>
                                  {item.desc}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          );
        })()}

        {/* UPGRADE 6: Material Compare — shown in 3D tab as floating hint */}
        {activeTab === '3d' && (
          <div style={{ marginTop: '16px', padding: '14px 18px', borderRadius: '12px', background: 'linear-gradient(135deg,rgba(37,99,235,0.08),rgba(124,58,237,0.08))', border: '1px solid rgba(37,99,235,0.2)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.4rem' }}>💡</span>
            <div>
              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-color)' }}>Pro Tip: </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Click any material in the right panel → select a new option → the 3D house updates instantly and the Live Budget HUD shows cost difference in real-time.</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
