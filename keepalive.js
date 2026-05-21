const http = require('http');
const https = require('https');

// ══════════════════════════════════════════════════════
// KEEP-ALIVE CONFIGURATION
// Replace these with your actual deployed Render / Vercel URLs
// ══════════════════════════════════════════════════════
const TARGETS = [
  'https://virtual-builder-backend.onrender.com/health', // Active Render backend health check
  'https://virtual-builder.vercel.app',                  // Vercel frontend
];

console.log(`[Keep-Alive] Triggered at: ${new Date().toISOString()}`);

TARGETS.forEach(url => {
  const client = url.startsWith('https') ? https : http;
  
  client.get(url, (res) => {
    console.log(`[Keep-Alive] Pinged ${url} - Status Code: ${res.statusCode}`);
  }).on('error', (err) => {
    console.error(`[Keep-Alive] Error pinging ${url}: ${err.message}`);
  });
});
