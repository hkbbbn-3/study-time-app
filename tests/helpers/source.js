// Reads the app's own scripts the way index.html loads them, so tests can slice the source by function name
// without caring how it is split across files. The standalone modules (backup.js, range-total.js, stats.js)
// are not part of it: tests require() those directly.
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '../..');
const STANDALONE = new Set(['backup.js', 'range-total.js', 'stats.js']);

// Local <script src="..."> files of index.html, in the order the page runs them.
function appScripts(){
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  return [...html.matchAll(/<script\s+src="([^"]+)"/g)]
    .map(m => m[1].split('?')[0])
    .filter(src => !/^https?:/.test(src) && !STANDALONE.has(src));
}

function appSource(){
  return appScripts().map(f => fs.readFileSync(path.join(root, f), 'utf8').replace(/\r\n/g, '\n')).join('\n');
}

module.exports = { appScripts, appSource };
