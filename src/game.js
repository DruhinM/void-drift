import { initScene }                                                    from './scene.js';
import { buildEnvironment }                                              from './environment.js';
import { buildAsteroids, updateAsteroids }                               from './asteroids.js';
import { createShip, updateShip }                                        from './ship.js';
import { initHUD, updateSpeedHUD, updateThrustBar, updateAsteroidLabel,
         updateDiscoveryCount, renderLeaderboard, showNotification,
         hideControls }                                                   from './hud.js';
import { createRaceState, openRacePanel, startRace,
         checkWaypoint, tickRace }                                        from './race.js';
import { drawMinimap }                                                    from './minimap.js';
import { keys, initInput }                                               from './input.js';

// ── Bootstrap ────────────────────────────────────────────
const { renderer, scene, camera, clock } = initScene();
const env                = buildEnvironment(scene);
const { asteroids, billboards } = buildAsteroids(scene);
const ship               = createShip(scene);
const hud                = initHUD();
const race               = createRaceState(asteroids);

let gState    = 'menu';
let discCount = 0;

renderLeaderboard(hud, race.lb);

// Camera state
const camTarget = new THREE.Vector3();
const camOffset = new THREE.Vector3(0, 1.8, 9);

// Input
initInput({
  onRaceKey:         () => { if (gState === 'play') openRacePanel(hud, race); },
  onAnyMovementKey:  () => hideControls(hud),
});

// Menu / panel buttons
document.getElementById('play-btn').addEventListener('click', () => {
  hud.menu.style.display = 'none';
  gState = 'play';
});
document.getElementById('race-btn').addEventListener('click', () => {
  hud.menu.style.display = 'none';
  gState = 'play';
  setTimeout(() => openRacePanel(hud, race), 200);
});
document.getElementById('rstart').addEventListener('click', () => {
  startRace(hud, race);
  gState = 'race';
});
document.getElementById('rcancel').addEventListener('click', () => {
  hud.rpanel.style.display = 'none';
});

// ── Main loop ─────────────────────────────────────────────
const _astPos = new THREE.Vector3();

function loop() {
  requestAnimationFrame(loop);
  const dt = Math.min(clock.getDelta(), 0.05);
  const t  = clock.elapsedTime;

  // Always render so the menu background stays live
  if (gState === 'menu') {
    renderer.render(scene, camera);
    return;
  }

  // Ship physics
  const { thrusting, speed, quat } = updateShip(ship, keys);

  // Camera — smooth lag follow
  const desiredCam = ship.pos.clone().add(camOffset.clone().applyQuaternion(quat));
  camera.position.lerp(desiredCam, 0.06);
  camTarget.lerp(ship.pos, 0.08);
  camera.lookAt(camTarget);

  // Billboards always face camera
  billboards.forEach(bb => bb.lookAt(camera.position));

  // Asteroid spin + crystal pulse
  updateAsteroids(asteroids, t);

  // Proximity — discovery + race waypoints
  let nearAst = null, nearDist = Infinity;

  asteroids.forEach(a => {
    _astPos.set(a.ax, a.ay, a.az);
    const dist = ship.pos.distanceTo(_astPos);
    const hitR = a.scale * 11 + 4;

    if (dist < hitR) {
      if (!a.visited) {
        a.visited = true;
        discCount++;
        updateDiscoveryCount(hud, discCount, asteroids.length);
        showNotification(hud, 'DISCOVERED: ' + a.name.toUpperCase() + (a.sponsor ? ' — ' + a.sponsor : ''));
      }
      checkWaypoint(hud, race, a);
    }

    if (dist < hitR + 120 && dist < nearDist) { nearDist = dist; nearAst = a; }
  });

  // Re-sync gState if race finished inside checkWaypoint
  if (gState === 'race' && !race.active) gState = 'play';

  // HUD
  updateSpeedHUD(hud, speed);
  updateThrustBar(hud, thrusting);
  updateAsteroidLabel(hud, nearAst, nearDist);
  tickRace(hud, race);

  // Minimap
  drawMinimap(asteroids, ship.pos, race);

  // Environment animation
  env.update(dt);

  renderer.render(scene, camera);
}

loop();
