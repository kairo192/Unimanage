import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useOutletContext } from 'react-router-dom';
import { 
  Network, Server, MonitorSmartphone, Printer, Laptop, ShieldAlert,
  Plus, Search, Edit2, Trash2, Link as LinkIcon, AlertCircle, CheckCircle2, Router, Map, Link2, Unlink
} from 'lucide-react';
import { ConfirmDialog, AlertDialog, Toast } from '../components/CustomDialogs';
import TopologyMap from '../components/topology/TopologyMap';

const DICT = {
  'IT & Network Infrastructure': { en: 'IT & Network Infrastructure', ar: 'البنية التحتية لتكنولوجيا المعلومات والشبكات', fr: 'Infrastructure Informatique et Réseau' },
  'Topology Map': { en: 'Topology Map', ar: 'خريطة الشبكة', fr: 'Carte Topologique' },
  'Services & Nodes': { en: 'Services & Nodes', ar: 'المصالح والعقد', fr: 'Services et Nœuds' },
  'Devices': { en: 'Devices', ar: 'الأجهزة', fr: 'Appareils' },
  'Issues': { en: 'Issues', ar: 'المشاكل التقنية', fr: 'Problèmes Techniques' },
  'Add Service Node': { en: 'Add Service Node', ar: 'إضافة مصلحة', fr: 'Ajouter un Service' },
  'Add Device': { en: 'Add Device', ar: 'إضافة جهاز', fr: 'Ajouter un Appareil' },
  'Report Issue': { en: 'Report Issue', ar: 'الإبلاغ عن مشكلة', fr: 'Signaler un Problème' },
  'Connect Nodes': { en: 'Connect Devices', ar: 'ربط الأجهزة', fr: 'Relier les Équipements' },
  'Equipment palette': { en: 'Equipment', ar: 'المعدات', fr: 'Équipements' },
  'Drag onto map': { en: 'Drag onto the map to place or move a site.', ar: 'اسحب إلى الخريطة لوضع المصلحة أو نقلها.', fr: 'Glissez sur la carte pour placer ou déplacer un site.' },
  'Drag devices hint': { en: 'Drag the small plug on a device to another device to link them.', ar: 'اسحب المقبس الصغير من جهاز إلى جهاز لربطهما.', fr: 'Glissez la petite prise d’un appareil vers un autre pour les lier.' },
  'Palette hint confirm': { en: 'Each drop asks for confirmation. Sites already on the map show a quick notice.', ar: 'كل إفلات يطلب تأكيداً. المواقع الموجودة على الخريطة تعرض تنبيهاً سريعاً.', fr: 'Chaque dépôt demande une confirmation. Les sites déjà sur la carte affichent un avis rapide.' },
  'Already on map': { en: 'This site is already on the map.', ar: 'هذا الموقع موجود بالفعل على الخريطة.', fr: 'Ce site est déjà sur la carte.' },
  'Already here': { en: 'This site is already at this location.', ar: 'هذا الموقع موجود بالفعل في هذا الموضع.', fr: 'Ce site est déjà à cet emplacement.' },
  'Place site title': { en: 'Place on map?', ar: 'وضع على الخريطة؟', fr: 'Placer sur la carte ?' },
  'Place site message': { en: 'Place "{name}" at the drop location on the topology map?', ar: 'وضع "{name}" في موضع الإفلات على خريطة الشبكة؟', fr: 'Placer « {name} » à l’emplacement du dépôt sur la carte ?' },
  'Move site title': { en: 'Move site?', ar: 'نقل الموقع؟', fr: 'Déplacer le site ?' },
  'Move site message': { en: '"{name}" is already on the map. Move it to the new drop location?', ar: '"{name}" موجود على الخريطة. نقله إلى موضع الإفلات الجديد؟', fr: '« {name} » est déjà sur la carte. Le déplacer vers le nouvel emplacement ?' },
  'Place': { en: 'Place', ar: 'وضع', fr: 'Placer' },
  'Move': { en: 'Move', ar: 'نقل', fr: 'Déplacer' },
  'Cancel': { en: 'Cancel', ar: 'إلغاء', fr: 'Annuler' },
  'Position saved': { en: 'Map position updated.', ar: 'تم تحديث موضع الخريطة.', fr: 'Position sur la carte mise à jour.' },
  'On map': { en: 'On map', ar: 'على الخريطة', fr: 'Sur carte' },
  'Not placed': { en: 'Not placed', ar: 'غير موضوع', fr: 'Non placé' },
  'Topo palette intro': { en: 'Drag sites and devices onto the canvas. Connect with ports; pull a line to disconnect.', ar: 'اسحب المصالح والأجهزة إلى اللوحة. صِل عبر المنافذ؛ اسحب الخط لفصل الاتصال.', fr: 'Glissez sites et appareils sur le canevas. Reliez via les ports ; tirez un câble pour déconnecter.' },
  'Palette all': { en: 'All', ar: 'الكل', fr: 'Tout' },
  'Palette sites': { en: 'Sites', ar: 'المصالح', fr: 'Sites' },
  'Palette devices': { en: 'Devices', ar: 'الأجهزة', fr: 'Appareils' },
  'Sites': { en: 'Sites / Services', ar: 'المصالح', fr: 'Sites / Services' },
  'Available devices': { en: 'Available devices', ar: 'الأجهزة المتاحة', fr: 'Appareils disponibles' },
  'Available': { en: 'Available', ar: 'متاح', fr: 'Disponible' },
  'No devices hint': { en: 'Add devices in the Devices tab first.', ar: 'أضف الأجهزة من تبويب الأجهزة أولاً.', fr: 'Ajoutez des appareils dans l’onglet Appareils.' },
  'Legend ok': { en: 'Link OK (operational)', ar: 'اتصال سليم', fr: 'Lien OK' },
  'Legend fault': { en: 'Fault / open issue', ar: 'عطل / مشكلة مفتوحة', fr: 'Défaut / incident' },
  'Legend service': { en: 'Service membership', ar: 'انتماء للمصلحة', fr: 'Rattachement service' },
  'Connect devices title': { en: 'Connect devices?', ar: 'ربط الأجهزة؟', fr: 'Connecter les appareils ?' },
  'Connect devices message': { en: 'Link "{a}" to "{b}" with a network cable?', ar: 'ربط "{a}" بـ "{b}" بكابل شبكة؟', fr: 'Relier « {a} » à « {b} » ?' },
  'Connect': { en: 'Connect', ar: 'ربط', fr: 'Connecter' },
  'Link created': { en: 'Link connected.', ar: 'تم إنشاء الاتصال.', fr: 'Lien établi.' },
  'Link removed': { en: 'Link disconnected.', ar: 'تم فصل الاتصال.', fr: 'Lien supprimé.' },
  'Pull to disconnect': { en: 'Pull the line away to disconnect…', ar: 'اسحب الخط بعيداً للفصل…', fr: 'Tirez le câble pour déconnecter…' },
  'Drop on device to connect': { en: 'Drop on a device to connect…', ar: 'أفلت على جهاز للربط…', fr: 'Déposez sur un appareil…' },
  'Device placed': { en: 'Device placed on map.', ar: 'تم وضع الجهاز على الخريطة.', fr: 'Appareil placé.' },
  'Device on map': { en: 'Device is already on the map.', ar: 'الجهاز موجود على الخريطة.', fr: 'Appareil déjà sur la carte.' },
  'Place device title': { en: 'Place device?', ar: 'وضع الجهاز؟', fr: 'Placer l’appareil ?' },
  'Place device message': { en: 'Place "{name}" on the topology map?', ar: 'وضع "{name}" على خريطة الشبكة؟', fr: 'Placer « {name} » sur la carte ?' },
  'Move device title': { en: 'Move device?', ar: 'نقل الجهاز؟', fr: 'Déplacer l’appareil ?' },
  'Move device message': { en: '"{name}" is on the map. Move to the drop location?', ar: '"{name}" على الخريطة. نقله لموضع الإفلات؟', fr: '« {name} » est sur la carte. Déplacer ?' },
  'Service port': { en: 'Service port', ar: 'منفذ المصلحة', fr: 'Port service' },
  'Drag to connect': { en: 'Drag to connect', ar: 'اسحب للربط', fr: 'Glisser pour connecter' },
};

const TOPO_NODE_W = 240;
const TOPO_NODE_H = 200;

export default function NetworkPage() {
  const { user } = useOutletContext();
  const lang = localStorage.getItem('lang') || 'en';
  const isAr = lang === 'ar';
  const t = (key) => DICT[key]?.[lang] || key;

  const [activeTab, setActiveTab] = useState('topology');
  const [services, setServices] = useState([]);
  const [devices, setDevices] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topology, setTopology] = useState({ services: [], devices: [] });

  // Custom Message/Confirm Dialog States
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [alertDialog, setAlertDialog] = useState(null);
  const [toast, setToast] = useState(null);

  const topologyContainerRef = useRef(null);
  const draggingNodeRef = useRef(null);
  const lastDraggedServicePosRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const NODE_W = TOPO_NODE_W;
  const NODE_H = TOPO_NODE_H;

  // Draggable Node State
  const [draggingNode, setDraggingNode] = useState(null);
  
  // Visual Connection State (service-level quick link)
  const [drawingConnection, setDrawingConnection] = useState(null);
  /** @type {{ sourceDevice: object, startX: number, startY: number, currentX: number, currentY: number } | null} */
  const [drawingDeviceLink, setDrawingDeviceLink] = useState(null);

  // Forms & Modals
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [showDeviceForm, setShowDeviceForm] = useState(false);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  
  const [formData, setFormData] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sRes, dRes, iRes, tRes] = await Promise.all([
        api.get('/it/services'),
        api.get('/it/devices'),
        api.get('/it/issues'),
        api.get('/it/topology')
      ]);
      setServices(sRes.data);
      setDevices(dRes.data);
      setIssues(iRes.data);
      setTopology(tRes.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSaveService = async (e) => {
    e.preventDefault();
    try {
      await api.post('/it/services', formData);
      setShowServiceForm(false);
      setFormData({});
      fetchData();
    } catch (err) { setAlertDialog({ message: 'Error adding service' }); }
  };

  const handleSaveDevice = async (e) => {
    e.preventDefault();
    try {
      await api.post('/it/devices', formData);
      setShowDeviceForm(false);
      setFormData({});
      fetchData();
    } catch (err) { setAlertDialog({ message: 'Error adding device' }); }
  };

  const handleSaveIssue = async (e) => {
    e.preventDefault();
    try {
      await api.post('/it/issues', formData);
      setShowIssueForm(false);
      setFormData({});
      fetchData();
    } catch (err) { setAlertDialog({ message: 'Error reporting issue' }); }
  };

  const handleDeleteService = (id) => {
    setConfirmDialog({
      message: 'Are you sure you want to delete this service? All associated devices will remain but will be unlinked from this service.',
      onConfirm: async () => {
        try {
          await api.delete(`/it/services/${id}`);
          fetchData();
        } catch (err) { setAlertDialog({ message: 'Error deleting service' }); }
      }
    });
  };

  const handleCreateConnection = async (e) => {
    e.preventDefault();
    const { device_a_id, device_b_id } = formData;
    if (!device_a_id || !device_b_id) return setAlertDialog({ message: 'Select both devices' });
    if (device_a_id === device_b_id) return setAlertDialog({ message: 'Cannot connect device to itself' });

    try {
      const devA = devices.find(d => d.id === parseInt(device_a_id));
      await api.put(`/it/devices/${device_a_id}`, {
        ...devA,
        connected_to_id: parseInt(device_b_id)
      });
      setShowConnectionModal(false);
      setFormData({});
      fetchData();
    } catch (err) {
      setAlertDialog({ message: 'Error establishing connection' });
    }
  };

  const handleDisconnectDevice = (deviceId) => {
    setConfirmDialog({
      message: 'Are you sure you want to disconnect this device connection?',
      onConfirm: async () => {
        try {
          const dev = devices.find(d => d.id === deviceId);
          await api.put(`/it/devices/${deviceId}`, {
            ...dev,
            connected_to_id: null
          });
          fetchData();
        } catch (err) {
          setAlertDialog({ message: 'Error disconnecting device' });
        }
      }
    });
  };

  const resolveIssue = (id) => {
    setConfirmDialog({
      message: 'Are you sure you want to mark this issue as resolved?',
      onConfirm: async () => {
        try {
          await api.patch(`/it/issues/${id}/resolve`);
          fetchData();
        } catch (err) { setAlertDialog({ message: 'Error resolving issue' }); }
      }
    });
  };

  const deleteDevice = (id) => {
    setConfirmDialog({
      message: 'Are you sure you want to permanently delete this device from the network inventory?',
      onConfirm: async () => {
        try {
          await api.delete(`/it/devices/${id}`);
          fetchData();
        } catch (err) { setAlertDialog({ message: 'Error deleting device' }); }
      }
    });
  };

  const isDefaultMapCoord = (v) => !Number.isFinite(parseFloat(v)) || parseFloat(v) === 200;

  const isServicePlacedOnMap = (s) =>
    !isDefaultMapCoord(s.map_x) && !isDefaultMapCoord(s.map_y);

  const getServiceDisplayName = (s) =>
    (isAr ? (s.name_ar || s.name) : (s.name_fr || s.name)) || s.name;

  const showToast = (message, variant = 'info') => {
    setToast({ message, variant });
  };

  const applyServicePosition = async (serviceId, map_x, map_y) => {
    await api.patch(`/it/services/${serviceId}/position`, { map_x, map_y });
    setTopology((prev) => ({
      ...prev,
      services: prev.services.map((srv) =>
        srv.id === serviceId ? { ...srv, map_x, map_y } : srv
      ),
    }));
  };

  const getDropCoords = (e) => {
    const rect = topologyContainerRef.current?.getBoundingClientRect();
    if (!rect) return null;
    let map_x = e.clientX - rect.left - NODE_W / 2;
    let map_y = e.clientY - rect.top - 48;
    map_x = Math.max(8, Math.min(rect.width - NODE_W - 8, map_x));
    map_y = Math.max(8, Math.min(rect.height - NODE_H - 8, map_y));
    return { map_x, map_y };
  };

  const getServiceLayoutPos = (s, index) => {
    const mx = parseFloat(s.map_x);
    const my = parseFloat(s.map_y);
    const x = isDefaultMapCoord(mx) ? 50 + (index % 3) * 280 : mx;
    const y = isDefaultMapCoord(my) ? 50 + Math.floor(index / 3) * 200 : my;
    return { x, y };
  };

  // Drag service nodes: offset must be (mouse − container) − nodeTopLeft — never mix clientX with container-local x
  const handleMouseDown = (e, s, index) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = topologyContainerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const { x, y } = getServiceLayoutPos(s, index);
    draggingNodeRef.current = s;
    dragOffsetRef.current = {
      x: e.clientX - rect.left - x,
      y: e.clientY - rect.top - y,
    };
    setDraggingNode(s);
  };

  const handleConnectorMouseDown = (e, s) => {
    e.stopPropagation();
    e.preventDefault();
    const rect = topologyContainerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setDrawingConnection({
      sourceService: s,
      startX: x,
      startY: y,
      currentX: x,
      currentY: y,
    });
  };

  const handleDeviceLinkSourceMouseDown = (e, sourceDevice) => {
    e.stopPropagation();
    e.preventDefault();
    const rect = topologyContainerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setDrawingDeviceLink({
      sourceDevice,
      startX: x,
      startY: y,
      currentX: x,
      currentY: y,
    });
  };

  const handleDeviceLinkTargetMouseUp = async (_e, targetDevice) => {
    const link = drawingDeviceLink;
    if (!link || link.sourceDevice.id === targetDevice.id) return;
    const src = link.sourceDevice;
    const srcFull = devices.find((d) => d.id === src.id) || src;
    try {
      await api.put(`/it/devices/${srcFull.id}`, {
        ...srcFull,
        connected_to_id: targetDevice.id,
      });
      fetchData();
    } catch (err) {
      console.error(err);
      setAlertDialog({ message: 'Error establishing device link' });
    } finally {
      setDrawingDeviceLink(null);
    }
  };

  useEffect(() => {
    const tracking = draggingNode || drawingConnection || drawingDeviceLink;
    if (!tracking) return undefined;

    const onMove = (e) => {
      const rect = topologyContainerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const lx = e.clientX - rect.left;
      const ly = e.clientY - rect.top;

      setDrawingConnection((prev) => (prev ? { ...prev, currentX: lx, currentY: ly } : null));
      setDrawingDeviceLink((prev) => (prev ? { ...prev, currentX: lx, currentY: ly } : null));

      if (draggingNodeRef.current) {
        const o = dragOffsetRef.current;
        const id = draggingNodeRef.current.id;
        const newX = Math.max(8, Math.min(rect.width - NODE_W - 8, lx - o.x));
        const newY = Math.max(8, Math.min(rect.height - NODE_H - 8, ly - o.y));
        lastDraggedServicePosRef.current = { id, map_x: newX, map_y: newY };
        setTopology((prev) => ({
          ...prev,
          services: prev.services.map((srv) => (srv.id === id ? { ...srv, map_x: newX, map_y: newY } : srv)),
        }));
      }
    };

    const onUp = async () => {
      setDrawingConnection(null);
      setDrawingDeviceLink(null);

      if (draggingNodeRef.current) {
        const pending = lastDraggedServicePosRef.current;
        if (pending && pending.id === draggingNodeRef.current.id) {
          try {
            await api.patch(`/it/services/${pending.id}/position`, {
              map_x: pending.map_x,
              map_y: pending.map_y,
            });
          } catch (err) {
            console.error('Failed to save service position', err);
            fetchData();
          }
        }
        draggingNodeRef.current = null;
        lastDraggedServicePosRef.current = null;
        setDraggingNode(null);
      }
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [draggingNode, drawingConnection, drawingDeviceLink]);

  const handlePaletteDragStart = (e, service) => {
    e.dataTransfer.setData('application/unimanage-topology', JSON.stringify({ serviceId: service.id }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleCanvasDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleCanvasDrop = (e) => {
    e.preventDefault();
    let data;
    try {
      data = JSON.parse(e.dataTransfer.getData('application/unimanage-topology'));
    } catch {
      return;
    }
    if (!data?.serviceId) return;

    const coords = getDropCoords(e);
    if (!coords) return;

    const service = topology.services.find((s) => s.id === data.serviceId);
    if (!service) return;

    const { map_x, map_y } = coords;
    const name = getServiceDisplayName(service);
    const serviceIndex = topology.services.findIndex((s) => s.id === service.id);
    const current = getServiceLayoutPos(service, serviceIndex);
    const dist = Math.hypot(map_x - current.x, map_y - current.y);

    const runPlacement = async () => {
      try {
        await applyServicePosition(service.id, map_x, map_y);
        showToast(t('Position saved'), 'success');
      } catch (err) {
        console.error(err);
        setAlertDialog({ message: 'Error updating map position' });
      }
    };

    if (isServicePlacedOnMap(service)) {
      if (dist < 28) {
        showToast(t('Already here'), 'warning');
        return;
      }
      showToast(t('Already on map'), 'warning');
      setConfirmDialog({
        title: t('Move site title'),
        message: t('Move site message').replace('{name}', name),
        confirmLabel: t('Move'),
        cancelLabel: t('Cancel'),
        tone: 'primary',
        onConfirm: runPlacement,
      });
      return;
    }

    setConfirmDialog({
      title: t('Place site title'),
      message: t('Place site message').replace('{name}', name),
      confirmLabel: t('Place'),
      cancelLabel: t('Cancel'),
      tone: 'primary',
      onConfirm: runPlacement,
    });
  };

  const handleNodeMouseUp = (e, targetService) => {
    if (drawingConnection && drawingConnection.sourceService.id !== targetService.id) {
      // Auto-select the first router or first device for source and target
      const sourceDevices = topology.devices.filter(d => d.service_id === drawingConnection.sourceService.id);
      const targetDevices = topology.devices.filter(d => d.service_id === targetService.id);
      
      const sourceDev = sourceDevices.find(d => d.device_type === 'router') || sourceDevices[0];
      const targetDev = targetDevices.find(d => d.device_type === 'router') || targetDevices[0];
      
      if (!sourceDev || !targetDev) {
        setAlertDialog({ message: 'Both source and target services must have at least one device to establish a connection.' });
        setDrawingConnection(null);
        return;
      }
      
      setFormData({
        device_a_id: sourceDev.id.toString(),
        device_b_id: targetDev.id.toString()
      });
      setShowConnectionModal(true);
      setDrawingConnection(null);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: isAr ? 'right' : 'left' }}>
      {/* CSS Animation style for animated dashes */}
      <style>{`
        @keyframes dash-flow {
          to {
            stroke-dashoffset: -20;
          }
        }
        .glowing-network-line {
          animation: dash-flow 1.5s linear infinite;
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(12px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: isAr ? 'row-reverse' : 'row' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1a1a14', fontFamily: isAr ? "'Cairo', sans-serif" : 'inherit' }}>
            {t('IT & Network Infrastructure')}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
           {activeTab === 'topology' && (
             <button onClick={() => setShowConnectionModal(true)} style={{...btnStyle, background: '#8ea45c'}}><Link2 size={16}/> {t('Connect Nodes')}</button>
           )}
           {activeTab === 'services' && (
             <button onClick={() => setShowServiceForm(true)} style={btnStyle}><Plus size={16}/> {t('Add Service Node')}</button>
           )}
           {activeTab === 'devices' && (
             <button onClick={() => setShowDeviceForm(true)} style={btnStyle}><Plus size={16}/> {t('Add Device')}</button>
           )}
           {activeTab === 'issues' && (
             <button onClick={() => setShowIssueForm(true)} style={{...btnStyle, background: '#d45c3c'}}><AlertCircle size={16}/> {t('Report Issue')}</button>
           )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e8e2d6', paddingBottom: '16px', flexDirection: isAr ? 'row-reverse' : 'row' }}>
        <Tab btnKey="topology" active={activeTab} label={t('Topology Map')} icon={<Map size={18} />} onClick={setActiveTab} />
        <Tab btnKey="services" active={activeTab} label={t('Services & Nodes')} icon={<Server size={18} />} onClick={setActiveTab} />
        <Tab btnKey="devices" active={activeTab} label={t('Devices')} icon={<Router size={18} />} onClick={setActiveTab} />
        <Tab btnKey="issues" active={activeTab} label={t('Issues')} icon={<ShieldAlert size={18} />} onClick={setActiveTab} />
      </div>

      {/* Content */}
      {activeTab === 'topology' && (
        <>
          <style>{`
            @keyframes dash-flow { to { stroke-dashoffset: -20; } }
            .glowing-network-line { animation: dash-flow 1.5s linear infinite; }
          `}</style>
          <TopologyMap
            topology={topology}
            setTopology={setTopology}
            devices={devices}
            setDevices={setDevices}
            isAr={isAr}
            t={t}
            getServiceDisplayName={getServiceDisplayName}
            showToast={showToast}
            setConfirmDialog={setConfirmDialog}
            setAlertDialog={setAlertDialog}
          />
        </>
      )}

      {activeTab === 'services' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {services.map(s => (
            <div key={s.id} style={{ ...cardStyle, position: 'relative' }}>
              {/* Deletion Icon */}
              <button 
                onClick={() => handleDeleteService(s.id)}
                style={{ 
                  position: 'absolute', top: '16px', right: isAr ? 'auto' : '16px', left: isAr ? '16px' : 'auto',
                  background: 'none', border: 'none', color: '#d45c3c', cursor: 'pointer', opacity: 0.8 
                }}
              >
                <Trash2 size={16} />
              </button>

              <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>{isAr ? (s.name_ar || s.name) : (s.name_fr || s.name)}</div>
              <div style={{ color: '#8a7f72', fontSize: '13px', marginBottom: '16px' }}>{s.floor} - {s.room_number}</div>
              
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Badge icon={<Laptop size={14}/>} count={s.pc_count} label="PCs" />
                <Badge icon={<Printer size={14}/>} count={s.printer_count} label="Printers" />
                <Badge icon={<Router size={14}/>} count={s.network_count} label="Net" />
                {parseInt(s.open_issues) > 0 && <Badge icon={<ShieldAlert size={14}/>} count={s.open_issues} label="Issues" color="#d45c3c" bg="#fff0ed" />}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'devices' && (
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e8e2d6', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isAr ? 'right' : 'left' }}>
            <thead style={{ background: '#fefaf0', borderBottom: '1px solid #e8e2d6' }}>
              <tr>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>PC Code / MAC</th>
                <th style={thStyle}>IP Address</th>
                <th style={thStyle}>OS / Brand</th>
                <th style={thStyle}>Service</th>
                <th style={thStyle}>Connection</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {devices.map(d => (
                <tr key={d.id} style={{ borderBottom: '1px solid #f5f1ea' }}>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {d.device_type === 'pc' ? <Laptop size={16} color="#8a7f72"/> : 
                       d.device_type === 'printer' ? <Printer size={16} color="#8a7f72"/> : <Router size={16} color="#8a7f72"/>}
                      <span style={{ textTransform: 'capitalize' }}>{d.device_type}</span>
                    </div>
                  </td>
                  <td style={tdStyle}><b>{d.pc_code || d.mac_address || '-'}</b></td>
                  <td style={tdStyle}>{d.ip_address || '-'}</td>
                  <td style={tdStyle}>{d.os_version || d.brand || '-'}</td>
                  <td style={tdStyle}>{d.service_name || '-'}</td>
                  <td style={tdStyle}>
                    {d.connected_to_id ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '13px', color: '#8ea45c', fontWeight: '600' }}>→ {d.connected_to_code || d.connected_to_ip || 'Device'}</span>
                        <button onClick={() => handleDisconnectDevice(d.id)} style={{ background: 'none', border: 'none', color: '#d45c3c', cursor: 'pointer', padding: 0 }} title="Disconnect"><Unlink size={14}/></button>
                      </div>
                    ) : <span style={{ color: '#8a7f72', fontSize: '13px' }}>Standalone</span>}
                  </td>
                  <td style={tdStyle}>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600',
                      background: d.status === 'operational' ? '#e3ebd0' : '#fce4db',
                      color: d.status === 'operational' ? '#5c651f' : '#b84a2e'
                    }}>
                      {d.status}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <button onClick={() => deleteDevice(d.id)} style={{ background: 'none', border: 'none', color: '#d45c3c', cursor: 'pointer' }}><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'issues' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {issues.map(i => (
            <div key={i.id} style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ 
                  width: '40px', height: '40px', borderRadius: '8px', 
                  background: i.severity === 'critical' ? '#fce4db' : i.severity === 'high' ? '#fef0df' : '#e8e2d6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {i.status === 'resolved' ? <CheckCircle2 size={20} color="#8ea45c"/> : <AlertCircle size={20} color={i.severity === 'critical' ? '#d45c3c' : i.severity === 'high' ? '#b8631c' : '#8a7f72'}/>}
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '15px' }}>{i.pc_code || i.ip_address} ({i.device_type})</div>
                  <div style={{ fontSize: '13px', color: '#5a5248', marginTop: '4px' }}>{i.description}</div>
                  <div style={{ fontSize: '11px', color: '#8a7f72', marginTop: '6px' }}>Reported by: {i.reported_by} · Service: {i.service_name}</div>
                </div>
              </div>
              {i.status === 'open' && (
                <button onClick={() => resolveIssue(i.id)} style={{ padding: '8px 16px', background: '#e3ebd0', color: '#5c651f', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                  Resolve
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showServiceForm && (
        <Modal title="Add Service Node" onClose={() => setShowServiceForm(false)}>
          <form onSubmit={handleSaveService} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input required placeholder="Service Name (EN)" style={inputStyle} onChange={e => setFormData({...formData, name: e.target.value})} />
            <input placeholder="Service Name (AR)" style={inputStyle} onChange={e => setFormData({...formData, name_ar: e.target.value})} />
            <div style={{ display: 'flex', gap: '8px' }}>
              <input placeholder="Floor" style={inputStyle} onChange={e => setFormData({...formData, floor: e.target.value})} />
              <input placeholder="Room" style={inputStyle} onChange={e => setFormData({...formData, room_number: e.target.value})} />
            </div>
            <button type="submit" style={submitBtnStyle}>Save Service</button>
          </form>
        </Modal>
      )}

      {showDeviceForm && (
        <Modal title="Add Device" onClose={() => setShowDeviceForm(false)}>
          <form onSubmit={handleSaveDevice} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <select required style={inputStyle} onChange={e => setFormData({...formData, service_id: e.target.value})}>
              <option value="">Select Service / Node...</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select required style={inputStyle} onChange={e => setFormData({...formData, device_type: e.target.value})}>
              <option value="">Select Type...</option>
              <option value="pc">PC / Computer</option>
              <option value="printer">Printer</option>
              <option value="router">Router / Switch</option>
            </select>
            <input placeholder="PC Code / Tag" style={inputStyle} onChange={e => setFormData({...formData, pc_code: e.target.value})} />
            <input placeholder="IP Address" style={inputStyle} onChange={e => setFormData({...formData, ip_address: e.target.value})} />
            <input placeholder="Windows OS / Firmware Version" style={inputStyle} onChange={e => setFormData({...formData, os_version: e.target.value})} />
            <button type="submit" style={submitBtnStyle}>Save Device</button>
          </form>
        </Modal>
      )}

      {showConnectionModal && (
        <Modal title="Connect Devices" onClose={() => setShowConnectionModal(false)}>
          <form onSubmit={handleCreateConnection} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#8a7f72', fontWeight: '600' }}>Select Source Device</label>
              <select required style={inputStyle} onChange={e => setFormData({...formData, device_a_id: e.target.value})}>
                <option value="">Choose Device A...</option>
                {devices.map(d => <option key={d.id} value={d.id}>{d.pc_code || d.ip_address} ({d.device_type}) - {d.service_name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#8a7f72', fontWeight: '600' }}>Select Target Device</label>
              <select required style={inputStyle} onChange={e => setFormData({...formData, device_b_id: e.target.value})}>
                <option value="">Choose Device B...</option>
                {devices.map(d => <option key={d.id} value={d.id}>{d.pc_code || d.ip_address} ({d.device_type}) - {d.service_name}</option>)}
              </select>
            </div>
            <button type="submit" style={{...submitBtnStyle, background: '#8ea45c'}}>Establish Connection</button>
          </form>
        </Modal>
      )}

      {showIssueForm && (
        <Modal title="Report Issue" onClose={() => setShowIssueForm(false)}>
          <form onSubmit={handleSaveIssue} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
             <select required style={inputStyle} onChange={e => setFormData({...formData, device_id: e.target.value})}>
              <option value="">Select Faulty Device...</option>
              {devices.map(d => <option key={d.id} value={d.id}>{d.pc_code || d.ip_address} ({d.device_type})</option>)}
            </select>
            <select required style={inputStyle} onChange={e => setFormData({...formData, severity: e.target.value})}>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <textarea required placeholder="Describe the issue (e.g. No internet, Blue screen)..." style={{...inputStyle, minHeight: '80px'}} onChange={e => setFormData({...formData, description: e.target.value})} />
            <button type="submit" style={submitBtnStyle}>Submit Report</button>
          </form>
        </Modal>
      )}

      {/* Custom Alert/Confirm Dialog elements */}
      {confirmDialog && (
        <ConfirmDialog
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmLabel={confirmDialog.confirmLabel}
          cancelLabel={confirmDialog.cancelLabel}
          tone={confirmDialog.tone}
          onConfirm={async () => {
            await confirmDialog.onConfirm?.();
            setConfirmDialog(null);
          }}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
      {alertDialog && (
        <AlertDialog
          title={alertDialog.title}
          message={alertDialog.message}
          onClose={() => setAlertDialog(null)}
        />
      )}
      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onClose={() => setToast(null)}
        />
      )}

    </div>
  );
}

const Tab = ({ btnKey, active, label, icon, onClick }) => (
  <button
    onClick={() => onClick(btnKey)}
    style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '10px 16px', borderRadius: '8px',
      border: 'none', cursor: 'pointer',
      background: active === btnKey ? '#1a1a14' : 'transparent',
      color: active === btnKey ? '#fff' : '#5a5248',
      fontWeight: '600', fontSize: '14px',
      transition: 'all 0.2s'
    }}
  >
    {icon} {label}
  </button>
);

const Badge = ({ icon, count, label, color = '#5a5248', bg = '#f5f1ea' }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: bg, padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', color }}>
    {icon} {count} {label}
  </div>
);

const Modal = ({ title, onClose, children }) => (
  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
    <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '18px' }}>{title}</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>&times;</button>
      </div>
      {children}
    </div>
  </div>
);

const cardStyle = { background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e8e2d6' };
const btnStyle = { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#1a1a14', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' };
const inputStyle = { padding: '10px 14px', borderRadius: '8px', border: '1px solid #d4d0c5', fontSize: '14px', width: '100%', boxSizing: 'border-box' };
const submitBtnStyle = { ...btnStyle, justifyContent: 'center', marginTop: '8px' };
const thStyle = { padding: '14px 16px', fontSize: '12px', color: '#8a7f72', textTransform: 'uppercase' };
const tdStyle = { padding: '14px 16px', fontSize: '14px', color: '#1a1a14' };
