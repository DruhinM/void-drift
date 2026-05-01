export const keys = {};

const MOVEMENT_KEYS = new Set(['w','a','s','d','q','e',' ','arrowup','arrowdown','arrowleft','arrowright']);

export function initInput({ onRaceKey, onAnyMovementKey } = {}) {
  window.addEventListener('keydown', e => {
    const k = e.key.toLowerCase();
    keys[k] = true;
    if (k === 'r') onRaceKey?.();
    if (MOVEMENT_KEYS.has(k)) {
      e.preventDefault();
      onAnyMovementKey?.();
    }
  });
  window.addEventListener('keyup', e => {
    keys[e.key.toLowerCase()] = false;
  });
}
