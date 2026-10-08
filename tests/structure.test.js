// Guards the file layout: index.html, sw.js's ASSETS and the app's script files must stay in step.
// Run with: node --test tests/
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { appScripts, appSource, scriptTags } = require('./helpers/source.js');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');

const isLocal = src => !/^https?:/.test(src);
const noQuery = src => src.split('?')[0];
const htmlScripts = scriptTags(html).map(t => t.src).filter(isLocal);
const htmlStyles = [...html.matchAll(/<link\s+[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)].map(m => noQuery(m[1])).filter(isLocal);
const assetsBlock = sw.slice(sw.indexOf('const ASSETS'), sw.indexOf('];', sw.indexOf('const ASSETS')));
const assets = [...assetsBlock.matchAll(/'\.\/([^']*)'/g)].map(m => m[1]);

const APP_FILES = ['app-core.js', 'app-shell.js', 'view-home.js', 'view-calendar.js', 'view-record.js',
  'view-settings.js', 'events.js', 'sea-backdrop.js', 'app-init.js'];

test('every local <script src> in index.html exists', () => {
  htmlScripts.forEach(f => assert.ok(fs.existsSync(path.join(root, f)), `${f} is in index.html but missing on disk`));
});

test('every local script and stylesheet in index.html is precached in sw.js ASSETS', () => {
  [...htmlScripts, ...htmlStyles].forEach(f => assert.ok(assets.includes(f), `${f} is in index.html but not in sw.js ASSETS`));
});

test('every .js / .css file in sw.js ASSETS exists', () => {
  assets.filter(f => /\.(js|css)$/.test(f)).forEach(f => assert.ok(fs.existsSync(path.join(root, f)), `${f} is in ASSETS but missing on disk`));
});

test('the app scripts load in the agreed order', () => {
  assert.deepEqual(appScripts(), APP_FILES);
});

test('no top-level function, let, const, var or class name is defined twice across the app scripts', () => {
  const seen = new Map(), dupes = [];
  const note = name => { if(seen.has(name)) dupes.push(name); seen.set(name, true); };
  appSource().split('\n').forEach(line => {
    let m = /^(?:async\s+)?function\s+([A-Za-z0-9_$]+)/.exec(line);
    if(m){ note(m[1]); return; }
    m = /^(?:let|const|var)\s+\{([^}]*)\}/.exec(line);
    if(m){ m[1].split(',').map(s => s.split(':').pop().trim()).filter(Boolean).forEach(note); return; }
    m = /^(?:let|const|var|class)\s+([A-Za-z0-9_$]+)/.exec(line);
    if(m) note(m[1]);
  });
  assert.deepEqual(dupes, [], `defined more than once: ${dupes.join(', ')}`);
});

test('scripts are loaded plainly, in page order: no defer, async or type=module on any local script', () => {
  scriptTags(html).filter(t => isLocal(t.src)).forEach(t => {
    assert.ok(!/\b(defer|async)\b/i.test(t.attrs) && !/type\s*=\s*["']?module/i.test(t.attrs),
      `${t.src} must be a plain <script> (attrs: ${t.attrs.trim()})`);
  });
});

test('each app script parses on its own (a split must not cut through a function or string)', () => {
  appScripts().forEach(f => {
    const code = fs.readFileSync(path.join(root, f), 'utf8');
    assert.doesNotThrow(() => new vm.Script(code, { filename: f }), `${f} does not parse by itself`);
  });
});

test('no top-level name collides with a window built-in (let/const would throw, functions would replace it)', () => {
  const BUILTINS = ['name', 'status', 'top', 'parent', 'self', 'window', 'document', 'location', 'history', 'length', 'event',
    'open', 'close', 'closed', 'stop', 'focus', 'blur', 'print', 'find', 'scroll', 'alert', 'confirm', 'prompt', 'fetch', 'caches',
    'crypto', 'screen', 'navigator', 'origin', 'frames', 'opener', 'external', 'performance', 'localStorage', 'sessionStorage',
    'indexedDB', 'toolbar', 'menubar', 'scrollX', 'scrollY', 'innerWidth', 'innerHeight', 'outerWidth', 'outerHeight',
    'screenX', 'screenY', 'Backup', 'RangeTotal', 'Stats'];
  const names = [];
  appSource().split('\n').forEach(line => {
    const m = /^(?:async\s+)?function\s+([A-Za-z0-9_$]+)|^(?:let|const|var|class)\s+([A-Za-z0-9_$]+)/.exec(line);
    if(m) names.push(m[1] || m[2]);
  });
  assert.deepEqual(names.filter(n => BUILTINS.includes(n)), []);
});
