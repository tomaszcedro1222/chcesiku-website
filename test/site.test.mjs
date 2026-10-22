import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { referralAppUri } from '../polecenie/link.mjs';
import { fileURLToPath } from 'node:url';

// Run from any working directory: node --test /path/to/website/test/site.test.mjs
// Article routes are discovered from disk, so drafts can be added incrementally.
const ROOT = fileURLToPath(new URL('../', import.meta.url));
const ORIGIN = 'https://chcesiku.pl';
const BASELINE = 'a8d0628';
const PROTECTED = ['polecenie/link.mjs', '.well-known', 'analytics.js', '404.html', 'CNAME', '.github/workflows'];
const SKIP_DIRECTORIES = new Set(['.git', 'node_modules', 'test']);

function filesUnder(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (entry.isDirectory() && SKIP_DIRECTORIES.has(entry.name)) return [];
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(fullPath) : entry.isFile() ? [fullPath] : [];
  });
}

function relative(file) {
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function read(file) {
  return readFileSync(path.join(ROOT, file), 'utf8');
}

function decodeEntities(value) {
  return value.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt);/gi, (entity, code) => {
    if (code[0] === '#') {
      const number = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return number <= 0x10ffff ? String.fromCodePoint(number) : entity;
    }
    return { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' }[code.toLowerCase()];
  });
}

function attributes(tag) {
  const result = {};
  for (const match of tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) {
    result[match[1].toLowerCase()] = decodeEntities(match[2] ?? match[3] ?? match[4]);
  }
  return result;
}

function withoutComments(html) {
  return html.replace(/<!--[\s\S]*?-->/g, '');
}

function pageUrl(file) {
  return `${ORIGIN}/${file === 'index.html' ? '' : file.replace(/index\.html$/, '')}`;
}

function localTarget(reference, sourceFile) {
  const value = reference.trim();
  if (!value || value.startsWith('#')) return null;
  const url = new URL(value, pageUrl(sourceFile));
  if (!['http:', 'https:'].includes(url.protocol) || !['chcesiku.pl', 'www.chcesiku.pl'].includes(url.hostname)) return null;
  const target = path.resolve(ROOT, `.${decodeURIComponent(url.pathname)}`);
  assert.ok(target === path.resolve(ROOT) || target.startsWith(`${path.resolve(ROOT)}${path.sep}`), `${sourceFile}: path leaves website root: ${reference}`);
  return existsSync(target) && statSync(target).isDirectory() ? path.join(target, 'index.html') : target;
}

function metadata(html) {
  return [...html.matchAll(/<meta\b[^>]*>/gi)].map(match => attributes(match[0]));
}

function values(metas, name) {
  return metas.filter(meta => (meta.property || meta.name || '').toLowerCase() === name).map(meta => meta.content ?? '');
}

function jsonLd(html, file) {
  const documents = [];
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
    if (attributes(match[1]).type?.toLowerCase() !== 'application/ld+json') continue;
    try {
      documents.push(JSON.parse(match[2]));
    } catch (error) {
      assert.fail(`${file}: invalid JSON-LD: ${error.message}`);
    }
  }
  return documents;
}

function schemaNodes(value) {
  if (Array.isArray(value)) return value.flatMap(schemaNodes);
  if (!value || typeof value !== 'object') return [];
  return [value, ...Object.values(value).flatMap(schemaNodes)];
}

const htmlFiles = filesUnder(ROOT).filter(file => file.endsWith('.html')).map(relative);
const articles = htmlFiles.filter(file => /^poradnik\/[^/]+\/index\.html$/.test(file));
const refreshedPages = ['index.html', 'pobierz/index.html', 'poradnik/index.html', ...articles];

test('exactly eight reviewed articles and editorial page are present', () => {
  assert.equal(articles.length, 8);
  assert.ok(existsSync(path.join(ROOT, 'o-poradniku/index.html')));
});

test('referral parser preserves valid codes and rejects malformed links without activation', () => {
  const code='a'.repeat(32);
  assert.equal(referralAppUri(`${ORIGIN}/polecenie/?ref=${code}`),`pl.chcesiku.chcesiku://polecenie/${code}`);
  for(const query of ['', '?ref=invalid', `?ref=${code}&ref=${code}`, `?ref=${code}&other=1`, `?ref=${code}#token`]) {
    assert.equal(referralAppUri(`${ORIGIN}/polecenie/${query}`),null);
  }
  const brand=/<a class="brand"[^>]*>\s*<img src="([^"]+)"/;
  assert.equal(read('polecenie/index.html').match(brand)?.[1], '/'+read('index.html').match(brand)?.[1]);
});

test('referral preview uses the brand logo without changing the referral page flow', () => {
  const html = read('polecenie/index.html');
  const original = execFileSync('git', ['show', `${BASELINE}:polecenie/index.html`], { cwd: ROOT, encoding: 'utf8' });
  assert.equal(html.slice(html.indexOf('<body>')), original.slice(original.indexOf('<body>')));
  const metas = metadata(html);
  const image = values(metas, 'og:image')[0];
  assert.equal(image, `${ORIGIN}/assets/social/referral-20261022-square.png`);
  assert.equal(values(metas, 'og:image:width')[0], '1200');
  assert.equal(values(metas, 'og:image:height')[0], '1200');
  assert.ok(values(metas, 'og:image:alt')[0]);
  assert.equal(values(metas, 'robots')[0], 'noindex, nofollow');
  const square = readFileSync(localTarget(image, 'polecenie/index.html'));
  assert.equal(square.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(square.readUInt32BE(16), 1200);
  assert.equal(square.readUInt32BE(20), 1200);
  const wide = readFileSync(localTarget(values(metas, 'twitter:image')[0], 'polecenie/index.html'));
  assert.equal(wide.readUInt32BE(16), 1200);
  assert.equal(wide.readUInt32BE(20), 630);
});

test('help and legal text are unchanged and shared shell has a single skip link', () => {
  for (const file of ['privacy.html','support.html','delete-account.html']) {
    const previous=execFileSync('git',['show',`${BASELINE}:${file}`],{cwd:ROOT,encoding:'utf8'});
    const main=html=>html.match(/<main[^>]*>([\s\S]*?)<\/main>/)?.[1];
    assert.equal(main(read(file)),main(previous), `${file}: legal/help text changed`);
    assert.equal((read(file).match(/class="skip-link"/g)||[]).length,1);
  }
});

test('every internal href/src in HTML resolves to a published file', () => {
  const broken = [];
  for (const file of htmlFiles) {
    const html = withoutComments(read(file));
    for (const match of html.matchAll(/<[a-z][^>]*>/gi)) {
      const attrs = attributes(match[0]);
      for (const key of ['href', 'src']) {
        if (!(key in attrs)) continue;
        const target = localTarget(attrs[key], file);
        if (target && (!existsSync(target) || !statSync(target).isFile())) broken.push(`${file}: ${key}="${attrs[key]}"`);
      }
    }
  }
  assert.deepEqual(broken, [], `Broken internal references:\n${broken.join('\n')}`);
});

test('refreshed pages use the new shared stylesheet', () => {
  assert.ok(existsSync(path.join(ROOT, 'site.css')), 'site.css is missing');
  for (const file of refreshedPages) {
    assert.ok(existsSync(path.join(ROOT, file)), `${file} is missing`);
    const stylesheets = [...read(file).matchAll(/<link\b[^>]*>/gi)].map(match => attributes(match[0]))
      .filter(link => link.rel?.split(/\s+/).includes('stylesheet'));
    assert.ok(stylesheets.some(link => localTarget(link.href ?? '', file) === path.join(ROOT, 'site.css')), `${file}: missing site.css stylesheet`);
  }
});

for (const file of refreshedPages) {
  test(`${file}: one H1, canonical, description and complete Open Graph image metadata`, () => {
    const html = withoutComments(read(file));
    assert.equal([...html.matchAll(/<h1\b/gi)].length, 1, `${file}: expected exactly one H1`);
    const canonicals = [...html.matchAll(/<link\b[^>]*>/gi)].map(match => attributes(match[0]))
      .filter(link => link.rel?.toLowerCase().split(/\s+/).includes('canonical'));
    assert.equal(canonicals.length, 1, `${file}: expected exactly one canonical`);
    assert.equal(canonicals[0].href, pageUrl(file), `${file}: incorrect canonical URL`);
    const metas = metadata(html);
    const descriptions = values(metas, 'description');
    assert.equal(descriptions.length, 1, `${file}: expected exactly one description`);
    assert.ok(descriptions[0].trim(), `${file}: empty description`);
    for (const name of ['og:title', 'og:description', 'og:type']) {
      assert.ok(values(metas, name)[0]?.trim(), `${file}: missing ${name}`);
    }
    assert.equal(values(metas, 'og:url')[0], pageUrl(file), `${file}: incorrect og:url`);

    const images = [];
    for (const meta of metas) {
      if (meta.property === 'og:image') images.push({ url: meta.content });
      else if (images.length && meta.property?.startsWith('og:image:')) images.at(-1)[meta.property.slice(9)] = meta.content;
    }
    assert.ok(images.length, `${file}: missing og:image`);
    for (const image of images) {
      assert.match(image.url ?? '', /^https:\/\/chcesiku\.pl\/assets\/social\/[^?#]+\.png(?:\?[^#]*)?$/, `${file}: use an absolute PNG URL in assets/social`);
      const imagePath = localTarget(image.url, file);
      assert.ok(imagePath && existsSync(imagePath), `${file}: missing social image ${image.url}`);
      const bytes = readFileSync(imagePath);
      assert.ok(bytes.length >= 24 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), `${file}: invalid PNG ${image.url}`);
      assert.equal(bytes.toString('ascii', 12, 16), 'IHDR', `${file}: missing PNG dimensions`);
      assert.equal(Number(image.width), bytes.readUInt32BE(16), `${file}: incorrect og:image:width for ${image.url}`);
      assert.equal(Number(image.height), bytes.readUInt32BE(20), `${file}: incorrect og:image:height for ${image.url}`);
      assert.ok(image.alt?.trim(), `${file}: missing og:image:alt for ${image.url}`);
    }
  });
}

test('all JSON-LD parses; articles expose Article and BreadcrumbList', () => {
  for (const file of htmlFiles) {
    const documents = jsonLd(read(file), file);
    if (!articles.includes(file)) continue;
    const nodes = documents.flatMap(schemaNodes);
    const hasType = type => nodes.some(node => [node['@type']].flat().includes(type));
    assert.ok(hasType('Article') || hasType('BlogPosting'), `${file}: missing Article or BlogPosting JSON-LD`);
    assert.ok(hasType('BreadcrumbList'), `${file}: missing BreadcrumbList JSON-LD`);
  }
});

test('sitemap includes home, download, guide hub and every article, but no referral URLs', () => {
  const sitemap = read('sitemap.xml');
  const urls = [...sitemap.matchAll(/<loc\b[^>]*>([\s\S]*?)<\/loc\s*>/gi)].map(match => decodeEntities(match[1].trim()));
  assert.equal(new Set(urls).size, urls.length, 'Duplicate sitemap URLs');
  for (const file of refreshedPages) assert.ok(urls.includes(pageUrl(file)), `Missing from sitemap: ${pageUrl(file)}`);
  for (const url of urls) {
    const parsed = new URL(url);
    assert.equal(parsed.origin, ORIGIN, `Unexpected sitemap origin: ${url}`);
    assert.ok(!/^\/polecenie(?:\/|$)/.test(parsed.pathname), `Referral URL must not be indexed: ${url}`);
    const target = localTarget(url, 'index.html');
    assert.ok(target && existsSync(target) && statSync(target).isFile(), `Sitemap URL does not exist: ${url}`);
  }
});

test('referral link code, domain associations, analytics, 404, domain and deployment workflow are unchanged', () => {
  const baselineFiles = execFileSync('git', ['ls-tree', '-r', '--name-only', BASELINE, '--', ...PROTECTED], { cwd: ROOT, encoding: 'utf8' }).trim().split('\n');
  assert.ok(baselineFiles.length >= 7, 'Expected protected files are absent from baseline commit');
  const currentFiles = PROTECTED.flatMap(file => {
    const fullPath = path.join(ROOT, file);
    return existsSync(fullPath) && statSync(fullPath).isDirectory() ? filesUnder(fullPath).map(relative) : existsSync(fullPath) ? [file] : [];
  });
  assert.deepEqual(currentFiles.sort(), baselineFiles.sort(), 'Protected files were added or removed');
  for (const file of baselineFiles) {
    const original = execFileSync('git', ['show', `${BASELINE}:${file}`], { cwd: ROOT });
    assert.ok(readFileSync(path.join(ROOT, file)).equals(original), `Protected file changed: ${file}`);
  }
});
