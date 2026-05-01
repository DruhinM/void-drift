import { ASTEROID_DEFS } from './config.js';

export function buildAsteroids(scene) {
  const billboards = [];

  const asteroids = ASTEROID_DEFS.map((def, i) => {
    const angle = (i / ASTEROID_DEFS.length) * Math.PI * 2 + (Math.random() - 0.5) * 0.9;
    const dist  = 120 + Math.random() * 220;
    const ax    = Math.cos(angle) * dist;
    const ay    = (Math.random() - 0.5) * 80;
    const az    = Math.sin(angle) * dist;

    const mesh = _buildMesh(def);
    mesh.position.set(ax, ay, az);
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    scene.add(mesh);

    if (def.sponsor) {
      const bb = _buildBillboard(def.sponsor);
      bb.position.set(ax, ay + def.scale * 11 + 5, az);
      scene.add(bb);
      billboards.push(bb);
    }

    return {
      ...def,
      mesh, ax, ay, az,
      visited: false,
      rotSpd: new THREE.Vector3(
        (Math.random() - 0.5) * 0.003,
        (Math.random() - 0.5) * 0.004,
        (Math.random() - 0.5) * 0.003
      ),
      glowPhase: Math.random() * Math.PI * 2,
    };
  });

  return { asteroids, billboards };
}

export function updateAsteroids(asteroids, t) {
  asteroids.forEach(a => {
    a.mesh.rotation.x += a.rotSpd.x;
    a.mesh.rotation.y += a.rotSpd.y;
    a.mesh.rotation.z += a.rotSpd.z;

    // Pulse crystal emissive intensity
    if (a.crystalColor) {
      a.mesh.traverse(child => {
        if (child !== a.mesh && child.isMesh && child.material.emissiveIntensity !== undefined) {
          child.material.emissiveIntensity = 0.55 + 0.35 * Math.sin(t * 1.8 + a.glowPhase);
        }
      });
    }
  });
}

// ── Asteroid mesh ────────────────────────────────────────
function _buildMesh(def) {
  const detail = def.rough ? 3 : 2;
  const geo    = new THREE.IcosahedronGeometry(10, detail);
  const pos    = geo.attributes.position;

  // Multi-octave vertex displacement — DRG chunky lumps
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const len = Math.sqrt(x * x + y * y + z * z);
    const n1 = Math.sin(x * 0.18 + 0.7)  * Math.cos(y * 0.22 + 1.1) * Math.sin(z * 0.19 + 0.3);
    const n2 = Math.sin(x * 0.35 + 2.1)  * Math.cos(z * 0.28 + 0.8);
    const n3 = Math.cos(y * 0.41 + 1.5)  * Math.sin(x * 0.29 + z * 0.21);
    const n4 = Math.sin(x * 0.72 + y * 0.58) * Math.cos(z * 0.65 + 1.2); // high-freq chip detail
    const d  = 1 + 0.42 * n1 + 0.22 * n2 + 0.12 * n3 + 0.06 * n4;
    const s  = (len * d) / len;
    pos.setXYZ(i, x * s, y * s, z * s);
  }
  geo.computeVertexNormals();

  // Vertex colors: dark base + orange mineral veins + crystal pocket hint
  const r  = (def.color >> 16 & 0xff) / 255;
  const g  = (def.color >>  8 & 0xff) / 255;
  const b  = (def.color       & 0xff) / 255;
  const cr = def.crystalColor ? (def.crystalColor >> 16 & 0xff) / 255 : 0;
  const cg = def.crystalColor ? (def.crystalColor >>  8 & 0xff) / 255 : 0;
  const cb = def.crystalColor ? (def.crystalColor       & 0xff) / 255 : 0;

  const colors = [];
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);

    // Ambient occlusion-like dark base
    const ao = 0.14 + 0.38 * Math.abs(Math.sin(x * 0.14 + z * 0.11));

    // Orange mineral vein — sharp threshold gives DRG ore-vein look
    const vRaw  = Math.sin(x * 0.55 + z * 0.38) * Math.cos(y * 0.48 + x * 0.31);
    const vein  = Math.pow(Math.max(0, Math.abs(vRaw) - 0.67) * 3.2, 2.6);

    // Crystal pocket — contrasting hue, even sharper
    const pRaw   = Math.sin(x * 1.1 + y * 0.75) * Math.cos(z * 1.0 - y * 0.55);
    const pocket = def.crystalColor
      ? Math.pow(Math.max(0, Math.abs(pRaw) - 0.79) * 4.8, 3.0)
      : 0;

    colors.push(
      Math.min(1, r * ao + vein * 0.88 + pocket * cr * 0.9),
      Math.min(1, g * ao + vein * 0.28 + pocket * cg * 0.9),
      Math.min(1, b * ao + vein * 0.04 + pocket * cb * 0.9)
    );
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const mat  = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness:    0.88,
    metalness:    def.rough ? 0.06 : 0.18,
    flatShading:  true,    // key: faceted DRG look
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow    = true;
  mesh.receiveShadow = true;
  mesh.scale.setScalar(def.scale);

  if (def.crystalColor)  _addCrystals(mesh, def);
  if (def.sponsor) {
    const pl = new THREE.PointLight(0xff8833, 3.0, 75);
    pl.position.set(0, 14, 0);
    mesh.add(pl);
  }

  return mesh;
}

// ── Crystal formations (DRG mineral deposits) ────────────
function _addCrystals(asteroidMesh, def) {
  const clusterCount = 2 + Math.floor(Math.random() * 2);

  for (let c = 0; c < clusterCount; c++) {
    // Pick a random surface point
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    const nx    = Math.sin(phi) * Math.cos(theta);
    const ny    = Math.cos(phi);
    const nz    = Math.sin(phi) * Math.sin(theta);

    const crystalCount = 3 + Math.floor(Math.random() * 3);

    for (let k = 0; k < crystalCount; k++) {
      const h    = 0.55 + Math.random() * 1.35;
      const rad  = 0.05 + Math.random() * 0.11;
      const cGeo = new THREE.CylinderGeometry(rad * 0.25, rad, h, 6, 1, false);
      const cMat = new THREE.MeshStandardMaterial({
        color:             def.crystalColor,
        emissive:          def.crystalColor,
        emissiveIntensity: 0.7,
        roughness:         0.12,
        metalness:         0.35,
        transparent:       true,
        opacity:           0.84,
      });
      const crystal = new THREE.Mesh(cGeo, cMat);

      // Scatter slightly around cluster origin
      const scatter = 0.55;
      const sn = new THREE.Vector3(
        nx + (Math.random() - 0.5) * scatter,
        ny + (Math.random() - 0.5) * scatter,
        nz + (Math.random() - 0.5) * scatter
      ).normalize();

      const surfR = 10 * (0.72 + Math.random() * 0.28); // base radius = 10
      crystal.position.set(
        sn.x * surfR + sn.x * h * 0.5,
        sn.y * surfR + sn.y * h * 0.5,
        sn.z * surfR + sn.z * h * 0.5
      );

      // Orient cylinder Y → surface normal
      const up = new THREE.Vector3(0, 1, 0);
      // Guard against anti-parallel (sn ≈ (0,-1,0))
      if (Math.abs(sn.dot(up) + 1) < 0.001) {
        crystal.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI);
      } else {
        crystal.quaternion.setFromUnitVectors(up, sn);
      }
      crystal.rotateY(Math.random() * Math.PI * 2);

      asteroidMesh.add(crystal);
    }

    // Point light at cluster
    const cl = new THREE.PointLight(def.crystalColor, 1.4, 10 * 3.5);
    cl.position.set(nx * 8, ny * 8, nz * 8);
    asteroidMesh.add(cl);
  }
}

// ── Sponsor billboard ────────────────────────────────────
function _buildBillboard(text) {
  const cw = 512, ch = 128;
  const bc = document.createElement('canvas');
  bc.width = cw; bc.height = ch;
  const bx = bc.getContext('2d');

  bx.clearRect(0, 0, cw, ch);
  bx.fillStyle = 'rgba(10,6,8,0.86)';
  _roundRect(bx, 4, 4, cw - 8, ch - 8, 12); bx.fill();
  bx.strokeStyle = 'rgba(232,118,42,0.65)';
  bx.lineWidth = 2;
  _roundRect(bx, 4, 4, cw - 8, ch - 8, 12); bx.stroke();

  bx.font = 'bold 38px Barlow Condensed,sans-serif';
  bx.fillStyle = '#e8762a';
  bx.textAlign = 'center';
  bx.textBaseline = 'middle';
  bx.fillText(text, cw / 2, ch / 2 - 8);

  bx.font = '500 20px Barlow Condensed,sans-serif';
  bx.fillStyle = 'rgba(232,221,208,0.45)';
  bx.fillText('SPONSORED ASTEROID', cw / 2, ch / 2 + 24);

  const tex = new THREE.CanvasTexture(bc);
  return new THREE.Mesh(
    new THREE.PlaneGeometry(18, 4.5),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide })
  );
}

function _roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);   ctx.quadraticCurveTo(x + w, y,     x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);   ctx.quadraticCurveTo(x, y + h,   x, y + h - r);
  ctx.lineTo(x, y + r);       ctx.quadraticCurveTo(x, y,       x + r, y);
  ctx.closePath();
}
