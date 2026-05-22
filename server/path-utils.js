'use strict';

/** Treat homepage aliases as the same page for shared comments. */
function normalizePagePath(pagePath) {
  const value = String(pagePath || '/').trim();
  const withSlash = value.startsWith('/') ? value : '/' + value;
  if (withSlash === '/index.html' || withSlash === '/HomePage.html') return '/';
  return withSlash;
}

module.exports = { normalizePagePath };
