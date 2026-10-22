/* Original vector artwork, rasterized for social platforms. No generated photos. */
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
const target = path.join(root, 'assets/social');
fs.mkdirSync(target, {recursive:true});
const version='20261022';
const logo=fs.readFileSync(path.join(root,'assets/chce-siku-logo.jpg')).toString('base64');
const designs=[
 ['home',['Toaleta blisko.','Więcej swobody.'],'MAPA TOALET NA ŚWIECIE'],
 ['download',['Toaleta blisko.','Gdziekolwiek jesteś.'],'POBIERZ • iPHONE I ANDROID'],
 ['guide',['Dobrze wiedzieć,','zanim wyjdziesz.'],'PORADNIK CHCĘ SIKU!'],
 ['article-1',['Znajdź toaletę.','Dodaj. Oceń.'],'JAK DZIAŁA CHCĘ SIKU!'],
 ['article-2',['Toaleta','z przewijakiem.'],'PORADNIK DLA RODZICÓW'],
 ['article-3',['IBS i toaleta','poza domem.'],'ZDROWIE I CODZIENNOŚĆ'],
 ['article-4',['Toaleta','w nowym mieście.'],'PORADNIK W PODRÓŻY'],
 ['article-5',['Lęk przed','brakiem toalety.'],'KOMFORT POZA DOMEM'],
 ['article-6',['Toalety','dla seniorów.'],'DOSTĘPNOŚĆ I CODZIENNOŚĆ'],
 ['article-7',['Toaleta','bez barier.'],'PORADNIK DOSTĘPNOŚCI'],
 ['article-8',['Prawie pół miliona','miejsc.'],'MAPA TOALET NA ŚWIECIE']
];
function artwork(key,lines,label,square){
 const h=square?1200:630;const brandY=square?302:73;const pinY=square?421:170;const textY=square?674:390;const font=square?72:54;const gap=square?84:63;const labelY=square?855:553;
 const yellow=key==='download';const bg=yellow?'#f5f34b':'#fafbf7';const block=yellow?'#e9e742':'#edf3e9';
 return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="${h}" viewBox="0 0 1200 ${h}">
 <rect width="1200" height="${h}" fill="${bg}"/>
 <g fill="${block}"><rect x="-65" y="${h*.06}" width="280" height="220" rx="30"/><rect x="-65" y="${h*.06+254}" width="280" height="510" rx="30"/><rect x="985" y="-40" width="300" height="${h*.55}" rx="30"/><rect x="985" y="${h*.55}" width="300" height="${h*.55}" rx="30"/></g>
 <g fill="none" stroke="#27634e" stroke-opacity=".28" stroke-width="5" stroke-linecap="round" stroke-dasharray="2 15"><path d="M-20 ${h*.3}h260v${h*.4}H80"/><path d="M1220 ${h*.7}H960V${h*.17}h170"/></g>
 <g transform="translate(468 ${brandY})"><image xlink:href="data:image/jpeg;base64,${logo}" width="45" height="50"/><text x="60" y="34" fill="#142b2b" font-family="Arial, sans-serif" font-weight="700" font-size="34" letter-spacing="-1">Chcę Siku!</text></g>
 <g transform="translate(552 ${pinY})"><path d="M96 48c0 36-48 78-48 78S0 84 0 48a48 48 0 1 1 96 0Z" fill="#142b2b"/><text x="48" y="58" fill="#f5f34b" text-anchor="middle" font-family="Arial, sans-serif" font-size="31" font-weight="700">WC</text></g>
 <text text-anchor="middle" fill="#142b2b" font-family="Arial, sans-serif" font-weight="700" font-size="${font}" letter-spacing="-2">${lines.map((line,i)=>`<tspan x="600" y="${textY+i*gap}">${line}</tspan>`).join('')}</text>
 <text x="600" y="${labelY}" text-anchor="middle" fill="#27634e" font-family="Arial, sans-serif" font-size="${square?22:16}" font-weight="700" letter-spacing="2">${label}</text>
 ${square?'<text x="600" y="1050" text-anchor="middle" fill="#536363" font-family="Arial,sans-serif" font-size="24">chcesiku.pl</text>':''}
 </svg>`;
}
(async()=>{
 for(const [key,lines,label] of designs){
  for(const square of [false,true]){
   const svg=artwork(key,lines,label,square).replace(/[ \t]+$/gm,'');const name=`${key}-${version}-${square?'square':'wide'}`;
   fs.writeFileSync(path.join(target,name+'.svg'),svg+'\n');
   await sharp(Buffer.from(svg)).png({compressionLevel:9}).toFile(path.join(target,name+'.png'));
  }
 }
 console.log(`Rendered ${designs.length*2} social cards (square and landscape).`);
})();
