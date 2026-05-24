import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Building2, Wrench,
  FileSpreadsheet, BrainCircuit, LogOut, Bell, ChevronRight, X, Settings, ChefHat, Bed, Network
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import api from '../api/axios';
import { ConfirmDialog } from '../components/CustomDialogs';
const stripApi = (url) => (url || '').replace(/\/api\/?$/, '');
const API_ORIGIN = stripApi(api.defaults.baseURL);

const navigation = [
  { name: 'Dashboard',   nameAr: 'لوحة التحكم',    href: '/dashboard',   icon: LayoutDashboard },
  { name: 'Students',    nameAr: 'الطلبة',          href: '/students',    icon: Users },
  { name: 'Rooms',       nameAr: 'الغرف',           href: '/rooms',       icon: Building2 },
  { name: 'Tickets',     nameAr: 'التذاكر',         href: '/tickets',     icon: Wrench },
  { name: 'Excel Tools', nameAr: 'أدوات Excel',     href: '/excel',       icon: FileSpreadsheet },
  { name: 'AI Insights', nameAr: 'تحليلات الذكاء',  href: '/ai-insights', icon: BrainCircuit },
  { name: 'Catering Stock', nameAr: 'مخزن الإطعام',   href: '/catering',    icon: ChefHat },
  { name: 'Housing Stock',  nameAr: 'الإيواء والصيانة', href: '/housing',     icon: Bed },
  { name: 'IT & Network',   nameAr: 'الشبكة والأنظمة',    href: '/network',     icon: Network },
  { name: 'Settings',    nameAr: 'الإعدادات',       href: '/settings',    icon: Settings },
];

const FRENCH_DICT = {
  'Dashboard': 'Tableau de bord',
  'Students': 'Étudiants',
  'Rooms': 'Chambres',
  'Tickets': 'Tickets de maintenance',
  'Excel Tools': 'Outils Excel',
  'AI Insights': 'Analyses IA',
  'Catering Stock': "Stock d'Épicerie",
  'Housing Stock': "Stock d'Hébergement",
  'IT & Network': "Réseau et Systèmes",
  'Settings': 'Paramètres',
  'Navigation': 'Navigation',
  'Sign Out': 'Déconnexion',
  'System Alerts': 'Alertes Système',
  'Live operational notifications': 'Notifications opérationnelles en direct',
  'All Systems Normal': 'Tous les systèmes normaux',
  'No active alerts at this time': 'Aucune alerte active pour le moment',
  '🔴 Critical': '🔴 Critique',
  '🟡 Warning': '🟡 Avertissement',
  '↻ Refreshing...': '↻ Actualisation...',
  '↻ Refresh alerts': '↻ Actualiser les alertes',
  'admin': 'Administrateur',
  'director': 'Directeur',
  'admissions': 'Service Admissions',
  'maintenance': 'Service Maintenance'
};

const translateAlertMessage = (msg, lang) => {
  if (lang === 'en') return msg;
  
  if (msg.includes('Housing Stock: Only')) {
    const match = msg.match(/Housing Stock:\s+Only\s+(.*?)\s+remaining at\s+(.*?)!/i);
    if (match) {
      const details = match[1];
      const loc = match[2];
      if (lang === 'ar') return `مخزون الإيواء والصيانة: متبقي (${details}) فقط في (${loc})!`;
      return `Stock Hébergement: Seulement (${details}) restant dans (${loc}) !`;
    }
  }

  if (msg.includes('Capacity nearing 100%')) {
    if (lang === 'ar') return 'قرب اكتمال القدرة الاستيعابية بنسبة 100٪ - يرجى النظر في إعادة توزيع الغرف';
    return "Capacité proche de 100% - envisagez une redistribution des chambres";
  }
  
  if (msg.includes('Spike in maintenance tickets')) {
    if (lang === 'ar') return 'ارتفاع مفاجئ في تذاكر الصيانة خلال الـ 24 ساعة الماضية';
    return "Augmentation soudaine des tickets de maintenance au cours des dernières 24 heures";
  }
  
  if (msg.includes('unresolved maintenance issues')) {
    const match = msg.match(/Building\s+([A-Za-z0-9_-]+):\s+(\d+)\s+unresolved/i);
    if (match) {
      const b = match[1];
      const count = match[2];
      if (lang === 'ar') return `المبنى ${b}: يوجد ${count} مشاكل صيانة غير محلولة`;
      return `Bâtiment ${b}: ${count} problèmes de maintenance non résolus`;
    }
  }
  
  if (msg.includes('Food Safety: Perished batch of')) {
    const match = msg.match(/Food Safety:\s+Perished batch of\s+(.*?)\s+detected at\s+(.*?)!/i);
    if (match) {
      const name = match[1];
      const loc = match[2];
      if (lang === 'ar') return `تنبيه سلامة الغذاء: تم رصد دفعة تالفة من (${name}) في (${loc})!`;
      return `Alerte Sécurité: Lot périmé de (${name}) détecté dans (${loc}) !`;
    }
  }
  
  if (msg.includes('Food Expiry:')) {
    const match = msg.match(/Food Expiry:\s+(.*?)\s+at\s+(.*?)\s+expires in\s+(\d+)\s+days!/i);
    if (match) {
      const name = match[1];
      const loc = match[2];
      const days = match[3];
      if (lang === 'ar') return `تاريخ الصلاحية: ينتهي (${name}) في (${loc}) خلال ${days} أيام!`;
      return `Expiration Denrée: (${name}) dans (${loc}) expire dans ${days} jours !`;
    }
  }
  
  if (msg.includes('Low Stock: Only')) {
    const match = msg.match(/Low Stock:\s+Only\s+(.*?)\s+left at\s+(.*?)!/i);
    if (match) {
      const details = match[1];
      const loc = match[2];
      if (lang === 'ar') return `انخفاض المخزون: متبقي (${details}) فقط في (${loc})!`;
      return `Stock Faible: Seulement (${details}) restant dans (${loc}) !`;
    }
  }
  
  if (msg.includes('Overcapacity Warning:')) {
    const match = msg.match(/Room\s+([A-Za-z0-9_-]+)-([A-Za-z0-9_-]+)\s+exceeds its capacity of\s+(\d+)/i);
    if (match) {
      const b = match[1];
      const r = match[2];
      const cap = match[3];
      if (lang === 'ar') return `تنبيه الحمولة الزائدة: الغرفة ${b}-${r} تتجاوز قدرتها الاستيعابية البالغة ${cap}!`;
      return `Alerte Surcharge: La chambre ${b}-${r} dépasse sa capacité de ${cap} lits !`;
    }
  }
  
  if (msg.includes('Critical Issue:')) {
    const match = msg.match(/Room\s+([A-Za-z0-9_-]+)-([A-Za-z0-9_-]+)\s+needs\s+(.*?)\s+-\s+"(.*?)"/i);
    if (match) {
      const b = match[1];
      const r = match[2];
      const type = match[3];
      const desc = match[4];
      if (lang === 'ar') return `مشكلة حرجة: الغرفة ${b}-${r} تحتاج إلى ${type} - "${desc}"`;
      return `Incident Critique: La chambre ${b}-${r} nécessite ${type} - "${desc}"`;
    }
  }

  return msg;
};

export default function AdminLayout() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const [user, setUser]         = useState(null);
  const [alerts, setAlerts]     = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAlerts, setShowAlerts] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [lang, setLang]         = useState('en');
  const bellRef = useRef(null);

  const isAr = lang === 'ar';

  useEffect(() => {
    const saved = localStorage.getItem('lang');
    if (saved) setLang(saved);
  }, []);
  const t = (en, ar) => {
    if (lang === 'ar') return ar;
    if (lang === 'fr') return FRENCH_DICT[en] || en;
    return en;
  };

  useEffect(() => {
    const handleProfileUpdateEvent = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        try { setUser(JSON.parse(userData)); } catch (e) { console.error('Failed to parse user data:', e); }
      }
    };

    window.addEventListener('userProfileUpdated', handleProfileUpdateEvent);

    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const u = JSON.parse(userData);
        setUser(u);
        
        // RBAC Page Guarding
        const path = location.pathname;
        if (u.role === 'admissions' && !path.startsWith('/students') && !path.startsWith('/rooms')) {
          navigate('/students');
        } else if (u.role === 'maintenance' && !path.startsWith('/tickets') && !path.startsWith('/housing')) {
          navigate('/tickets');
        }
      } catch (e) { console.error('Failed to parse user:', e); }
    } else {
      navigate('/login');
    }
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60_000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('userProfileUpdated', handleProfileUpdateEvent);
    };
  }, [location.pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setShowAlerts(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchAlerts = () => {
    setIsRefreshing(true);
    api.get('/dashboard/alerts')
      .then(res => {
        setAlerts(res.data);
        if (!showAlerts) {
          setUnreadCount(res.data.length);
        } else {
          setUnreadCount(0);
        }
      })
      .catch(e => console.error('Failed to fetch alerts:', e))
      .finally(() => setIsRefreshing(false));
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Sign out log request failed:', err);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const [securityUpdateTrigger, setSecurityUpdateTrigger] = useState(0);

  useEffect(() => {
    const handleSecurityUpdate = () => {
      setSecurityUpdateTrigger(prev => prev + 1);
    };
    window.addEventListener('securitySettingsUpdated', handleSecurityUpdate);
    return () => {
      window.removeEventListener('securitySettingsUpdated', handleSecurityUpdate);
    };
  }, []);

  useEffect(() => {
    const inactivityTimeoutRaw = localStorage.getItem('inactivity_timeout');
    const timeoutMins = parseInt(inactivityTimeoutRaw === null ? '3' : inactivityTimeoutRaw, 10);

    if (isNaN(timeoutMins) || timeoutMins <= 0) {
      return;
    }

    const timeoutMs = timeoutMins * 60 * 1000;
    let timer;

    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        localStorage.setItem('logout_reason', 'inactivity');
        handleLogout();
      }, timeoutMs);
    };

    resetTimer();

    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    return () => {
      if (timer) clearTimeout(timer);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [securityUpdateTrigger, location.pathname]);

  const allowedNavigation = navigation.filter(item => {
    if (!user) return false;
    if (user.role === 'director' || user.role === 'admin') return true;
    if (user.role === 'admissions') {
      return item.href === '/students' || item.href === '/rooms';
    }
    if (user.role === 'maintenance') {
      return item.href === '/tickets' || item.href === '/housing';
    }
    return false;
  });

  const currentPage = navigation.find(n => location.pathname.startsWith(n.href));

  return (
    <div 
      dir="ltr"
      style={{ minHeight: '100vh', display: 'flex', background: '#f0ede4', fontFamily: "'Cairo', 'Inter', system-ui, sans-serif" }}
    >

      {/* ═══════════ SIDEBAR ═══════════ */}
      <aside style={{
        width: '248px',
        background: 'linear-gradient(180deg, #1a1e0f 0%, #1f2410 60%, #1c1a0c 100%)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, height: '100vh',
        zIndex: 30, boxShadow: '4px 0 24px rgba(0,0,0,0.25)',
      }}>
        {/* Logo */}
        <div style={{
          padding: '0 20px', height: '72px',
          display: 'flex', alignItems: 'center', gap: '12px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(0,0,0,0.2)', flexShrink: 0,
        }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '12px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', flexShrink: 0,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}>
            <img src="/logo.png" alt="Logo" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: '#ffffff', fontWeight: '700', fontSize: '13px', lineHeight: '1.2' }}>UniManage AI</div>
            <div style={{ color: 'rgba(180,210,140,0.7)', fontSize: '10px', marginTop: '2px' }}>جامعة البليدة 2</div>
          </div>
        </div>

        {/* Nav label */}
        <div style={{ padding: '20px 20px 8px', flexShrink: 0, textAlign: 'left' }}>
          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px', fontWeight: '700', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
            {t('Navigation', 'التنقل')}
          </span>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '0 12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {allowedNavigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link key={item.name} to={item.href} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 12px', borderRadius: '10px',
                textDecoration: 'none', transition: 'all 0.15s ease',
                background: isActive ? 'rgba(212,92,60,0.2)' : 'transparent',
                border: isActive ? '1px solid rgba(212,92,60,0.3)' : '1px solid transparent',
                position: 'relative',
                flexDirection: 'row'
              }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                {isActive && (
                  <div style={{
                    position: 'absolute', 
                    left: 0, 
                    right: 'auto', 
                    top: '50%', transform: 'translateY(-50%)',
                    width: '3px', height: '60%', background: '#d45c3c', borderRadius: '0 3px 3px 0',
                  }} />
                )}
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: isActive ? 'rgba(212,92,60,0.25)' : 'rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <item.icon size={16} style={{ color: isActive ? '#f6b371' : 'rgba(255,255,255,0.4)' }} />
                </div>
                <div style={{ minWidth: 0, flex: 1, textAlign: 'left' }}>
                  <div style={{ color: isActive ? '#ffffff' : 'rgba(255,255,255,0.55)', fontSize: '13px', fontWeight: isActive ? '600' : '400', lineHeight: '1.2' }}>
                    {t(item.name, item.nameAr)}
                  </div>
                  <div style={{ color: isActive ? 'rgba(246,179,113,0.7)' : 'rgba(255,255,255,0.2)', fontSize: '10px', marginTop: '1px' }}>
                    {t(item.nameAr, item.name)}
                  </div>
                </div>
                {isActive && <ChevronRight size={14} style={{ color: 'rgba(212,92,60,0.6)', flexShrink: 0, transform: 'none' }} />}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', marginBottom: '6px', flexDirection: 'row' }}>
            {user?.avatar ? (
              <img 
                src={`${API_ORIGIN}${user.avatar}`} 
                alt="Avatar" 
                style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} 
              />
            ) : (
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'linear-gradient(135deg, #d45c3c, #f6b371)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: '700', color: '#fff', flexShrink: 0,
              }}>
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
            )}
            <div style={{ minWidth: 0, flex: 1, textAlign: 'left' }}>
              <div style={{ color: '#ffffff', fontSize: '12px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name || 'Admin'}
              </div>
              <div style={{ color: '#d45c3c', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {t(user?.role || 'admin', user?.role === 'director' ? 'المدير' : user?.role === 'admissions' ? 'القبول والتسجيل' : 'الصيانة')}
              </div>
            </div>
          </div>
          <button onClick={() => setShowLogoutConfirm(true)} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '9px 12px', borderRadius: '10px',
            width: '100%', background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.3)', fontSize: '13px', transition: 'all 0.15s',
            flexDirection: 'row',
            justifyContent: 'flex-start'
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,92,60,0.1)'; e.currentTarget.style.color = '#ff9980'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; }}
          >
            <LogOut size={15} style={{ transform: 'none' }} /> <span>{t('Sign Out', 'تسجيل الخروج')}</span>
          </button>
        </div>
      </aside>

      {/* ═══════════ MAIN ═══════════ */}
      <div style={{ flex: 1, marginLeft: '248px', marginRight: 0, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* TOPBAR */}
        <header style={{
          height: '72px', background: '#ffffff',
          borderBottom: '1px solid #e8e2d6',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 32px', position: 'sticky', top: 0, zIndex: 20,
          boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
          flexDirection: 'row'
        }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexDirection: 'row' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#d45c3c' }} />
            <span style={{ color: '#6b6456', fontSize: '12px', fontWeight: '500' }}>{t('UniManage AI', 'نظام إدارة الإقامة')}</span>
            <ChevronRight size={14} style={{ color: '#c4bfb5', transform: 'none' }} />
            <span style={{ color: '#1a1a14', fontSize: '14px', fontWeight: '700' }}>
              {currentPage ? t(currentPage.name, currentPage.nameAr) : t('Dashboard', 'لوحة التحكم')}
            </span>
          </div>

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexDirection: 'row' }}>

            {/* ── Bell + Alert Dropdown ── */}
            <div ref={bellRef} style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  setShowAlerts(v => !v);
                  if (!showAlerts) setUnreadCount(0);
                }}
                style={{
                  width: '38px', height: '38px', borderRadius: '10px',
                  background: showAlerts ? '#fce4db' : '#f5f1ea',
                  border: showAlerts ? '1px solid #f8c7b4' : '1px solid #e8e2d6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'all 0.15s', position: 'relative',
                }}
              >
                <Bell size={17} style={{ color: showAlerts ? '#d45c3c' : '#6b6456' }} />
                {unreadCount > 0 && (
                  <div style={{
                    position: 'absolute', top: '-4px', right: '-4px',
                    minWidth: '18px', height: '18px', borderRadius: '9px',
                    background: '#d45c3c', border: '2px solid #fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '10px', fontWeight: '800', color: '#fff', padding: '0 3px',
                  }}>
                    {unreadCount}
                  </div>
                )}
              </button>

              {/* Dropdown */}
              {showAlerts && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 10px)', 
                  right: 0,
                  left: 'auto',
                  width: '340px', background: '#ffffff',
                  borderRadius: '14px', border: '1px solid #e8e2d6',
                  boxShadow: '0 16px 48px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)',
                  zIndex: 100, overflow: 'hidden',
                  textAlign: 'left'
                }}>
                  {/* Header */}
                  <div style={{ padding: '14px 18px', borderBottom: '1px solid #f5f1ea', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#1a1a14' }}>{t('System Alerts', 'تنبيهات النظام')}</div>
                      <div style={{ fontSize: '11px', color: '#8a7f72' }}>{t('Live operational notifications', 'إشعارات العمليات المباشرة')}</div>
                    </div>
                    <button onClick={() => setShowAlerts(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8a7f72', padding: '4px', borderRadius: '6px' }}>
                      <X size={16} />
                    </button>
                  </div>

                  {/* Alert list */}
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {alerts.length === 0 ? (
                      <div style={{ padding: '32px 18px', textAlign: 'center' }}>
                        <div style={{ fontSize: '28px', marginBottom: '8px' }}>✅</div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#5c651f' }}>{t('All Systems Normal', 'جميع الأنظمة طبيعية')}</div>
                        <div style={{ fontSize: '12px', color: '#8a7f72', marginTop: '4px' }}>{t('No active alerts at this time', 'لا توجد تنبيهات نشطة حالياً')}</div>
                      </div>
                    ) : (
                      alerts.map((a, i) => (
                        <div key={i} style={{
                          padding: '14px 18px',
                          borderBottom: i < alerts.length - 1 ? '1px solid #f5f1ea' : 'none',
                          display: 'flex', gap: '12px', alignItems: 'flex-start',
                          flexDirection: 'row'
                        }}>
                          <div style={{
                            width: '8px', height: '8px', borderRadius: '50%', marginTop: '5px', flexShrink: 0,
                            background: a.type === 'danger' ? '#d45c3c' : '#e07e27',
                            boxShadow: `0 0 6px ${a.type === 'danger' ? 'rgba(212,92,60,0.4)' : 'rgba(224,126,39,0.4)'}`,
                          }} />
                          <div style={{ textAlign: lang === 'ar' ? 'right' : 'left', flex: 1 }}>
                            <div style={{ fontSize: '13px', color: '#1a1a14', fontWeight: '500', lineHeight: '1.4', fontFamily: lang === 'ar' ? 'Cairo' : 'inherit' }}>
                              {translateAlertMessage(a.message, lang)}
                            </div>
                            <div style={{ fontSize: '11px', color: '#8a7f72', marginTop: '3px', textTransform: 'capitalize' }}>
                              {a.type === 'danger' ? t('🔴 Critical', '🔴 خطير') : t('🟡 Warning', '🟡 تحذير')}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  <div style={{ padding: '10px 18px', borderTop: '1px solid #f5f1ea', background: '#fafaf7', textAlign: 'left' }}>
                    <button
                      onClick={fetchAlerts}
                      disabled={isRefreshing}
                      style={{ background: 'none', border: 'none', cursor: isRefreshing ? 'wait' : 'pointer', fontSize: '12px', color: '#d45c3c', fontWeight: '600', opacity: isRefreshing ? 0.6 : 1 }}
                    >
                      {isRefreshing ? t('↻ Refreshing...', '↻ جاري التحديث...') : t('↻ Refresh alerts', '↻ تحديث التنبيهات')}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div style={{ width: '1px', height: '32px', background: '#e8e2d6' }} />

            {/* User */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexDirection: 'row' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#1a1a14', fontSize: '13px', fontWeight: '700', lineHeight: '1.2' }}>{user?.name || 'Admin'}</div>
                <div style={{ color: '#d45c3c', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {t(user?.role || 'admin', user?.role === 'director' ? 'المدير' : user?.role === 'admissions' ? 'القبول والتسجيل' : 'الصيانة')}
                </div>
              </div>
            {user?.avatar ? (
              <img 
                src={`${API_ORIGIN}${user.avatar}`} 
                alt="Avatar" 
                style={{
                  width: '38px', height: '38px', borderRadius: '10px', 
                  objectFit: 'cover',
                  boxShadow: '0 3px 10px rgba(212,92,60,0.3)'
                }} 
              />
            ) : (
              <div style={{
                width: '38px', height: '38px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #d45c3c, #f6b371)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '15px', fontWeight: '800', color: '#fff',
                boxShadow: '0 3px 10px rgba(212,92,60,0.3)',
              }}>
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
            )}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main style={{ flex: 1, padding: '32px', overflowY: 'auto', textAlign: 'left' }}>
          <Outlet context={{ alerts, refetchAlerts: fetchAlerts }} />
        </main>
      </div>

      {showLogoutConfirm && (
        <ConfirmDialog
          title={t('Sign Out?', 'تسجيل الخروج؟')}
          message={t('Are you sure you want to sign out of UniManage AI?', 'هل أنت متأكد من رغبتك في تسجيل الخروج من نظام إدارة الإقامة؟')}
          confirmLabel={t('Sign Out', 'تسجيل الخروج')}
          cancelLabel={t('Cancel', 'إلغاء')}
          tone="destructive"
          onConfirm={async () => {
            setShowLogoutConfirm(false);
            await handleLogout();
          }}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </div>
  );
}
