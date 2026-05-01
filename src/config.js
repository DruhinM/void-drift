export const ASTEROID_DEFS = [
  { name: 'Ceres Prime',    sponsor: 'RED BULL OUTPOST',  color: 0x8877aa, scale: 2.8, rough: true,  crystalColor: 0xff6600 },
  { name: 'Vesta Rock',     sponsor: 'NVIDIA DEEP NODE',  color: 0x997766, scale: 2.0, rough: true,  crystalColor: 0x00aaff },
  { name: 'Pallas Station', sponsor: 'GITHUB CLUSTER',    color: 0x778899, scale: 2.4, rough: false, crystalColor: null     },
  { name: 'Hygiea Base',    sponsor: 'AWS EDGE ZONE',     color: 0x887755, scale: 1.6, rough: true,  crystalColor: 0xff4400 },
  { name: 'Juno Drift',     sponsor: 'STRIPE HUB',        color: 0x99aacc, scale: 2.2, rough: false, crystalColor: null     },
  { name: 'Davida Point',   sponsor: 'COINGECKO RELAY',   color: 0x776655, scale: 1.4, rough: true,  crystalColor: 0x00ffaa },
  { name: 'Interamnia',     sponsor: 'VERCEL EDGE NODE',  color: 0xaabbcc, scale: 2.6, rough: false, crystalColor: null     },
  { name: 'Europa Shard',   sponsor: null,                 color: 0x887799, scale: 1.8, rough: true,  crystalColor: 0x4466ff },
  { name: 'Sylvia Cluster', sponsor: null,                 color: 0x998877, scale: 1.3, rough: false, crystalColor: null     },
  { name: 'Eunomia Belt',   sponsor: 'FIGMA STUDIO',      color: 0x7788aa, scale: 1.9, rough: true,  crystalColor: 0xff3300 },
  { name: 'Psyche Forge',   sponsor: null,                 color: 0xccbbdd, scale: 2.0, rough: false, crystalColor: 0x8800ff },
  { name: 'Camilla Far',    sponsor: 'DISCORD RELAY',     color: 0x99aabb, scale: 1.5, rough: true,  crystalColor: 0x5500ff },
];

export const PHYSICS = {
  THRUST:  0.14,
  DRAG:    0.9988,
  BRAKE:   0.91,
  TURN:    0.038,
  PITCH:   0.023,
  MAX_SPD: 9,
};

export const RACE_WP_INDICES = [0, 4, 6, 2, 10, 3];

export const LEADERBOARD_SEED = [
  { name: 'COSMO_K',   t: 68.4 },
  { name: 'DRIFTER99', t: 71.2 },
  { name: 'NOVA_X',    t: 74.8 },
  { name: 'YOU',       t: null  },
  { name: 'STELLAR_X', t: 89.1 },
];
