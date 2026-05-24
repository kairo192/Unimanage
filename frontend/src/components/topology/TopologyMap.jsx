import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../api/axios';
import {
  Server, Laptop, Printer, Router, Link2, Unlink, AlertTriangle, CheckCircle2,
  Trash2, EyeOff,
} from 'lucide-react';
import {
  TOPO_SERVICE_W, TOPO_SERVICE_H, TOPO_DEVICE_W, TOPO_DEVICE_H,
  isPlacedOnMap, getServiceLayoutPos, getDeviceLayoutPos,
  getServicePort, getDevicePort, getLinkHealth, linkStroke, deviceIconType, clampToCanvas,
} from './topologyUtils';

const DRAG_MIME = 'application/unimanage-topology-v2';

export default function TopologyMap({
  topology,
  setTopology,
  devices,
  setDevices,
  isAr,
  t,
  getServiceDisplayName,
  showToast,
  setConfirmDialog,
  setAlertDialog,
}) {
  const containerRef = useRef(null);
  const draggingServiceRef = useRef(null);
  const draggingDeviceRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const lastPosRef = useRef(null);

  const [draggingService, setDraggingService] = useState(null);
  const [draggingDevice, setDraggingDevice] = useState(null);
  const [drawingLink, setDrawingLink] = useState(null);
  const [pullingLink, setPullingLink] = useState(null);
  const [hoveredLinkId, setHoveredLinkId] = useState(null);
  const [paletteSection, setPaletteSection] = useState('all');
  const drawingLinkRef = useRef(null);
  const pullingLinkRef = useRef(null);

  useEffect(() => { drawingLinkRef.current = drawingLink; }, [drawingLink]);
  useEffect(() => { pullingLinkRef.current = pullingLink; }, [pullingLink]);

  const mapDevices = topology.devices.filter((d) => isPlacedOnMap(d));
  const paletteDevices = topology.devices.filter((d) => !isPlacedOnMap(d));

  const getServicePos = useCallback(
    (s) => {
      const idx = topology.services.findIndex((x) => x.id === s.id);
      return getServiceLayoutPos(s, idx);
    },
    [topology.services]
  );

  const getDevicePos = useCallback(
    (d) => {
      const idx = topology.devices.findIndex((x) => x.id === d.id);
      return getDeviceLayoutPos(d, idx);
    },
    [topology.devices]
  );

  const findDeviceAtPoint = (lx, ly) => {
    for (const d of mapDevices) {
      const p = getDevicePos(d);
      if (lx >= p.x && lx <= p.x + TOPO_DEVICE_W && ly >= p.y && ly <= p.y + TOPO_DEVICE_H) {
        return d;
      }
    }
    return null;
  };

  const findServiceAtPoint = (lx, ly) => {
    for (const s of topology.services) {
      const p = getServicePos(s);
      if (lx >= p.x && lx <= p.x + TOPO_SERVICE_W && ly >= p.y && ly <= p.y + TOPO_SERVICE_H) {
        return s;
      }
    }
    return null;
  };

  const applyServicePosition = async (serviceId, map_x, map_y) => {
    await api.patch(`/it/services/${serviceId}/position`, { map_x, map_y });
    setTopology((prev) => ({
      ...prev,
      services: prev.services.map((s) => (s.id === serviceId ? { ...s, map_x, map_y } : s)),
    }));
  };

  const applyDevicePosition = async (deviceId, map_x, map_y) => {
    await api.patch(`/it/devices/${deviceId}/position`, { map_x, map_y });
    setTopology((prev) => ({
      ...prev,
      devices: prev.devices.map((d) => (d.id === deviceId ? { ...d, map_x, map_y } : d)),
    }));
    setDevices((prev) =>
      prev.map((d) => (d.id === deviceId ? { ...d, map_x, map_y } : d))
    );
  };

  const connectDevices = async (sourceId, targetId) => {
    const src = devices.find((d) => d.id === sourceId) || topology.devices.find((d) => d.id === sourceId);
    if (!src) return;
    await api.put(`/it/devices/${sourceId}`, { ...src, connected_to_id: targetId });
    setTopology((prev) => ({
      ...prev,
      devices: prev.devices.map((d) =>
        d.id === sourceId ? { ...d, connected_to_id: targetId } : d
      ),
    }));
    setDevices((prev) =>
      prev.map((d) => (d.id === sourceId ? { ...d, connected_to_id: targetId } : d))
    );
  };

  const disconnectDevice = async (sourceId) => {
    const src = devices.find((d) => d.id === sourceId) || topology.devices.find((d) => d.id === sourceId);
    if (!src) return;
    await api.put(`/it/devices/${sourceId}`, { ...src, connected_to_id: null });
    setTopology((prev) => ({
      ...prev,
      devices: prev.devices.map((d) =>
        d.id === sourceId ? { ...d, connected_to_id: null } : d
      ),
    }));
    setDevices((prev) =>
      prev.map((d) => (d.id === sourceId ? { ...d, connected_to_id: null } : d))
    );
  };

  const startLinkDraw = (e, sourceDevice, port) => {
    e.stopPropagation();
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setDrawingLink({
      sourceDevice,
      startX: port.x,
      startY: port.y,
      currentX: port.x,
      currentY: port.y,
    });
  };

  const startLinkPull = (e, sourceDevice, port) => {
    e.stopPropagation();
    e.preventDefault();
    setPullingLink({
      sourceDevice,
      startX: port.x,
      startY: port.y,
      currentX: port.x,
      currentY: port.y,
    });
  };

  useEffect(() => {
    const active = draggingService || draggingDevice || drawingLink || pullingLink;
    if (!active) return undefined;

    const onMove = (e) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const lx = e.clientX - rect.left;
      const ly = e.clientY - rect.top;

      setDrawingLink((p) => (p ? { ...p, currentX: lx, currentY: ly } : null));
      setPullingLink((p) => (p ? { ...p, currentX: lx, currentY: ly } : null));

      if (draggingServiceRef.current) {
        const o = dragOffsetRef.current;
        const id = draggingServiceRef.current.id;
        const pos = clampToCanvas(lx - o.x, ly - o.y, TOPO_SERVICE_W, TOPO_SERVICE_H, rect);
        lastPosRef.current = { type: 'service', id, ...pos };
        setTopology((prev) => ({
          ...prev,
          services: prev.services.map((s) =>
            s.id === id ? { ...s, map_x: pos.x, map_y: pos.y } : s
          ),
        }));
      }
      if (draggingDeviceRef.current) {
        const o = dragOffsetRef.current;
        const id = draggingDeviceRef.current.id;
        const pos = clampToCanvas(lx - o.x, ly - o.y, TOPO_DEVICE_W, TOPO_DEVICE_H, rect);
        lastPosRef.current = { type: 'device', id, ...pos };
        setTopology((prev) => ({
          ...prev,
          devices: prev.devices.map((d) =>
            d.id === id ? { ...d, map_x: pos.x, map_y: pos.y } : d
          ),
        }));
      }
    };

    const onUp = async (e) => {
      const rect = containerRef.current?.getBoundingClientRect();
      const lx = rect ? e.clientX - rect.left : 0;
      const ly = rect ? e.clientY - rect.top : 0;

      const activeDraw = drawingLinkRef.current;
      const activePull = pullingLinkRef.current;

      if (activeDraw) {
        const target = findDeviceAtPoint(lx, ly);
        const src = activeDraw.sourceDevice;
        if (target && target.id !== src.id) {
          setConfirmDialog({
            title: t('Connect devices title'),
            message: t('Connect devices message')
              .replace('{a}', src.pc_code || src.ip_address || 'Device')
              .replace('{b}', target.pc_code || target.ip_address || 'Device'),
            confirmLabel: t('Connect'),
            cancelLabel: t('Cancel'),
            tone: 'primary',
            onConfirm: async () => {
              try {
                await connectDevices(src.id, target.id);
                showToast(t('Link created'), 'success');
              } catch (err) {
                console.error(err);
                setAlertDialog({ message: 'Error creating link' });
              }
            },
          });
        }
        setDrawingLink(null);
      }

      if (activePull) {
        const pulled = Math.hypot(
          lx - activePull.startX,
          ly - activePull.startY
        ) > 36;
        if (pulled) {
          const src = activePull.sourceDevice;
          try {
            await disconnectDevice(src.id);
            showToast(t('Link removed'), 'success');
          } catch (err) {
            console.error(err);
            setAlertDialog({ message: 'Error removing link' });
          }
        }
        setPullingLink(null);
      }

      if (draggingServiceRef.current && lastPosRef.current?.type === 'service') {
        const { id, x, y } = lastPosRef.current;
        try {
          await applyServicePosition(id, x, y);
        } catch (err) {
          console.error(err);
        }
      }
      if (draggingDeviceRef.current && lastPosRef.current?.type === 'device') {
        const { id, x, y } = lastPosRef.current;
        try {
          await applyDevicePosition(id, x, y);
        } catch (err) {
          console.error(err);
        }
      }

      draggingServiceRef.current = null;
      draggingDeviceRef.current = null;
      lastPosRef.current = null;
      setDraggingService(null);
      setDraggingDevice(null);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [
    draggingService,
    draggingDevice,
    drawingLink,
    pullingLink,
    topology.devices,
    mapDevices,
    devices,
    t,
    setConfirmDialog,
    setAlertDialog,
    showToast,
    setTopology,
    setDevices,
    findDeviceAtPoint,
    getDevicePos,
  ]);

  const onPaletteDragStart = (e, payload) => {
    e.dataTransfer.setData(DRAG_MIME, JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'move';
  };

  const onCanvasDrop = (e) => {
    e.preventDefault();
    let data;
    try {
      data = JSON.parse(e.dataTransfer.getData(DRAG_MIME));
    } catch {
      return;
    }
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    let map_x = e.clientX - rect.left - (data.type === 'device' ? TOPO_DEVICE_W / 2 : TOPO_SERVICE_W / 2);
    let map_y = e.clientY - rect.top - (data.type === 'device' ? TOPO_DEVICE_H / 2 : TOPO_SERVICE_H / 2);
    const w = data.type === 'device' ? TOPO_DEVICE_W : TOPO_SERVICE_W;
    const h = data.type === 'device' ? TOPO_DEVICE_H : TOPO_SERVICE_H;
    const pos = clampToCanvas(map_x, map_y, w, h, rect);

    if (data.type === 'service') {
      const service = topology.services.find((s) => s.id === data.id);
      if (!service) return;
      const name = getServiceDisplayName(service);
      const run = () => applyServicePosition(service.id, pos.x, pos.y).then(() => showToast(t('Position saved'), 'success'));
      if (isPlacedOnMap(service)) {
        showToast(t('Already on map'), 'warning');
        setConfirmDialog({
          title: t('Move site title'),
          message: t('Move site message').replace('{name}', name),
          confirmLabel: t('Move'),
          cancelLabel: t('Cancel'),
          tone: 'primary',
          onConfirm: run,
        });
      } else {
        setConfirmDialog({
          title: t('Place site title'),
          message: t('Place site message').replace('{name}', name),
          confirmLabel: t('Place'),
          cancelLabel: t('Cancel'),
          tone: 'primary',
          onConfirm: run,
        });
      }
      return;
    }

    if (data.type === 'device') {
      const device = topology.devices.find((d) => d.id === data.id);
      if (!device) return;
      const label = device.pc_code || device.ip_address || device.device_type;
      const run = () => applyDevicePosition(device.id, pos.x, pos.y).then(() => showToast(t('Device placed'), 'success'));
      if (isPlacedOnMap(device)) {
        showToast(t('Device on map'), 'warning');
        setConfirmDialog({
          title: t('Move device title'),
          message: t('Move device message').replace('{name}', label),
          confirmLabel: t('Move'),
          cancelLabel: t('Cancel'),
          tone: 'primary',
          onConfirm: run,
        });
      } else {
        setConfirmDialog({
          title: t('Place device title'),
          message: t('Place device message').replace('{name}', label),
          confirmLabel: t('Place'),
          cancelLabel: t('Cancel'),
          tone: 'primary',
          onConfirm: run,
        });
      }
    }
  };

  const renderDeviceIcon = (type, size = 22) => {
    const k = deviceIconType(type);
    if (k === 'printer') return <Printer size={size} />;
    if (k === 'router') return <Router size={size} />;
    return <Laptop size={size} />;
  };

  const buildLinks = () => {
    const lines = [];
    topology.devices.forEach((d) => {
      if (!d.connected_to_id) return;
      const target = topology.devices.find((x) => x.id === d.connected_to_id);
      if (!target) return;
      const srcOnMap = isPlacedOnMap(d);
      const tgtOnMap = isPlacedOnMap(target);
      if (!srcOnMap && !tgtOnMap) return;

      let x1, y1, x2, y2;
      if (srcOnMap) {
        const p = getDevicePos(d);
        const port = getDevicePort(p, 'right');
        x1 = port.x;
        y1 = port.y;
      } else {
        const svc = topology.services.find((s) => s.id === d.service_id);
        if (!svc) return;
        const sp = getServicePort(getServicePos(svc), 'right');
        x1 = sp.x;
        y1 = sp.y;
      }
      if (tgtOnMap) {
        const p = getDevicePos(target);
        const port = getDevicePort(p, 'left');
        x2 = port.x;
        y2 = port.y;
      } else {
        const svc = topology.services.find((s) => s.id === target.service_id);
        if (!svc) return;
        const sp = getServicePort(getServicePos(svc), 'left');
        x2 = sp.x;
        y2 = sp.y;
      }

      const health = getLinkHealth(d, target);
      const colors = linkStroke(health);
      const linkId = `dev-${d.id}-${target.id}`;

      lines.push({
        linkId,
        x1,
        y1,
        x2,
        y2,
        health,
        colors,
        sourceDevice: d,
        portOut: { x: x1, y: y1 },
      });
    });

    mapDevices.forEach((d) => {
      if (!d.service_id) return;
      const svc = topology.services.find((s) => s.id === d.service_id);
      if (!svc || !isPlacedOnMap(svc)) return;
      const sp = getServicePos(svc);
      const dp = getDevicePos(d);
      const health =
        d.status === 'faulty' || parseInt(svc.critical_issues) > 0 ? 'fault' : 'ok';
      const colors = linkStroke(health);
      lines.push({
        linkId: `svc-${svc.id}-${d.id}`,
        x1: getServicePort(sp, 'right').x,
        y1: getServicePort(sp, 'right').y,
        x2: getDevicePort(dp, 'left').x,
        y2: getDevicePort(dp, 'left').y,
        health,
        colors,
        dashed: true,
        sourceDevice: null,
      });
    });

    return lines;
  };

  const links = buildLinks();

  const PaletteItem = ({ icon, label, badge, placed, onDragStart }) => (
    <div
      draggable
      onDragStart={onDragStart}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 10px',
        borderRadius: '8px',
        border: placed ? '1px solid #8ea45c' : '1px dashed #c9c1b5',
        background: placed ? '#f4f8ec' : '#fefaf0',
        cursor: 'grab',
        userSelect: 'none',
      }}
    >
      {icon}
      <span style={{ fontWeight: '600', fontSize: '12px', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      <span style={{
        fontSize: '9px',
        fontWeight: '700',
        textTransform: 'uppercase',
        padding: '2px 6px',
        borderRadius: '4px',
        background: placed ? '#e3ebd0' : '#f5f1ea',
        color: placed ? '#5c651f' : '#8a7f72',
      }}>
        {badge}
      </span>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: isAr ? 'row-reverse' : 'row', gap: '16px', minHeight: 'min(72vh, 680px)' }}>
      <aside style={{
        width: 'min(300px, 36vw)',
        flexShrink: 0,
        background: '#fff',
        borderRadius: '12px',
        border: '1px solid #e8e2d6',
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxHeight: '680px',
        overflow: 'hidden',
      }}>
        <style>{`
          .topo-node-btn {
            opacity: 0;
            transition: opacity 0.15s ease-in-out, transform 0.15s ease-in-out;
            transform: scale(0.9);
          }
          .topo-node:hover .topo-node-btn {
            opacity: 1;
            transform: scale(1);
          }
          .topo-node-btn:hover {
            background: #f5f1ea !important;
            transform: scale(1.05) !important;
          }
        `}</style>
        <div style={{ fontWeight: '800', fontSize: '14px' }}>{t('Equipment palette')}</div>
        <p style={{ fontSize: '11px', color: '#8a7f72', margin: 0, lineHeight: 1.4 }}>{t('Topo palette intro')}</p>

        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {['all', 'sites', 'devices'].map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setPaletteSection(key)}
              style={{
                padding: '5px 10px',
                fontSize: '11px',
                fontWeight: '700',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                background: paletteSection === key ? '#1a1a14' : '#f5f1ea',
                color: paletteSection === key ? '#fff' : '#5a5248',
              }}
            >
              {t(`Palette ${key}`)}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {(paletteSection === 'all' || paletteSection === 'sites') && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#8a7f72', textTransform: 'uppercase', marginBottom: '6px' }}>{t('Sites')}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {topology.services.map((s) => (
                  <PaletteItem
                    key={`s-${s.id}`}
                    icon={<Server size={16} color="#5a5248" />}
                    label={getServiceDisplayName(s)}
                    badge={isPlacedOnMap(s) ? t('On map') : t('Not placed')}
                    placed={isPlacedOnMap(s)}
                    onDragStart={(e) => onPaletteDragStart(e, { type: 'service', id: s.id })}
                  />
                ))}
              </div>
            </div>
          )}

          {(paletteSection === 'all' || paletteSection === 'devices') && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#8a7f72', textTransform: 'uppercase', marginBottom: '6px' }}>
                {t('Available devices')} ({topology.devices.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {topology.devices.length === 0 && (
                  <span style={{ fontSize: '11px', color: '#8a7f72' }}>{t('No devices hint')}</span>
                )}
                {topology.devices.map((d) => {
                  const svc = topology.services.find((s) => s.id === d.service_id);
                  const label = d.pc_code || d.ip_address || d.device_type;
                  const sub = svc ? getServiceDisplayName(svc) : '—';
                  return (
                    <PaletteItem
                      key={`d-${d.id}`}
                      icon={renderDeviceIcon(d.device_type, 16)}
                      label={`${label} · ${sub}`}
                      badge={isPlacedOnMap(d) ? t('On map') : t('Available')}
                      placed={isPlacedOnMap(d)}
                      onDragStart={(e) => onPaletteDragStart(e, { type: 'device', id: d.id })}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div style={{ borderTop: '1px solid #e8e2d6', paddingTop: '10px', fontSize: '10px', color: '#8a7f72' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span style={{ width: 20, height: 3, background: '#3d8b40', borderRadius: 2 }} /> {t('Legend ok')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span style={{ width: 20, height: 3, background: '#d45c3c', borderRadius: 2 }} /> {t('Legend fault')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 20, height: 3, background: '#8a7f72', borderRadius: 2, borderStyle: 'dashed' }} /> {t('Legend service')}
          </div>
        </div>
      </aside>

      <div
        ref={containerRef}
        className="topology-container"
        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
        onDrop={onCanvasDrop}
        style={{
          flex: 1,
          minWidth: 0,
          position: 'relative',
          height: '680px',
          background: '#f8f6f0',
          borderRadius: '12px',
          border: '1px solid #e8e2d6',
          overflow: 'hidden',
          cursor: draggingService || draggingDevice ? 'grabbing' : drawingLink || pullingLink ? 'crosshair' : 'default',
        }}
      >
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(#e0dbd0 1px, transparent 1px), linear-gradient(90deg, #e0dbd0 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          opacity: 0.55,
          pointerEvents: 'none',
        }} />

        {(pullingLink || drawingLink) && (
          <div style={{
            position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
            background: pullingLink ? '#fce4db' : '#e3ebd0',
            color: pullingLink ? '#b84a2e' : '#5c651f',
            padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', zIndex: 50,
          }}>
            {pullingLink ? t('Pull to disconnect') : t('Drop on device to connect')}
          </div>
        )}

        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 2 }}>
          {links.map((ln) => (
            <g key={ln.linkId}>
              <line
                x1={ln.x1}
                y1={ln.y1}
                x2={ln.x2}
                y2={ln.y2}
                stroke={ln.colors.glow}
                strokeWidth="8"
                opacity="0.25"
                strokeDasharray={ln.dashed ? '6,4' : undefined}
              />
              {ln.sourceDevice && (
                <line
                  x1={ln.x1}
                  y1={ln.y1}
                  x2={ln.x2}
                  y2={ln.y2}
                  stroke="transparent"
                  strokeWidth="16"
                  style={{ pointerEvents: 'stroke', cursor: 'grab' }}
                  onMouseEnter={() => setHoveredLinkId(ln.linkId)}
                  onMouseLeave={() => setHoveredLinkId(null)}
                  onMouseDown={(e) => startLinkPull(e, ln.sourceDevice, ln.portOut)}
                />
              )}
              <line
                x1={ln.x1}
                y1={ln.y1}
                x2={ln.x2}
                y2={ln.y2}
                stroke={ln.colors.stroke}
                strokeWidth={hoveredLinkId === ln.linkId ? 4 : 2.5}
                strokeDasharray={ln.dashed ? '8,5' : '10,6'}
                className={!ln.dashed ? 'glowing-network-line' : undefined}
                style={{ pointerEvents: 'none' }}
              />
            </g>
          ))}
          {drawingLink && (
            <line x1={drawingLink.startX} y1={drawingLink.startY} x2={drawingLink.currentX} y2={drawingLink.currentY} stroke="#1a1a14" strokeWidth="2.5" strokeDasharray="6,4" />
          )}
          {pullingLink && (
            <line x1={pullingLink.startX} y1={pullingLink.startY} x2={pullingLink.currentX} y2={pullingLink.currentY} stroke="#d45c3c" strokeWidth="3" strokeDasharray="4,4" />
          )}
        </svg>

        {topology.services.filter((s) => isPlacedOnMap(s) || topology.services.indexOf(s) < 8).map((s) => {
          const pos = getServicePos(s);
          const critical = parseInt(s.critical_issues) > 0;
          const onMap = isPlacedOnMap(s);
          return (
            <div
              key={`svc-${s.id}`}
              className="topo-node"
              style={{
                position: 'absolute',
                left: pos.x,
                top: pos.y,
                width: TOPO_SERVICE_W,
                minHeight: TOPO_SERVICE_H,
                background: '#fff',
                borderRadius: '10px',
                border: `2px solid ${critical ? '#d45c3c' : '#8ea45c'}`,
                boxShadow: onMap ? '0 6px 20px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.04)',
                zIndex: draggingService?.id === s.id ? 40 : 12,
                opacity: onMap ? 1 : 0.85,
                userSelect: 'none',
              }}
            >
              {/* Node Delete/Remove Action Buttons */}
              {onMap && (
                <div style={{
                  position: 'absolute',
                  top: '6px',
                  right: isAr ? 'auto' : '36px',
                  left: isAr ? '36px' : 'auto',
                  display: 'flex',
                  gap: '4px',
                  zIndex: 30,
                }}>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        await applyServicePosition(s.id, 200, 200);
                        showToast(t('Removed from map'), 'info');
                      } catch (err) {
                        setAlertDialog({ message: 'Error removing service from map' });
                      }
                    }}
                    className="topo-node-btn"
                    style={{
                      background: '#fff', border: '1px solid #e8e2d6', color: '#8a7f72', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: '22px', height: '22px', borderRadius: '4px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    }}
                    title="Remove from Map"
                  >
                    <EyeOff size={12} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDialog({
                        title: t('Delete Service Node'),
                        message: `Are you sure you want to permanently delete "${getServiceDisplayName(s)}"? This will also disconnect all its devices.`,
                        confirmLabel: t('Delete'),
                        cancelLabel: t('Cancel'),
                        tone: 'destructive',
                        onConfirm: async () => {
                          try {
                            await api.delete(`/it/services/${s.id}`);
                            setTopology(prev => ({
                              ...prev,
                              services: prev.services.filter(x => x.id !== s.id)
                            }));
                            showToast('Service deleted permanently.', 'success');
                          } catch (err) {
                            setAlertDialog({ message: 'Error deleting service' });
                          }
                        }
                      });
                    }}
                    className="topo-node-btn"
                    style={{
                      background: '#fff', border: '1px solid #fce4db', color: '#d45c3c', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: '22px', height: '22px', borderRadius: '4px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    }}
                    title="Delete Permanently"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}

              <div
                onMouseDown={(e) => {
                  e.preventDefault();
                  const rect = containerRef.current.getBoundingClientRect();
                  draggingServiceRef.current = s;
                  dragOffsetRef.current = { x: e.clientX - rect.left - pos.x, y: e.clientY - rect.top - pos.y };
                  setDraggingService(s);
                }}
                style={{ padding: '10px 12px', cursor: 'grab', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Server size={20} color={critical ? '#d45c3c' : '#5c651f'} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: '800', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {getServiceDisplayName(s)}
                  </div>
                  <div style={{ fontSize: '10px', color: '#8a7f72' }}>{s.floor || '—'} · {s.room_number || '—'}</div>
                </div>
                {critical ? <AlertTriangle size={16} color="#d45c3c" style={{ marginRight: '16px' }} /> : <CheckCircle2 size={16} color="#8ea45c" style={{ marginRight: '16px' }} />}
              </div>
              <div
                style={{
                  position: 'absolute',
                  right: -8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: '#1a1a14',
                  border: '2px solid #fff',
                }}
                title={t('Service port')}
              />
            </div>
          );
        })}

        {mapDevices.map((d) => {
          const pos = getDevicePos(d);
          const faulty = d.status === 'faulty' || parseInt(d.open_issues) > 0;
          const outPort = getDevicePort(pos, 'right');
          const inPort = getDevicePort(pos, 'left');
          return (
            <div
              key={`dev-${d.id}`}
              className="topo-node"
              data-topo-device-id={d.id}
              style={{
                position: 'absolute',
                left: pos.x,
                top: pos.y,
                width: TOPO_DEVICE_W,
                height: TOPO_DEVICE_H,
                background: faulty ? '#fff5f3' : '#fff',
                borderRadius: '8px',
                border: `2px solid ${faulty ? '#d45c3c' : '#3d8b40'}`,
                boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
                zIndex: draggingDevice?.id === d.id ? 45 : 15,
                userSelect: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
              }}
            >
              {/* Device Delete/Remove Actions */}
              <div style={{
                position: 'absolute',
                top: '2px',
                right: isAr ? 'auto' : '2px',
                left: isAr ? '2px' : 'auto',
                display: 'flex',
                gap: '2px',
                zIndex: 30,
              }}>
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    try {
                      await applyDevicePosition(d.id, 200, 200);
                      showToast(t('Removed from map'), 'info');
                    } catch (err) {
                      setAlertDialog({ message: 'Error removing device from map' });
                    }
                  }}
                  className="topo-node-btn"
                  style={{
                    background: '#fff', border: '1px solid #e8e2d6', color: '#8a7f72', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '16px', height: '16px', borderRadius: '3px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  }}
                  title="Remove from Map"
                >
                  <EyeOff size={10} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDialog({
                      title: t('Delete Device'),
                      message: `Are you sure you want to permanently delete device "${d.pc_code || d.ip_address || d.device_type}" from inventory?`,
                      confirmLabel: t('Delete'),
                      cancelLabel: t('Cancel'),
                      tone: 'destructive',
                      onConfirm: async () => {
                        try {
                          await api.delete(`/it/devices/${d.id}`);
                          setTopology(prev => ({
                            ...prev,
                            devices: prev.devices.filter(x => x.id !== d.id)
                          }));
                          setDevices(prev => prev.filter(x => x.id !== d.id));
                          showToast('Device deleted permanently.', 'success');
                        } catch (err) {
                          setAlertDialog({ message: 'Error deleting device' });
                        }
                      }
                    });
                  }}
                  className="topo-node-btn"
                  style={{
                    background: '#fff', border: '1px solid #fce4db', color: '#d45c3c', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '16px', height: '16px', borderRadius: '3px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  }}
                  title="Delete Permanently"
                >
                  <Trash2 size={10} />
                </button>
              </div>
              <div
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const rect = containerRef.current.getBoundingClientRect();
                  draggingDeviceRef.current = d;
                  dragOffsetRef.current = { x: e.clientX - rect.left - pos.x, y: e.clientY - rect.top - pos.y };
                  setDraggingDevice(d);
                }}
                style={{ cursor: 'grab', textAlign: 'center', padding: '4px', width: '100%' }}
              >
                {renderDeviceIcon(d.device_type)}
                <div style={{ fontSize: '10px', fontWeight: '800', marginTop: 2, maxWidth: TOPO_DEVICE_W - 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {d.pc_code || d.ip_address || d.device_type}
                </div>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', margin: '2px auto 0',
                  background: faulty ? '#d45c3c' : '#3d8b40',
                  boxShadow: faulty ? '0 0 6px #d45c3c' : '0 0 6px #8ea45c',
                }} />
              </div>
              <div
                onMouseDown={(e) => startLinkDraw(e, d, outPort)}
                title={t('Drag to connect')}
                style={{
                  position: 'absolute',
                  right: -7,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: '#1a1a14',
                  border: '2px solid #fff',
                  cursor: 'crosshair',
                  zIndex: 5,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: -7,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: '#3d8b40',
                  border: '2px solid #fff',
                  zIndex: 5,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
