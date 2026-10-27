import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {test} from 'node:test';
import vm from 'node:vm';

const root=fileURLToPath(new URL('../',import.meta.url));
const read=file=>readFileSync(resolve(root,file),'utf8');
const walk=dir=>readdirSync(resolve(root,dir),{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(`${dir}/${e.name}`):[`${dir}/${e.name}`]);
const enPages=walk('en').filter(p=>p.endsWith('.html'));
const urlFor=file=>'https://chcesiku.pl/'+file.replace(/index\.html$/,'');
const targetFile=url=>new URL(url).pathname.slice(1).replace(/\/$/,'/index.html')||'index.html';

test('English content is crawlable and bilingual equivalents point back to each other',()=>{
 assert.equal(enPages.length,16);
 for(const file of enPages){
  const html=read(file);
  assert.match(html,/<html lang="en">/);
  assert.doesNotMatch(html,/http-equiv="refresh"|noindex|navigator\.language/);
  assert.match(html,/<h1[^>]*>[^<\n]/);
  const alternates=[...html.matchAll(/<link rel="alternate" hreflang="(pl|en)" href="([^"]+)">/g)];
  if(file.includes('public-toilets-in-poland')){assert.equal(alternates.length,0);continue;}
  assert.equal(alternates.length,2,file);
  assert.ok(alternates.some(m=>m[1]==='en'&&m[2]===urlFor(file)),file);
  for(const [,lang,url] of alternates){
   const other=read(targetFile(url));
   assert.ok(other.includes(`hreflang="en" href="${urlFor(file)}"`),`${file}: no return link in ${url}`);
   assert.match(other,new RegExp(`<html lang="${lang}">`));
  }
  const pl=alternates.find(m=>m[1]==='pl')[2];
  assert.ok(html.includes(`class="language-switch" href="${new URL(pl).pathname}"`),file);
 }
});

test('all nine English guides have indexable article metadata, sources and usable translations',()=>{
 const guides=enPages.filter(p=>/^en\/guides\/[^/]+\/index.html$/.test(p));
 assert.equal(guides.length,9);
 for(const file of guides){
  const html=read(file);
  assert.match(html,/"@type": "BlogPosting"/);
  assert.match(html,/"inLanguage": "en"/);
  assert.match(html,/"datePublished": "2026-10-27/);
  assert.ok(!html.match(/<main[^>]*>([\s\S]*?)<\/main>/)[1].includes('/poradnik/'),`${file}: unlocalized content link`);
  assert.ok(html.includes('data-share-url="'+urlFor(file)+'"'));
  assert.match(html,/<h2 id="section-1">/);
 }
 const sitemap=read('sitemap.xml');
 assert.equal([...sitemap.matchAll(/<loc>/g)].length,31);
 for(const file of enPages)assert.ok(sitemap.includes(`<loc>${urlFor(file)}</loc>`));
 assert.equal([...read('en/feed.xml').matchAll(/<item>/g)].length,9);
});

function analyticsHarness({lang='en',host='chcesiku.pl',choice}={}){
 const listeners={};const buttons={};const stores=new Map(choice?[['chcesiku_analytics_consent',choice]]:[]);const appended=[];let banner;
 const link={href:'https://apps.apple.com/app/id6797092985',addEventListener:(event,fn)=>{listeners.store=fn;}};
 const document={documentElement:{lang},querySelector:()=>null,querySelectorAll:selector=>selector==='a.store-badge'?[link]:[],head:{appendChild:node=>appended.push(node)},body:{appendChild:node=>{banner=node;}},addEventListener:(event,fn)=>{listeners[event]=fn;},createElement:tag=>({dataset:{},setAttribute(){},querySelector:selector=>buttons[selector]??=( {addEventListener:(event,fn)=>{listeners[selector]=fn;},focus(){}})})};
 const window={location:{hostname:host,pathname:'/en/download/'}};
 vm.runInNewContext(read('analytics.js'),{document,window,localStorage:{getItem:key=>stores.get(key),setItem:(k,v)=>stores.set(k,v)},URL});
 listeners.DOMContentLoaded();
 return {listeners,window,appended,get banner(){return banner;},stores};
}
test('English analytics consent stays off until allowed and records store clicks only with consent',()=>{
 const h=analyticsHarness();
 assert.match(h.banner.innerHTML,/Allow analytics/);
 assert.match(h.banner.innerHTML,/\/en\/privacy\/#analityka/);
 assert.equal(h.appended.length,0);
 h.listeners.store();assert.equal(h.window.gtag,undefined);
 h.listeners['.consent-accept']();assert.equal(h.appended.length,1);
 assert.equal(h.stores.get('chcesiku_analytics_consent'),'granted');
 h.listeners.store();
 assert.ok(h.window.dataLayer.some(args=>args[0]==='event'&&args[1]==='app_store_click'&&args[2].site_language==='en'));
 h.listeners['.consent-reject']();const count=h.window.dataLayer.length;
 h.listeners.store();assert.equal(h.window.dataLayer.length,count);
});
test('Polish choice persists across languages and previews never send Analytics data',()=>{
 const pl=analyticsHarness({lang:'pl',choice:'denied'});assert.match(pl.banner.innerHTML,/Akceptuję analitykę/);assert.equal(pl.appended.length,0);assert.equal(pl.banner.hidden,true);
 const en=analyticsHarness({choice:'granted'});assert.equal(en.appended.length,1);assert.equal(en.banner.hidden,true);
 const preview=analyticsHarness({host:'127.0.0.1',choice:'granted'});preview.listeners.store();assert.equal(preview.appended.length,0);assert.equal(preview.window.gtag,undefined);
});
