'use strict';

/** Treat homepage / module aliases as the same page for shared comments. */
function normalizePagePath(pagePath) {
  const value = String(pagePath || '/').trim();
  let withSlash = value.startsWith('/') ? value : '/' + value;

  // Drop query strings / hashes if a full path sneaks in.
  withSlash = withSlash.split('?')[0].split('#')[0];

  if (withSlash === '/index.html' || withSlash === '/HomePage.html') return '/';

  // /modules/foo.html → /modules/foo
  const moduleMatch = withSlash.match(/^\/modules\/([^/]+?)(?:\.html)?\/?$/);
  if (moduleMatch) return '/modules/' + moduleMatch[1];

  return withSlash;
}

module.exports = { normalizePagePath };
