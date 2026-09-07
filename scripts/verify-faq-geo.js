'use strict';

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..');
const HOMEPAGE_SOURCE = 'HomePage.html';
const HOMEPAGE_PUBLISHED = 'index.html';
const FAQ_PAGES = [
  HOMEPAGE_SOURCE,
  HOMEPAGE_PUBLISHED,
  'knowledge-centre/intercompany-control-faqs.html'
];

let failed = false;

function fail(msg) {
  console.error('FAIL: ' + msg);
  failed = true;
}

function pass(msg) {
  console.log('OK: ' + msg);
}

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function extractDomFaqs(html) {
  const faqs = [];
  const re = /<details class="faq-item"[^>]*>[\s\S]*?<h3 class="faq-q-text">([\s\S]*?)<\/h3>[\s\S]*?<div class="faq-a">\s*<p>([\s\S]*?)<\/p>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    faqs.push({
      q: m[1].replace(/\s+/g, ' ').trim(),
      a: m[2].replace(/\s+/g, ' ').trim()
    });
  }
  return faqs;
}

function extractFaqSection(html) {
  const m = html.match(/<section class="faq-section"[\s\S]*?<\/section>/);
  return m ? m[0] : '';
}

function extractSchema(html) {
  const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  for (const match of scripts) {
    const data = JSON.parse(match[1]);
    if (data['@type'] === 'FAQPage') return data;
  }
  return null;
}

function schemaFaqs(schema) {
  return schema.mainEntity.map((item) => ({
    q: item.name.replace(/\s+/g, ' ').trim(),
    a: item.acceptedAnswer.text.replace(/\s+/g, ' ').trim()
  }));
}

function checkPage(file) {
  const html = read(file);
  const dom = extractDomFaqs(html);
  const schema = extractSchema(html);

  if (!dom.length) {
    fail(file + ' has no <details class="faq-item"> blocks');
    return;
  }

  if (!schema) {
    fail(file + ' is missing FAQPage JSON-LD');
    return;
  }

  if (!schema['@id'] || !schema.url || !schema.name) {
    fail(file + ' FAQPage schema missing @id, url, or name');
  }

  if (dom.length !== schema.mainEntity.length) {
    fail(file + ' DOM has ' + dom.length + ' FAQs but schema has ' + schema.mainEntity.length);
  }

  const schemaItems = schemaFaqs(schema);
  dom.forEach((item, i) => {
    if (!schemaItems[i] || item.q !== schemaItems[i].q || item.a !== schemaItems[i].a) {
      fail(file + ' schema/DOM mismatch at FAQ #' + (i + 1));
    }
  });

  if (/<button class="faq-q"/.test(html)) {
    fail(file + ' still uses <button class="faq-q">');
  }
  if (/class="faq-item open"/.test(html)) {
    fail(file + ' still uses legacy faq-item open class');
  }
  if (/<details class="faq-item"[^>]*\shidden[\s>]/i.test(html)) {
    fail(file + ' has hidden attribute on FAQ details in static HTML');
  }

  const document = new JSDOM(html).window.document;
  document.querySelectorAll('.faq-item').forEach((item, i) => {
    const summary = item.querySelector('summary.faq-q');
    const heading = item.querySelector('h3.faq-q-text');
    const answer = item.querySelector('.faq-a p');
    if (!summary || !heading || !answer) {
      fail(file + ' FAQ #' + (i + 1) + ' missing summary, h3 question, or answer paragraph');
    }
    if (!answer || !answer.textContent.trim()) {
      fail(file + ' FAQ #' + (i + 1) + ' has empty answer');
    }
  });

  const faqSection = document.querySelector('.faq-section, #intercompany-faqs');
  if (faqSection && !faqSection.getAttribute('aria-labelledby')) {
    fail(file + ' FAQ region missing aria-labelledby');
  }

  if (!failed) {
    pass(file + ' — ' + dom.length + ' FAQs, schema matches DOM, semantic structure valid');
  }
}

const sourceSection = extractFaqSection(read(HOMEPAGE_SOURCE));
const publishedSection = extractFaqSection(read(HOMEPAGE_PUBLISHED));
if (sourceSection !== publishedSection) {
  fail('HomePage.html and index.html FAQ sections differ — run: npm run sync');
} else {
  pass('HomePage.html and index.html FAQ sections are in sync');
}

FAQ_PAGES.forEach(checkPage);

if (failed) process.exit(1);
console.log('\nAll FAQ GEO checks passed.');
