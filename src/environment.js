// DRG-style deep space environment: stars, nebula, debris belt, dust, hot vents, bg rocks

export function buildEnvironment(scene) {
  buildStars(scene);
  buildNebula(scene);
  buildBackgroundRocks(scene);
  buildDebrisField(scene);
  buildHotVents(scene);
  const dust = buildDustBelt(scene);

  return {
    update(_dt) {
      // Slowly drift the dust belt — cheap rotation instead of per-vertex
      if (dust) dust.rotation.y += 0.00006;
    },
  };
}

// ── Stars ────────────────────────────────────────────────
function buildStars(scene) {
  const pos = [], col = [];
  for (let i = 0; i < 4500; i++) {
    const r     = 550 + Math.random() * 450;
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    pos.push(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta)
    );
    // Warm white / cool blue / orange giant
    const t = Math.random();
    if      (t < 0.70) col.push(1.0, 0.95, 0.88);
    else if (t < 0.86) col.push(0.75, 0.85, 1.0);
    else               col.push(1.0, 0.65, 0.35);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('color',    new THREE.Float32BufferAttribute(col, 3));
  scene.add(new THREE.Points(geo, new THREE.PointsMaterial({
    size: 1.5, sizeAttenuation: true, vertexColors: true,
  })));
}

// ── Nebula planes ────────────────────────────────────────
function buildNebula(scene) {
  [
    { color: 0x4422aa, x:  100, y:   0, z: -200, rx: 0.30, ry: 0.10, s: 1.1,  o: 0.055 },
    { color: 0x882244, x: -150, y:  50, z: -180, rx: 0.10, ry: 0.40, s: 0.9,  o: 0.045 },
    { color: 0x224466, x:    0, y: -80, z: -250, rx: 0.50, ry: 0.20, s: 1.3,  o: 0.050 },
    { color: 0x441122, x:  200, y:  30, z: -150, rx: 0.20, ry: 0.60, s: 0.8,  o: 0.040 },
    { color: 0x331144, x:  -80, y: -40, z: -300, rx: 0.40, ry: 0.10, s: 1.4,  o: 0.035 },
    { color: 0x662211, x: -200, y:  60, z: -100, rx: 0.15, ry: 0.30, s: 0.75, o: 0.038 },
    { color: 0x223344, x:   50, y: 100, z: -220, rx: 0.60, ry: 0.15, s: 1.2,  o: 0.030 },
  ].forEach(({ color, x, y, z, rx, ry, s, o }) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(500, 500),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: o, depthWrite: false, side: THREE.DoubleSide })
    );
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, 0);
    m.scale.setScalar(s);
    scene.add(m);
  });
}

// ── Large background rocks (scene depth) ────────────────
function buildBackgroundRocks(scene) {
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + Math.random() * 0.6;
    const dist  = 420 + Math.random() * 180;
    const geo   = new THREE.IcosahedronGeometry(10, 1);
    const pos   = geo.attributes.position;
    for (let j = 0; j < pos.count; j++) {
      const x = pos.getX(j), y = pos.getY(j), z = pos.getZ(j);
      const d = 1 + 0.38 * Math.sin(x * 0.2) * Math.cos(y * 0.18) * Math.sin(z * 0.15);
      pos.setXYZ(j, x * d, y * d, z * d);
    }
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.08 + Math.random() * 0.08, 0.06 + Math.random() * 0.06, 0.05 + Math.random() * 0.06),
      roughness: 0.96, metalness: 0.04, flatShading: true,
    }));
    mesh.position.set(
      Math.cos(angle) * dist, (Math.random() - 0.5) * 130, Math.sin(angle) * dist
    );
    mesh.scale.setScalar(8 + Math.random() * 16);
    mesh.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
    scene.add(mesh);
  }
}

// ── Debris field (InstancedMesh, 900 small rocks) ────────
function buildDebrisField(scene) {
  const count = 900;
  const geo   = new THREE.IcosahedronGeometry(1, 0);

  // Slightly vary debris colors via vertex attributes
  const vcount = geo.attributes.position.count;
  const vcol   = [];
  for (let i = 0; i < vcount; i++) {
    const v = 0.12 + Math.random() * 0.12;
    vcol.push(v * 1.1, v * 0.85, v * 0.7);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(vcol, 3));

  const mat  = new THREE.MeshStandardMaterial({
    vertexColors: true, roughness: 0.94, metalness: 0.06, flatShading: true,
  });
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  mesh.castShadow = false;
  mesh.receiveShadow = false;

  const dummy = new THREE.Object3D();
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist  = 25 + Math.random() * 370;
    dummy.position.set(
      Math.cos(angle) * dist,
      (Math.random() - 0.5) * 75,
      Math.sin(angle) * dist
    );
    dummy.rotation.set(
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2
    );
    dummy.scale.setScalar(0.08 + Math.random() * 2.8);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
  scene.add(mesh);
  return mesh;
}

// ── Dust belt (floating particles in belt plane) ─────────
function buildDustBelt(scene) {
  const count = 3500;
  const pos   = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist  = 15 + Math.random() * 400;
    pos.push(Math.cos(angle) * dist, (Math.random() - 0.5) * 85, Math.sin(angle) * dist);
  }
  const geo  = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const dust = new THREE.Points(geo, new THREE.PointsMaterial({
    color: 0x997755, size: 0.55, sizeAttenuation: true,
    transparent: true, opacity: 0.13, depthWrite: false,
  }));
  scene.add(dust);
  return dust;
}

// ── Hot vent glow particles (DRG lava vents) ─────────────
function buildHotVents(scene) {
  const count = 280;
  const pos = [], col = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist  = 35 + Math.random() * 320;
    pos.push(Math.cos(angle) * dist, (Math.random() - 0.5) * 35, Math.sin(angle) * dist);
    const t = Math.random();
    col.push(1.0, 0.25 + t * 0.45, 0.03);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('color',    new THREE.Float32BufferAttribute(col, 3));
  scene.add(new THREE.Points(geo, new THREE.PointsMaterial({
    size: 2.2, sizeAttenuation: true, vertexColors: true,
    transparent: true, opacity: 0.38, depthWrite: false,
    blending: THREE.AdditiveBlending,
  })));
}
