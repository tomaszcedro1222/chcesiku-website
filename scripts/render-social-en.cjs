/* English vector cards. Keeps Polish and referral assets untouched. */
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
const target = path.join(root, 'assets/social');
const version = '20261027';
const logo = fs.readFileSync(path.join(root, 'assets/chce-siku-logo.jpg')).toString('base64');
const designs = [
  ['home', ['Find a toilet.', 'Keep exploring.'], 'WORLDWIDE TOILET MAP'],
  ['download', ['A toilet nearby.', 'Wherever you go.'], 'DOWNLOAD • iPhone & Android'],
  ['guide', ['Go prepared.', 'Explore with ease.'], 'PRACTICAL TOILET GUIDES'],
  ['article-1', ['Find. Add.', 'Rate a toilet.'], 'HOW CHCĘ SIKU! WORKS'],
  ['article-2', ['Baby changing', 'on the go.'], 'A GUIDE FOR PARENTS'],
  ['article-3', ['IBS and toilets', 'away from home.'], 'EVERYDAY PLANNING'],
  ['article-4', ['Find a toilet', 'in a new city.'], 'TRAVEL WITH A PLAN'],
  ['article-5', ['Worried about', 'finding a toilet?'], 'TOILET ANXIETY'],
  ['article-6', ['Toilets and', 'older adults.'], 'COMFORT AND ACCESS'],
  ['article-7', ['Accessible', 'toilets.'], 'CHECK BEFORE YOU GO'],
  ['article-8', ['Almost 500,000', 'toilets worldwide.'], 'THE CHCĘ SIKU! MAP'],
  ['article-9', ['Public toilets', 'in Poland.'], 'A VISITOR’S GUIDE'],
];
const escapeXml = value => value.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[char]));

function artwork(key, lines, label, square) {
  const height = square ? 1200 : 630;
  const bg = key === 'download' ? '#f5f34b' : '#fafbf7';
  const block = key === 'download' ? '#e9e742' : '#edf3e9';
  const brandY = square ? 225 : 50;
  const pinY = square ? 365 : 159;
  const textY = square ? 625 : 355;
  const gap = square ? 80 : 62;
  const fontSize = square ? 66 : 50;
  const labelY = square ? 808 : 483;
  // All meaningful wide-card content stays inside the central 630px square.
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="${height}" viewBox="0 0 1200 ${height}">
  <title>${escapeXml(lines.join(' '))} | Chcę Siku!</title>
  <rect width="1200" height="${height}" fill="${bg}"/>
  <g fill="${block}"><rect x="-65" y="${height*.06}" width="280" height="220" rx="30"/><rect x="-65" y="${height*.06+254}" width="280" height="510" rx="30"/><rect x="985" y="-40" width="300" height="${height*.55}" rx="30"/><rect x="985" y="${height*.55}" width="300" height="${height*.55}" rx="30"/></g>
  <g fill="none" stroke="#27634e" stroke-opacity=".28" stroke-width="5" stroke-linecap="round" stroke-dasharray="2 15"><path d="M-20 ${height*.3}h260v${height*.4}H80"/><path d="M1220 ${height*.7}H960V${height*.17}h170"/></g>
  <defs><clipPath id="brand-corner"><rect x="473" y="${brandY}" width="60" height="67" rx="14"/></clipPath></defs>
  <image xlink:href="data:image/jpeg;base64,${logo}" x="473" y="${brandY}" width="60" height="67" clip-path="url(#brand-corner)"/>
  <text x="551" y="${brandY+45}" fill="#142b2b" font-family="Arial, sans-serif" font-weight="700" font-size="36" letter-spacing="-1">Chcę Siku!</text>
  <g transform="translate(556 ${pinY})"><path d="M88 44c0 33-44 72-44 72S0 77 0 44a44 44 0 1 1 88 0Z" fill="#142b2b"/><text x="44" y="54" fill="#f5f34b" text-anchor="middle" font-family="Arial, sans-serif" font-size="29" font-weight="700">WC</text></g>
  <text text-anchor="middle" fill="#142b2b" font-family="Arial, sans-serif" font-weight="700" font-size="${fontSize}" letter-spacing="-1.5">${lines.map((line, i) => `<tspan x="600" y="${textY+i*gap}">${escapeXml(line)}</tspan>`).join('')}</text>
  <text x="600" y="${labelY}" text-anchor="middle" fill="#27634e" font-family="Arial, sans-serif" font-size="${square ? 20 : 15}" font-weight="700" letter-spacing="1.7">${escapeXml(label)}</text>
  <text x="600" y="${square ? 1010 : 555}" text-anchor="middle" fill="#536363" font-family="Arial, sans-serif" font-size="${square ? 24 : 20}">chcesiku.pl/en/</text>
  </svg>`;
}

(async () => {
  fs.mkdirSync(target, { recursive: true });
  for (const [key, lines, label] of designs) {
    for (const square of [false, true]) {
      const svg = artwork(key, lines, label, square).replace(/[ \t]+$/gm, '') + '\n';
      const name = `en-${key}-${version}-${square ? 'square' : 'wide'}`;
      fs.writeFileSync(path.join(target, `${name}.svg`), svg);
      await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(path.join(target, `${name}.png`));
    }
  }
  console.log(`Rendered ${designs.length * 2} English social cards. Polish and referral assets unchanged.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
