// Reads the app's own scripts the way index.html loads them, so tests can slice the source by function name
// without caring how it is split across files. The standalone modules (backup.js, range-total.js, stats.js)
// are not part of it: tests require() those directly.
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '../..');
const STANDALONE = new Set(['backup.js', 'range-total.js', 'stats.js']);

// Every <script> tag with a src, in page order: { src, attrs }. HTML comments are ignored, attributes may come in any
// order, and either quote style is accepted. `src` has any ?query removed.
function scriptTags(html){
  return [...html.replace(/<!--[\s\S]*?-->/g, '').matchAll(/<script\b([^>]*)>/gi)]
    .map(m => ({ attrs: m[1], src: /\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(m[1]) }))
    .filter(t => t.src)
    .map(t => ({ attrs: t.attrs, src: (t.src[1] ?? t.src[2]).split('?')[0] }));
}

function indexHtml(){ return fs.readFileSync(path.join(root, 'index.html'), 'utf8'); }

// Local app script files of index.html, in the order the page runs them.
function appScripts(){
  return scriptTags(indexHtml()).map(t => t.src).filter(src => !/^https?:/.test(src) && !STANDALONE.has(src));
}

function appSource(){
  return appScripts().map(f => fs.readFileSync(path.join(root, f), 'utf8').replace(/\r\n/g, '\n')).join('\n');
}

module.exports = { appScripts, appSource, scriptTags };
