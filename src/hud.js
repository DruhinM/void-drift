export function initHUD() {
  return {
    speedNum:  document.getElementById('speed-num'),
    discCt:    document.getElementById('disc-ct'),
    bestT:     document.getElementById('best-t'),
    modePill:  document.getElementById('mode-pill'),
    tfill:     document.getElementById('tfill'),
    rtDisp:    document.getElementById('rt-disp'),
    rtNext:    document.getElementById('rt-next'),
    rtimer:    document.getElementById('rtimer'),
    notif:     document.getElementById('notif'),
    astHud:    document.getElementById('ast-hud'),
    astName:   document.getElementById('ast-name'),
    astSponsor:document.getElementById('ast-sponsor'),
    astDist:   document.getElementById('ast-dist'),
    ctrl:      document.getElementById('ctrl'),
    lbList:    document.getElementById('lb-list'),
    rpanel:    document.getElementById('rpanel'),
    menu:      document.getElementById('menu'),
  };
}

export function updateSpeedHUD(hud, speed) {
  hud.speedNum.textContent = speed.toFixed(1);
}

export function updateThrustBar(hud, thrusting) {
  hud.tfill.style.height = (thrusting ? 100 : 0) + '%';
}

export function updateAsteroidLabel(hud, nearAst, nearDist) {
  if (nearAst && nearDist < nearAst.scale * 11 + 100) {
    hud.astName.textContent    = nearAst.name.toUpperCase();
    hud.astSponsor.textContent = nearAst.sponsor || '';
    hud.astDist.textContent    = Math.round(nearDist - nearAst.scale * 10) + 'm';
    hud.astHud.classList.add('on');
  } else {
    hud.astHud.classList.remove('on');
  }
}

export function updateDiscoveryCount(hud, count, total) {
  hud.discCt.textContent = count + ' / ' + total;
}

export function setMode(hud, mode) {
  hud.modePill.textContent = mode === 'race' ? 'RACE MODE' : 'FREE DRIFT';
}

export function showRaceTimer(hud, show) {
  hud.rtimer.style.display = show ? 'block' : 'none';
}

export function setBestTime(hud, t) {
  hud.bestT.textContent = t != null ? fmtTime(t) : '--:--.-';
}

export function hideControls(hud) {
  hud.ctrl.classList.add('gone');
}

export function renderLeaderboard(hud, lb) {
  hud.lbList.innerHTML = lb.map((e, i) => `
    <div class="lr${e.name === 'YOU' ? ' lryou' : ''}">
      <span class="lrank${i === 0 ? ' g' : ''}">${i + 1}</span>
      <span class="lname">${e.name}</span>
      <span class="ltime">${e.t != null ? fmtTime(e.t) : '--:--.-'}</span>
    </div>`).join('');
}

let _notifTO = null;
export function showNotification(hud, msg) {
  hud.notif.textContent = msg;
  hud.notif.classList.add('on');
  clearTimeout(_notifTO);
  _notifTO = setTimeout(() => hud.notif.classList.remove('on'), 3200);
}

export function fmtTime(s) {
  const m   = Math.floor(s / 60);
  const sec = (s % 60).toFixed(1).padStart(4, '0');
  return `${m}:${sec}`;
}
