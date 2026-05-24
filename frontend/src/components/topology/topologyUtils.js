export const TOPO_SERVICE_W = 220;
export const TOPO_SERVICE_H = 88;
export const TOPO_DEVICE_W = 96;
export const TOPO_DEVICE_H = 72;

export const isDefaultMapCoord = (v) =>
  !Number.isFinite(parseFloat(v)) || parseFloat(v) === 200;

export const isPlacedOnMap = (item) =>
  !isDefaultMapCoord(item.map_x) && !isDefaultMapCoord(item.map_y);

export const getServiceLayoutPos = (s, index) => {
  const mx = parseFloat(s.map_x);
  const my = parseFloat(s.map_y);
  const x = isDefaultMapCoord(mx) ? 40 + (index % 4) * 260 : mx;
  const y = isDefaultMapCoord(my) ? 40 + Math.floor(index / 4) * 160 : my;
  return { x, y };
};

export const getDeviceLayoutPos = (d, index) => {
  const mx = parseFloat(d.map_x);
  const my = parseFloat(d.map_y);
  const x = isDefaultMapCoord(mx) ? 120 + (index % 5) * 110 : mx;
  const y = isDefaultMapCoord(my) ? 320 + Math.floor(index / 5) * 100 : my;
  return { x, y };
};

export const getServicePort = (pos, side = 'right') => {
  if (!pos) return null;
  if (side === 'right') {
    return { x: pos.x + TOPO_SERVICE_W, y: pos.y + TOPO_SERVICE_H / 2 };
  }
  return { x: pos.x, y: pos.y + TOPO_SERVICE_H / 2 };
};

export const getDevicePort = (pos, side = 'right') => {
  if (!pos) return null;
  if (side === 'right') {
    return { x: pos.x + TOPO_DEVICE_W, y: pos.y + TOPO_DEVICE_H / 2 };
  }
  return { x: pos.x, y: pos.y + TOPO_DEVICE_H / 2 };
};

/** @returns {'ok'|'fault'|'warning'} */
export const getLinkHealth = (sourceDev, targetDev, openIssuesMap = {}) => {
  const srcIssues = Number(openIssuesMap[sourceDev?.id] ?? sourceDev?.open_issues ?? 0);
  const tgtIssues = Number(openIssuesMap[targetDev?.id] ?? targetDev?.open_issues ?? 0);
  if (
    sourceDev?.status === 'faulty' ||
    targetDev?.status === 'faulty' ||
    srcIssues > 0 ||
    tgtIssues > 0
  ) {
    return 'fault';
  }
  if (sourceDev?.status !== 'operational' || targetDev?.status !== 'operational') {
    return 'warning';
  }
  return 'ok';
};

export const linkStroke = (health) => {
  if (health === 'fault') return { stroke: '#d45c3c', glow: '#d45c3c' };
  if (health === 'warning') return { stroke: '#b8631c', glow: '#b8631c' };
  return { stroke: '#3d8b40', glow: '#8ea45c' };
};

export const deviceIconType = (type) => {
  if (type === 'printer') return 'printer';
  if (type === 'router' || type === 'switch' || type === 'access_point') return 'router';
  return 'pc';
};

export const clampToCanvas = (x, y, w, h, rect) => ({
  x: Math.max(8, Math.min(rect.width - w - 8, x)),
  y: Math.max(8, Math.min(rect.height - h - 8, y)),
});
