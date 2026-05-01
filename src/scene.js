export function initScene() {
  const canvas = document.getElementById('c');

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0608, 0.0045);

  const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 2000);
  camera.position.set(0, 2, 8);

  const clock = new THREE.Clock();

  // DRG lighting: strong warm key, cold blue rim, very dark ambient
  scene.add(new THREE.AmbientLight(0x0a0810, 1.0));

  const sun = new THREE.DirectionalLight(0xffe8b0, 3.6);
  sun.position.set(80, 60, 40);
  sun.castShadow = true;
  sun.shadow.mapSize.setScalar(1024);
  scene.add(sun);

  const rim = new THREE.DirectionalLight(0x0a1830, 2.2);
  rim.position.set(-60, -30, -80);
  scene.add(rim);

  const fill = new THREE.DirectionalLight(0x200810, 0.5);
  fill.position.set(0, 80, 0);
  scene.add(fill);

  // Belt lava glow — warm uplight from deep below
  const beltGlow = new THREE.PointLight(0xff3300, 0.7, 700);
  beltGlow.position.set(0, -130, 0);
  scene.add(beltGlow);

  window.addEventListener('resize', () => {
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  });

  return { renderer, scene, camera, clock };
}
