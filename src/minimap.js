const canvas = document.getElementById('mmc');
const ctx    = canvas.getContext('2d');

export function drawMinimap(asteroids, shipPos, race) {
  ctx.clearRect(0, 0, 120, 120);

  // Background circle
  ctx.fillStyle = 'rgba(10,6,8,0.82)';
  ctx.beginPath(); ctx.arc(60, 60, 59, 0, Math.PI * 2); ctx.fill();

  const scale = 0.22;

  asteroids.forEach(a => {
    const mx = 60 + (a.ax - shipPos.x) * scale;
    const my = 60 + (a.az - shipPos.z) * scale;
    if (mx < 3 || mx > 117 || my < 3 || my > 117) return;

    const r = Math.max(2, a.scale * scale * 2.5);
    const isNext = race.active && a === race.wps[race.idx];

    ctx.beginPath(); ctx.arc(mx, my, r, 0, Math.PI * 2);
    ctx.fillStyle = a.visited ? '#e8762a' : 'rgba(232,221,208,0.22)';
    ctx.fill();

    if (isNext) {
      ctx.strokeStyle = '#e8762a';
      ctx.lineWidth   = 1.5;
      ctx.stroke();
      // Outer pulse ring
      ctx.beginPath(); ctx.arc(mx, my, r + 3, 0, Math.PI * 2);
      ctx.globalAlpha = 0.45;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  });

  // Ship dot
  ctx.beginPath(); ctx.arc(60, 60, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = '#e8ddd0'; ctx.fill();

  // Circular clip
  ctx.save();
  ctx.globalCompositeOperation = 'destination-in';
  ctx.beginPath(); ctx.arc(60, 60, 58, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
