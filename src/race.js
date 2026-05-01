import { RACE_WP_INDICES, LEADERBOARD_SEED } from './config.js';
import { fmtTime, showNotification, setMode, showRaceTimer, setBestTime, renderLeaderboard } from './hud.js';

export function createRaceState(asteroids) {
  return {
    wps:       RACE_WP_INDICES.map(i => asteroids[i]),
    active:    false,
    idx:       0,
    startTime: 0,
    bestTime:  null,
    lb:        LEADERBOARD_SEED.map(e => ({ ...e })),
  };
}

export function openRacePanel(hud, race) {
  const el = document.getElementById('rwps');
  el.innerHTML = race.wps.map((a, i) =>
    `<span class="wp" id="wp${i}">${a.name.toUpperCase()}</span>`
  ).join('<span style="color:rgba(232,118,42,0.4);font-size:11px;align-self:center">›</span>');
  hud.rpanel.style.display = 'block';
}

export function startRace(hud, race) {
  hud.rpanel.style.display = 'none';
  race.active    = true;
  race.idx       = 0;
  race.startTime = performance.now();
  setMode(hud, 'race');
  showRaceTimer(hud, true);
  _syncWaypointUI(race);
  showNotification(hud, 'RACE STARTED — HEAD TO ' + race.wps[0].name.toUpperCase());
}

export function checkWaypoint(hud, race, asteroid) {
  if (!race.active || asteroid !== race.wps[race.idx]) return;
  race.idx++;
  if (race.idx >= race.wps.length) {
    _finishRace(hud, race);
  } else {
    _syncWaypointUI(race);
    showNotification(hud, 'CHECKPOINT — ' + race.wps[race.idx].name.toUpperCase());
  }
}

export function tickRace(hud, race) {
  if (!race.active) return;
  hud.rtDisp.textContent = fmtTime((performance.now() - race.startTime) / 1000);
}

function _finishRace(hud, race) {
  const elapsed = (performance.now() - race.startTime) / 1000;
  race.active   = false;
  setMode(hud, 'play');
  showRaceTimer(hud, false);

  if (race.bestTime == null || elapsed < race.bestTime) {
    race.bestTime = elapsed;
    setBestTime(hud, elapsed);
    race.lb[3].t  = elapsed;
    race.lb.sort((a, b) => (a.t ?? 999) - (b.t ?? 999));
    renderLeaderboard(hud, race.lb);
  }

  showNotification(hud, 'RACE COMPLETE — ' + fmtTime(elapsed));
}

function _syncWaypointUI(race) {
  race.wps.forEach((_, i) => {
    const el = document.getElementById('wp' + i);
    if (el) el.className = 'wp' + (i === race.idx ? ' cur' : '');
  });
  const nextEl = document.getElementById('rt-next');
  if (nextEl && race.idx < race.wps.length) {
    nextEl.textContent = '→ ' + race.wps[race.idx].name.toUpperCase();
  }
}
