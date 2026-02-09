const fs = require('fs');
const path = require('path');

const products = require('../src/shared/data/products').default;

function check() {
  const publicDir = path.join(__dirname, '..', 'public');
  const missing = [];

  for (const p of products) {
    if (!p.image) continue;
    // normalize leading slash
    const rel = p.image.startsWith('/') ? p.image.slice(1) : p.image;
    const full = path.join(publicDir, rel.replace(/^assests\//, 'assests/'));
    if (!fs.existsSync(full)) missing.push({ id: p.id, title: p.title, path: rel });
  }

  if (missing.length === 0) {
    console.log('All product images found in public/assests/products/');
    return 0;
  }

  console.log('Missing product images:');
  missing.forEach((m) => console.log(`- [${m.id}] ${m.title} -> ${m.path}`));
  console.log(`\nPlace the corresponding high-quality images into the public/assests/products/ folder using the listed filenames.`);
  return 1;
}

process.exitCode = check();
