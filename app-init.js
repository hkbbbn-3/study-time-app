// ---------- init ----------
(async function init(){
  await loadData();
  ensureSeaLayers();
  render();
  setInterval(tickTimerDisplay, 1000);
})();
