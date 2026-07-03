'use strict';

const fs = require('fs');
const path = require('path');

const HOME = path.join(__dirname, '..', 'HomePage.html');
const INDEX = path.join(__dirname, '..', 'index.html');

function fixPanel(panelHtml) {
  if (!panelHtml.includes('journey-visual-hero')) return panelHtml;

  const heroStart = panelHtml.indexOf('<div class="journey-visual-hero">');
  const bodyStart = panelHtml.indexOf('<div class="journey-panel-body');
  if (heroStart === -1 || bodyStart === -1) return panelHtml;

  const heroChunk = panelHtml.slice(heroStart, bodyStart);

  const captionMatch = heroChunk.match(/<div class="journey-visual-caption">[\s\S]*?<\/div>/);
  const imgMatch = heroChunk.match(/<img[\s\S]*?>/);
  const flowMatch = heroChunk.match(/<div class="journey-flow-mini"[\s\S]*?<\/div>/);
  const stepsMatch = heroChunk.match(/<div class="journey-module-steps"[\s\S]*?<\/div>/);

  const caption = captionMatch ? captionMatch[0].trim() : '';
  const img = imgMatch ? imgMatch[0].trim() : '';
  const tail = flowMatch ? flowMatch[0].trim() : (stepsMatch ? stepsMatch[0].trim() : '');

  if (!caption && !img) return panelHtml;

  const heroNew =
    `            <div class="journey-visual-hero">\n` +
    `              <div class="journey-visual-frame">\n` +
    `                ${caption}\n` +
    (img ? `                ${img}\n` : '') +
    `              </div>\n` +
    (tail ? `              ${tail}\n` : '') +
    `            </div>\n`;

  return panelHtml.slice(0, heroStart) + heroNew + panelHtml.slice(bodyStart);
}

function run() {
  let html = fs.readFileSync(HOME, 'utf8');
  html = html.replace(/<article class="journey-panel[^"]*"[\s\S]*?<\/article>/g, fixPanel);
  fs.writeFileSync(HOME, html);
  fs.copyFileSync(HOME, INDEX);
  console.log('Fixed journey visual frames.');
}

run();
