const MAX_PITCH = Math.PI / 2 - .08;

export function applyMouseLook({ yaw, pitch }, movementX, movementY, sensitivity = .0022) {
  return { yaw: yaw - movementX * sensitivity,
    pitch: Math.max(-MAX_PITCH, Math.min(MAX_PITCH, pitch - movementY * sensitivity)) };
}

export function walkingDirection(keys, yaw) {
  const forward = Number(keys.has('w') || keys.has('arrowup')) - Number(keys.has('s') || keys.has('arrowdown'));
  const sideways = Number(keys.has('d')) - Number(keys.has('a'));
  const length = Math.hypot(forward, sideways) || 1;
  return { x: (-Math.sin(yaw) * forward + Math.cos(yaw) * sideways) / length,
    z: (-Math.cos(yaw) * forward - Math.sin(yaw) * sideways) / length };
}
