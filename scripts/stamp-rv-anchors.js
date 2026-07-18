'use strict';

/**
 * Stamps stable data-rv-anchor ids onto commentable elements in HTML pages.
 * Priority target for element-based comment anchoring.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const FILES = [
  'index.html',
  'HomePage.html',
  'modules/intercompany-control.html',
  'modules/group-reporting.html',
  'modules/group-planning.html'
];

// Keep stamps focused on structural content nodes (avoids noisy link/button churn).
const TARGET_RE = /<(section|h1|h2|h3|h4|article)\b([^>]*?)(\/?)>/gi;

function stableId(tag, attrs, file, index) {
  const idMatch = attrs.match(/\bid\s*=\s*["']([^"']+)["']/i);
  const seed = idMatch
    ? file + '|' + idMatch[1]
    : file + '|' + tag + '|' + index + '|' + attrs.slice(0, 80);
  return 'rv_' + crypto.createHash('sha1').update(seed).digest('hex').slice(0, 10);
}

function stampFile(relPath) {
  const full = path.join(ROOT, relPath);
  if (!fs.existsSync(full)) {
    console.warn('[stamp] skip missing', relPath);
    return 0;
  }
  let html = fs.readFileSync(full, 'utf8');
  let count = 0;
  let index = 0;
  html = html.replace(TARGET_RE, (fullMatch, tag, attrs, selfClose) => {
    index += 1;
    if (/\bdata-rv-anchor\s*=/i.test(attrs)) return fullMatch;
    // Skip review chrome / script-injected nodes if any slipped into HTML
    if (/\bid\s*=\s*["']rv-/i.test(attrs)) return fullMatch;
    const anchor = stableId(tag.toLowerCase(), attrs, relPath, index);
    count += 1;
    const close = selfClose ? '/>' : '>';
    return '<' + tag + attrs + ' data-rv-anchor="' + anchor + '"' + close;
  });
  fs.writeFileSync(full, html, 'utf8');
  console.log('[stamp]', relPath, '→', count, 'anchors');
  return count;
}

let total = 0;
FILES.forEach(file => {
  total += stampFile(file);
});
console.log('[stamp] total', total);
