import React, { useState } from 'react';
import { MapPin, Phone, MessageCircle, Star, Sparkles, Shield } from 'lucide-react';
import LivePriceTicker from './LivePriceTicker';
import VendorReview from './VendorReview';

// Default Visakhapatnam Sourcing Hub vendors
const DEFAULT_VENDORS = {
  'Cement & Steel': [
    { name: 'Sri Sai Cement Traders', phone: '9876543210', rating: 4.8, distance: '3.2 km', location: 'Visakhapatnam', discount: '5% off on 50+ bags', verified: true },
    { name: 'Lakshmi Building Supplies', phone: '9123456789', rating: 4.6, distance: '5.1 km', location: 'Visakhapatnam', discount: 'Free delivery above Rs. 10,000', verified: true },
    { name: 'Balaji Cement & Hardware', phone: '9988776655', rating: 4.5, distance: '6.4 km', location: 'Visakhapatnam', discount: 'Wholesale rates on bulk', verified: false },
    { name: 'Vijaya Traders', phone: '9345678901', rating: 4.4, distance: '8.2 km', location: 'Visakhapatnam', discount: '3% off on Ultratech brand', verified: false },
    { name: 'Durga Construction Mart', phone: '9654321098', rating: 4.7, distance: '10.0 km', location: 'Visakhapatnam', discount: 'TMT bars at mill rate', verified: true },
  ],
  'Sand & Aggregate': [
    { name: 'Ganesh Sand Suppliers', phone: '9812345670', rating: 4.7, distance: '4.5 km', location: 'Visakhapatnam', discount: 'Free delivery within 10km', verified: true },
    { name: 'Vizag M-Sand Factory', phone: '9700123456', rating: 4.6, distance: '7.3 km', location: 'Visakhapatnam', discount: 'M-Sand @ Rs. 45/cft', verified: true },
    { name: 'Saraswathi Aggregates', phone: '9543210987', rating: 4.4, distance: '9.1 km', location: 'Visakhapatnam', discount: '20mm metal bulk discount', verified: false },
    { name: 'KVR Sand & Gravel', phone: '9432198765', rating: 4.5, distance: '11.2 km', location: 'Visakhapatnam', discount: '5% off on 10+ loads', verified: false },
    { name: 'Haritha River Sand Co.', phone: '9321987654', rating: 4.3, distance: '14.0 km', location: 'Visakhapatnam', discount: 'River sand — limited stock', verified: false },
  ],
  'Red Clay Bricks': [
    { name: 'Royal Bricks Mfg Pvt Ltd', phone: '9210987654', rating: 4.5, distance: '12.0 km', location: 'Visakhapatnam', discount: 'Free delivery for 10k+ bricks', verified: false },
    { name: 'Andhra Brick Works', phone: '9109876543', rating: 4.6, distance: '15.3 km', location: 'Visakhapatnam', discount: 'Rs. 5.50/brick bulk rate', verified: true },
    { name: 'Srinivasa Brick Kiln', phone: '9098765432', rating: 4.3, distance: '18.0 km', location: 'Visakhapatnam', discount: 'Wire cut bricks available', verified: false },
    { name: 'Pavan Fly Ash Bricks', phone: '9876123450', rating: 4.7, distance: '8.5 km', location: 'Visakhapatnam', discount: 'Eco bricks — 20% stronger', verified: true },
    { name: 'Tirumala Bricks Centre', phone: '9765012345', rating: 4.4, distance: '20.0 km', location: 'Visakhapatnam', discount: 'Bulk order discount 8%', verified: false },
  ],
  'Flooring & Ceramics': [
    { name: 'Elite Tiles & Sanitary', phone: '9888877777', rating: 4.6, distance: '4.1 km', location: 'Visakhapatnam', discount: 'Wholesale pricing on Kajaria', verified: true },
    { name: 'Pavani Tiles World', phone: '9777766666', rating: 4.5, distance: '5.8 km', location: 'Visakhapatnam', discount: '10% off on 500+ sq.ft order', verified: true },
    { name: 'Galaxy Ceramics Showroom', phone: '9666655555', rating: 4.7, distance: '7.0 km', location: 'Visakhapatnam', discount: 'Johnson tiles at best price', verified: false },
    { name: 'Sree Sai Floor Studio', phone: '9555544444', rating: 4.4, distance: '9.3 km', location: 'Visakhapatnam', discount: 'Italian marble from Rs. 85/sqft', verified: false },
    { name: 'Sri Krishna Granites', phone: '9444433333', rating: 4.6, distance: '11.5 km', location: 'Visakhapatnam', discount: 'Granite slabs direct', verified: true },
  ],
  'Teak Doors & Windows': [
    { name: 'WoodCrafters Studio', phone: '9333344444', rating: 4.8, distance: '8.5 km', location: 'Visakhapatnam', discount: 'Free frame polishing', verified: false },
    { name: 'Vijaya Timber Works', phone: '9222233333', rating: 4.6, distance: '10.2 km', location: 'Visakhapatnam', discount: 'Teak from Dandeli forest', verified: true },
    { name: 'Modern Doors & Windows', phone: '9111122222', rating: 4.5, distance: '6.4 km', location: 'Visakhapatnam', discount: 'UPVC windows 15% off', verified: true },
    { name: 'Sri Ram Timber Depot', phone: '9000011111', rating: 4.4, distance: '13.0 km', location: 'Visakhapatnam', discount: 'Burma teak available', verified: false },
    { name: 'Classic Furniture & Doors', phone: '8999900000', rating: 4.7, distance: '5.5 km', location: 'Visakhapatnam', discount: 'Designer doors on display', verified: true },
  ],
  'Wires & Switches': [
    { name: 'Balaji Electricals', phone: '9111122222', rating: 4.7, distance: '6.3 km', location: 'Visakhapatnam', discount: '10% off Polycab coils', verified: true },
    { name: 'Surya Electrical Stores', phone: '8888877777', rating: 4.5, distance: '4.8 km', location: 'Visakhapatnam', discount: 'Finolex wires wholesale', verified: true },
    { name: 'Havells Zone Dealer', phone: '8777766666', rating: 4.8, distance: '3.9 km', location: 'Visakhapatnam', discount: 'Havells authorised dealer', verified: false },
    { name: 'Pavan Power Solutions', phone: '8666655555', rating: 4.4, distance: '7.6 km', location: 'Visakhapatnam', discount: 'MCB & DB boards bulk', verified: false },
    { name: 'Raju Electricals Mart', phone: '8555544444', rating: 4.6, distance: '9.0 km', location: 'Visakhapatnam', discount: 'LED lights at factory price', verified: false },
  ],
  'Civil Contractor': [
    { name: 'BuildRight Contractors', phone: '9988776655', rating: 4.9, distance: '5.5 km', location: 'Visakhapatnam', discount: 'Free Vastu Consultation', verified: false },
    { name: 'Sai Constructions', phone: '8444433333', rating: 4.7, distance: '3.8 km', location: 'Visakhapatnam', discount: 'Rs. 1,750/sqft all-inclusive', verified: true },
    { name: 'AP Master Builders', phone: '8333322222', rating: 4.8, distance: '6.2 km', location: 'Visakhapatnam', discount: 'RCC frame specialist', verified: true },
    { name: 'Vizag Civil Works', phone: '8222211111', rating: 4.6, distance: '8.0 km', location: 'Visakhapatnam', discount: 'Transparent billing assured', verified: false },
    { name: 'Prakash Construction Co.', phone: '8111100000', rating: 4.5, distance: '11.0 km', location: 'Visakhapatnam', discount: 'Experience: 200+ projects', verified: true },
  ],
};

// Specialized Trusted Vizianagaram Local Vendors within 100km
const VIZIANAGARAM_VENDORS = {
  'Cement & Steel': [
    { name: 'Sri Sai Cement & Steel Traders', phone: '9876543210', rating: 4.9, distance: '1.2 km', location: 'Gajula Rega, Vizianagaram', discount: '5% off on bulk Graphex/Birla cement', verified: true },
    { name: 'Vizianagaram Builders Depot', phone: '9123456789', rating: 4.7, distance: '3.4 km', location: 'Cantonment, Vizianagaram', discount: 'Premium Vizag Steel available at best rate', verified: true },
    { name: 'Sri Ramachandra Cement Corp', phone: '9988776655', rating: 4.6, distance: '4.1 km', location: 'Ring Road, Vizianagaram', discount: 'Free delivery in Vizianagaram limits', verified: true },
    { name: 'Balaji Steel & Metal Mart', phone: '9345678901', rating: 4.5, distance: '2.8 km', location: 'Mayuri Junction, Vizianagaram', discount: 'TMT Iron rods direct wholesale rates', verified: false },
    { name: 'Visakhapatnam Steel Syndicate', phone: '9654321098', rating: 4.8, distance: '54.0 km', location: 'Vizag Sourcing Hub (within 100km)', discount: 'Mill-direct bulk shipments available', verified: true },
  ],
  'Sand & Aggregate': [
    { name: 'Champavathi River Sand Basin', phone: '9812345670', rating: 4.8, distance: '8.2 km', location: 'Jonnavalasa, Vizianagaram', discount: 'Govt approved premium sand supply', verified: true },
    { name: 'Sri Srinivasa Granites & Aggregates', phone: '9700123456', rating: 4.6, distance: '3.9 km', location: 'Ring Road, Vizianagaram', discount: '20mm & 40mm aggregate wholesale rates', verified: true },
    { name: 'VZM Blue Metal Crusher', phone: '9543210987', rating: 4.5, distance: '12.5 km', location: 'Vizianagaram Rural', discount: 'M-Sand @ Rs. 42/cft — Premium grade', verified: false },
    { name: 'KVR River Sand Suppliers', phone: '9432198765', rating: 4.4, distance: '6.0 km', location: 'Vizianagaram cantonment', discount: '5% off on full truck orders', verified: false },
  ],
  'Red Clay Bricks': [
    { name: 'Gajula Rega Clay Brick Kilns', phone: '9210987654', rating: 4.8, distance: '2.0 km', location: 'Gajula Rega, Vizianagaram', discount: 'High quality local kiln red bricks @ Rs. 6/brick', verified: true },
    { name: 'Vizianagaram Eco Fly-Ash Bricks', phone: '9876123450', rating: 4.7, distance: '6.5 km', location: 'Jonnavalasa Road, Vizianagaram', discount: '20% extra strength eco-friendly blocks', verified: true },
    { name: 'Sri Lakshmi Brick Works', phone: '9109876543', rating: 4.5, distance: '14.2 km', location: 'Gantyada, Vizianagaram', discount: 'Free local delivery above 8000 bricks', verified: false },
    { name: 'Tirumala Brick Yard', phone: '9098765432', rating: 4.4, distance: '8.8 km', location: 'Vizianagaram Bypass', discount: 'Bulk supply discount 6%', verified: false },
  ],
  'Flooring & Ceramics': [
    { name: 'Elite Kajaria Ceramics Studio', phone: '9888877777', rating: 4.8, distance: '2.5 km', location: 'Mayuri Junction, Vizianagaram', discount: 'Wholesale prices on Kajaria & Johnson tiles', verified: true },
    { name: 'Sri Balaji Tiles & Sanitaryware', phone: '9777766666', rating: 4.6, distance: '3.8 km', location: 'Cantonment, Vizianagaram', discount: '10% off on premium marble and vitrified tiles', verified: true },
    { name: 'Vizag Marble & Granite Emporium', phone: '9666655555', rating: 4.7, distance: '52.0 km', location: 'Vizag Hub (within 100km)', discount: 'Premium Italian marble direct import rates', verified: false },
    { name: 'Sree Sai Floor House', phone: '9555544444', rating: 4.4, distance: '4.5 km', location: 'Vizianagaram Bypass', discount: 'Granite slabs starting at Rs. 85/sqft', verified: false },
  ],
  'Teak Doors & Windows': [
    { name: 'WoodCrafters Timber & Door Depot', phone: '9333344444', rating: 4.8, distance: '2.1 km', location: 'Cantonment, Vizianagaram', discount: 'Genuine teak frames with custom artistic carving', verified: true },
    { name: 'Sri Rama Timber Depot & Furniture', phone: '9222233333', rating: 4.7, distance: '4.5 km', location: 'Ring Road, Vizianagaram', discount: 'Burma teak & seasoned local timber', verified: true },
    { name: 'Vijaya Timber Works', phone: '9111122222', rating: 4.6, distance: '3.0 km', location: 'Vizianagaram Cantonment', discount: 'UPVC and flush doors — 12% discount', verified: false },
  ],
  'Wires & Switches': [
    { name: 'VZM Power House Electricals', phone: '9111122222', rating: 4.8, distance: '1.8 km', location: 'Cantonment Road, Vizianagaram', discount: 'Finolex wires & Legrand modular sets wholesale', verified: true },
    { name: 'Sri Venkata Ramana Electricals', phone: '8888877777', rating: 4.7, distance: '2.9 km', location: 'Mayuri Junction, Vizianagaram', discount: '10% off Polycab coils & Havells switches', verified: true },
    { name: 'Havells Exclusive Galleria', phone: '8777766666', rating: 4.8, distance: '3.2 km', location: 'Vizianagaram town', discount: 'Authorized Havells premium home lighting', verified: true },
  ],
  'Civil Contractor': [
    { name: 'Vizianagaram Custom Builders', phone: '9988776655', rating: 4.9, distance: '1.5 km', location: 'Gajula Rega, Vizianagaram', discount: 'Specialist in narrow plot duplex G+1 structural design', verified: true },
    { name: 'SBR Constructions & Structural Engineers', phone: '8444433333', rating: 4.8, distance: '4.0 km', location: 'Ring Road, Vizianagaram', discount: 'Material inclusive high-end residential specialist', verified: true },
    { name: 'AP Master Builders', phone: '8333322222', rating: 4.7, distance: '3.1 km', location: 'Vizianagaram cantonment', discount: 'Rs. 1,690/sqft standard rates — Vastu expert', verified: true },
  ],
};

export default function SupplierDirectory({ data }) {
  const [activeCategory, setActiveCategory] = useState('Cement & Steel');
  const [searchOverride, setSearchOverride] = useState('');
  
  const city = searchOverride || data?.city || 'Vizianagaram';
  const isVZM = city.toLowerCase().includes('vizianag') || city.toLowerCase().includes('vzm') || city.toLowerCase().includes('vizianagram');

  // Toggle databases based on actual user chosen city
  const vendorDatabase = isVZM ? VIZIANAGARAM_VENDORS : DEFAULT_VENDORS;
  const categories = Object.keys(vendorDatabase);
  const vendors = vendorDatabase[activeCategory] || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <LivePriceTicker />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.5rem', margin: '0 0 4px', fontWeight: '700' }}>Local Trusted Vendors & Contractors</h3>
          <p style={{ color: 'var(--text-secondary)', margin: '0', fontSize: '0.85rem' }}>
            Showing trusted, verified building material dealers and structural experts within 100km range of <strong>{city}</strong>.
          </p>
        </div>
        
        {/* Glassmorphic Search Override input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)' }}>📍 Change Sourcing Area:</span>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input 
              type="text" 
              placeholder="Type city (e.g. vizianagram)..." 
              value={searchOverride}
              onChange={(e) => setSearchOverride(e.target.value)}
              style={{
                padding: '8px 28px 8px 14px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--surface-color)',
                color: 'var(--text-color)',
                fontSize: '0.82rem',
                fontWeight: '600',
                width: '230px',
                outline: 'none',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.2s'
              }}
            />
            {searchOverride && (
              <button 
                onClick={() => setSearchOverride('')} 
                style={{
                  position: 'absolute', right: '10px', background: 'none', border: 'none', 
                  color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'
                }}
              >✕</button>
            )}
          </div>
        </div>
      </div>
      {isVZM && (
        <div style={{ padding: '10px 14px', backgroundColor: 'rgba(16,185,129,0.1)', borderRadius: '8px', color: '#10b981', fontSize: '0.875rem', border: '1px solid rgba(16,185,129,0.2)' }}>
          📍 <strong>Local Vizianagaram Sourcing Active:</strong> Displaying hyper-local suppliers around <strong>Gajula Rega</strong>, <strong>Cantonment</strong>, and <strong>Ring Road</strong> with full 100km trusted coverage.
        </div>
      )}

      {/* Category Tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '7px 15px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '600',
              border: `1px solid ${activeCategory === cat ? '#2563eb' : 'var(--border-color)'}`,
              backgroundColor: activeCategory === cat ? '#2563eb' : 'transparent',
              color: activeCategory === cat ? 'white' : 'var(--text-secondary)',
              cursor: 'pointer', transition: 'all 0.2s'
            }}
          >{cat}</button>
        ))}
      </div>

      {/* Vendor Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '18px' }}>
        {vendors.map((vendor, idx) => (
          <div key={idx} style={{
            padding: '20px', borderRadius: '14px',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--surface-color)',
            display: 'flex', flexDirection: 'column', gap: '12px',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.borderColor = '#2563eb';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {activeCategory}
                </span>
                <h4 style={{ fontSize: '1rem', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}>
                  {vendor.name}
                  {vendor.verified && <Shield size={14} color="#10b981" title="Verified" />}
                  {idx === 0 && <Sparkles size={13} color="#f59e0b" title="Top Rated" />}
                </h4>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.85rem', fontWeight: '600', color: '#f59e0b', flexShrink: 0 }}>
                <Star size={13} fill="currentColor" /> {vendor.rating}
              </div>
            </div>

            {/* Distance and Location */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={13} color="#ef4444" /> <strong>{vendor.distance} away</strong>
              </div>
              <div style={{ fontSize: '0.75rem', paddingLeft: '19px', color: 'var(--text-muted)' }}>
                📍 {vendor.location}
              </div>
            </div>

            {/* Discount Tag */}
            <div style={{
              padding: '8px 12px',
              backgroundColor: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: '8px',
              color: '#10b981',
              fontSize: '0.78rem',
              fontWeight: '600'
            }}>
              🏷️ {vendor.discount}
            </div>

            {/* Vendor Reviews */}
            <VendorReview vendorName={vendor.name} />

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '8px' }}>
              <a
                href={`tel:+91${vendor.phone}`}
                style={{
                  flex: 1, padding: '10px', borderRadius: '8px',
                  border: '1px solid #2563eb', backgroundColor: 'transparent',
                  color: '#2563eb', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: '6px', fontWeight: '600',
                  fontSize: '0.82rem', textDecoration: 'none', cursor: 'pointer'
                }}
              >
                <Phone size={14} /> Call
              </a>
              <a
                href={`https://wa.me/91${vendor.phone}?text=Hi, I found you on GharBanao AI. I need ${activeCategory} in ${city} for my construction plan.`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1, padding: '10px', borderRadius: '8px',
                  border: 'none', backgroundColor: '#25D366',
                  color: 'white', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: '6px', fontWeight: '600',
                  fontSize: '0.82rem', textDecoration: 'none', cursor: 'pointer'
                }}
              >
                <MessageCircle size={14} /> WhatsApp
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
