import { PHYSICS } from './config.js';

export function createShip(scene) {
  const group = new THREE.Group();

  // Hull
  const hullMat = new THREE.MeshStandardMaterial({ color: 0xd0c8c0, roughness: 0.25, metalness: 0.75 });
  const hull    = new THREE.Mesh(new THREE.ConeGeometry(0.5, 2.4, 8), hullMat);
  hull.rotation.x = Math.PI / 2;
  hull.castShadow = true;
  group.add(hull);

  // Wings
  const wingMat = new THREE.MeshStandardMaterial({ color: 0x8899aa, roughness: 0.35, metalness: 0.65 });
  const wings   = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.08, 0.9), wingMat);
  wings.position.z = 0.3;
  group.add(wings);

  // Dorsal fin
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.55, 0.65), wingMat);
  fin.position.set(0, 0.28, 0.45);
  group.add(fin);

  // Engine nacelle
  const engMat = new THREE.MeshBasicMaterial({ color: 0xff5500 });
  const eng    = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.3, 0.45, 8), engMat);
  eng.rotation.x = Math.PI / 2;
  eng.position.z = 1.2;
  group.add(eng);

  // Engine glow light
  const engLight = new THREE.PointLight(0xff4400, 0, 10);
  engLight.position.z = 1.6;
  group.add(engLight);

  scene.add(group);

  return {
    group,
    engLight,
    pos: new THREE.Vector3(0, 0, 0),
    vel: new THREE.Vector3(0, 0, 0),
    rot: new THREE.Euler(0, 0, 0, 'YXZ'),
  };
}

export function updateShip(ship, keys) {
  const { THRUST, DRAG, BRAKE, TURN, PITCH, MAX_SPD } = PHYSICS;

  const thrusting = keys['w'] || keys['arrowup'];
  const braking   = keys['s'] || keys['arrowdown'];

  if (keys['a'] || keys['arrowleft'])  ship.rot.y += TURN;
  if (keys['d'] || keys['arrowright']) ship.rot.y -= TURN;
  if (keys['q']) ship.rot.x -= PITCH;
  if (keys['e']) ship.rot.x += PITCH;
  ship.rot.x = Math.max(-Math.PI * 0.45, Math.min(Math.PI * 0.45, ship.rot.x));

  const quat = new THREE.Quaternion().setFromEuler(ship.rot);
  const fwd  = new THREE.Vector3(0, 0, -1).applyQuaternion(quat);

  if (thrusting && ship.vel.length() < MAX_SPD) {
    ship.vel.addScaledVector(fwd, THRUST);
  }
  if (braking) ship.vel.multiplyScalar(BRAKE);

  ship.vel.multiplyScalar(DRAG);
  ship.pos.addScaledVector(ship.vel, 1);

  ship.group.position.copy(ship.pos);
  ship.group.quaternion.copy(quat);

  ship.engLight.intensity = thrusting ? 1.8 + Math.random() * 0.9 : 0;

  return { thrusting, speed: ship.vel.length(), quat };
}
