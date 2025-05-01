const fs = require('fs');

function loadJSON(file) {
  try {
    const content = fs.readFileSync(file, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`❌ Error reading or parsing ${file}: ${err.message}`);
    process.exit(1);
  }
}

const tlds = loadJSON('tlds.json');
const meta = loadJSON('tlds_meta.json');

const isValidTLD = (tld) => /^[a-z0-9-]{3,63}$/.test(tld);

let errors = [];

// Validate keys in tlds.json
Object.keys(tlds).forEach(tld => {
  if (!isValidTLD(tld)) {
    errors.push(`❌ Invalid TLD format in tlds.json: '${tld}'`);
  }
});

// Validate meta entries
Object.keys(meta).forEach(tld => {
  if (!tlds[tld]) {
    errors.push(`❌ ${tld} exists in tlds_meta.json but not in tlds.json`);
  }

  const { desc, owner, created } = meta[tld];

  if (!desc || typeof desc !== 'string' || desc.length > 100) {
    errors.push(`❌ ${tld} has missing or long 'desc'`);
  }

  if (created && !/^\d{4}-\d{2}-\d{2}$/.test(created)) {
    errors.push(`❌ ${tld} has invalid 'created' date (expected YYYY-MM-DD)`);
  }

  if (owner && !/^github\.com\/.+/.test(owner) && !/^https?:\/\/github\.com\/.+/.test(owner)) {
    errors.push(`⚠️ ${tld} has an unusual 'owner' format: ${owner}`);
  }
});

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exit(1);
} else {
  console.log('✅ Both JSON files are valid and follow format rules.');
}
