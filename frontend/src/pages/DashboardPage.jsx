import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import {
  Users, Building2, Ticket, TrendingUp,
  AlertTriangle, ArrowUpRight, BrainCircuit
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const DASHBOARD_DICT = {
  'Operations Overview': {
    en: 'Operations Overview',
    ar: 'نظرة عامة على العمليات',
    fr: 'Aperçu des Opérations'
  },
  'Real-time data from UniManage AI backend': {
    en: 'Real-time data from UniManage AI backend',
    ar: 'بيانات مباشرة من خادم نظام UniManage AI',
    fr: 'Données en temps réel du serveur UniManage AI'
  }
};

const translateAlertMessage = (msg, lang) => {
  if (!msg) return '';
  if (lang === 'en') return msg;

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

  if (msg.includes('Housing Stock: Only')) {
    const match = msg.match(/Housing Stock:\s+Only\s+(.*?)\s+remaining at\s+(.*?)!/i);
    if (match) {
      const details = match[1];
      const loc = match[2];
      if (lang === 'ar') return `مخزون الإيواء والصيانة: متبقي (${details}) فقط في (${loc})!`;
      return `Stock Hébergement: Seulement (${details}) restant dans (${loc}) !`;
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

export default function DashboardPage() {
  const { alerts } = useOutletContext();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const lang = localStorage.getItem('lang') || 'en';
  const isAr = lang === 'ar';

  const t = (key) => {
    return DASHBOARD_DICT[key]?.[lang] || key;
  };

  useEffect(() => {
    api.get('/dashboard/overview')
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
      <div style={{
        width: '36px', height: '36px', borderRadius: '50%',
        border: '3px solid #f0ede4',
        borderTop: '3px solid #d45c3c',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const ticketData = [
    { name: 'Active', count: stats?.activeTickets || 0, fill: '#d45c3c' },
    { name: 'Resolved', count: stats?.resolvedTickets || 0, fill: '#8ea45c' },
  ];

  const studentPieData = (stats?.chartStudents || []).map(s => ({
    name: s.name,
    value: parseInt(s.value)
  }));

  const blocBarData = stats?.chartRooms || [];

  const occupancy = parseFloat(stats?.occupancyRate || 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: isAr ? 'right' : 'left' }}>

      {/* Page header */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: isAr ? 'flex-end' : 'flex-start' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#1a1a14', marginBottom: '4px', fontFamily: isAr ? "'Cairo', sans-serif" : 'inherit' }}>
          {t('Operations Overview')}
        </h1>
        <p style={{ color: '#8a7f72', fontSize: '13px', fontFamily: isAr ? "'Cairo', sans-serif" : 'inherit' }}>
          {t('Real-time data from UniManage AI backend')} · {new Date().toLocaleDateString(lang === 'ar' ? 'ar-DZ' : 'fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Alerts */}
      {alerts?.length > 0 && (
        <div style={{ 
          display: 'flex', flexDirection: 'column', gap: '6px',
          maxHeight: '180px', overflowY: 'auto', 
          paddingRight: isAr ? '0' : '6px', paddingLeft: isAr ? '6px' : '0'
        }}>
          {alerts.map((a, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 12px', borderRadius: '8px',
              background: a.type === 'danger' ? '#fff0ed' : '#fefaf0',
              border: `1px solid ${a.type === 'danger' ? '#f8c7b4' : '#f0dba0'}`,
              flexDirection: isAr ? 'row-reverse' : 'row'
            }}>
              <div style={{
                width: '24px', height: '24px', borderRadius: '6px',
                background: a.type === 'danger' ? '#fce4db' : '#fef0df',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <AlertTriangle size={14} style={{ color: a.type === 'danger' ? '#d45c3c' : '#b8631c' }} />
              </div>
              <span style={{ 
                fontSize: '12px', fontWeight: '600', color: a.type === 'danger' ? '#7a2f1e' : '#5e3110',
                fontFamily: isAr ? "'Cairo', sans-serif" : 'inherit',
                textAlign: isAr ? 'right' : 'left',
                width: '100%'
              }}>
                {translateAlertMessage(a.message, lang)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <KPICard
          label="Total Students" labelAr="إجمالي الطلبة"
          value={stats?.students ?? 0}
          icon={<Users size={20} />}
          iconBg="#fce4db" iconColor="#d45c3c"
          trend="Active enrollments"
          trendColor="#8ea45c"
        />
        <KPICard
          label="Total Rooms" labelAr="إجمالي الغرف"
          value={stats?.rooms ?? 0}
          icon={<Building2 size={20} />}
          iconBg="#e3ebd0" iconColor="#5c651f"
          trend="Across all blocs"
          trendColor="#5c651f"
        />
        <KPICard
          label="Occupancy Rate" labelAr="نسبة الإشغال"
          value={`${occupancy}%`}
          icon={<TrendingUp size={20} />}
          iconBg={occupancy >= 95 ? '#fce4db' : '#fef0df'}
          iconColor={occupancy >= 95 ? '#d45c3c' : '#b8631c'}
          trend={occupancy >= 95 ? '⚠ Critical level' : 'Live metric'}
          trendColor={occupancy >= 95 ? '#d45c3c' : '#8ea45c'}
        />
        <KPICard
          label="Active Tickets" labelAr="التذاكر النشطة"
          value={stats?.activeTickets ?? 0}
          icon={<Ticket size={20} />}
          iconBg="#fce4db" iconColor="#b84a2e"
          trend={`${stats?.resolvedTickets ?? 0} resolved`}
          trendColor="#8ea45c"
        />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>

        {/* Chart 1: Room Capacity by Bloc */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <div>
              <div style={cardTitleStyle}>Rooms by Bloc</div>
              <div style={cardSubStyle}>Total vs Fully Occupied</div>
            </div>
          </div>
          <div style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={blocBarData} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0ede4" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8a7f72', fontSize: 12, fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8a7f72', fontSize: 12 }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', fontSize: '13px' }} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#8a7f72', paddingTop: '8px' }} iconType="circle" iconSize={8} />
                <Bar dataKey="Total" fill="#e3ebd0" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Full" fill="#d45c3c" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Student Levels */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <div>
              <div style={cardTitleStyle}>Student Demographics</div>
              <div style={cardSubStyle}>Distribution by Study Level</div>
            </div>
          </div>
          <div style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={studentPieData} cx="50%" cy="45%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {studentPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#d45c3c', '#8ea45c', '#b8631c', '#e07e27', '#5c651f', '#f6b371'][index % 6]} />
                  ))}
                </Pie>
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', color: '#8a7f72', paddingTop: '0px' }} />
                <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', fontSize: '13px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Maintenance Tickets */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <div>
              <div style={cardTitleStyle}>Maintenance Tickets</div>
              <div style={cardSubStyle}>Active vs Resolved ratio</div>
            </div>
          </div>
          <div style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ticketData} barSize={46}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0ede4" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8a7f72', fontSize: 13, fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8a7f72', fontSize: 12 }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', fontSize: '13px' }} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {ticketData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* AI Insights Banner */}
      <div style={{
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #1a1e0f 0%, #2a3018 60%, #1c1a0c 100%)',
        padding: '28px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* BG logo watermark */}
        <img src="/logo.png" alt="" style={{
          position: 'absolute', right: '-30px', top: '50%',
          transform: 'translateY(-50%)',
          width: '160px', height: '160px', objectFit: 'contain',
          opacity: 0.05, filter: 'blur(3px)', pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', zIndex: 1 }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px',
            background: 'rgba(212,92,60,0.2)',
            border: '1px solid rgba(212,92,60,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <BrainCircuit size={24} style={{ color: '#f6b371' }} />
          </div>
          <div>
            <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>
              AI Operations Analyst
            </div>
            <div style={{ color: 'rgba(180,210,140,0.7)', fontSize: '13px' }}>
              Generate risk analysis and administrative recommendations from live database metrics
            </div>
          </div>
        </div>
        <Link
          to="/ai-insights"
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px 24px', borderRadius: '10px',
            background: '#d45c3c',
            color: '#fff', fontSize: '13px', fontWeight: '700',
            textDecoration: 'none',
            boxShadow: '0 4px 16px rgba(212,92,60,0.4)',
            flexShrink: 0, zIndex: 1,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#b84a2e'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#d45c3c'; e.currentTarget.style.transform = 'none'; }}
        >
          Launch AI Insights
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </div>
  );
}

// ── Shared styles ────────────────────────────────────────────────────────────
const cardStyle = {
  background: '#ffffff',
  borderRadius: '16px',
  border: '1px solid #e8e2d6',
  padding: '24px',
  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
};
const cardHeaderStyle = {
  display: 'flex', alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '20px',
};
const cardTitleStyle = { fontSize: '15px', fontWeight: '700', color: '#1a1a14' };
const cardSubStyle = { fontSize: '12px', color: '#8a7f72', marginTop: '2px' };

// ── KPI Card ────────────────────────────────────────────────────────────────
function KPICard({ label, labelAr, value, icon, iconBg, iconColor, trend, trendColor }) {
  return (
    <div style={{
      background: '#ffffff', borderRadius: '16px',
      border: '1px solid #e8e2d6', padding: '22px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
      transition: 'box-shadow 0.2s, transform 0.2s',
      cursor: 'default',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'none'; }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '12px',
          background: iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: iconColor,
        }}>
          {icon}
        </div>
        <span style={{
          fontSize: '10px', fontWeight: '700', letterSpacing: '0.5px',
          color: '#c4bfb5', textTransform: 'uppercase',
          padding: '3px 8px', background: '#f5f1ea',
          borderRadius: '5px',
        }}>
          LIVE
        </span>
      </div>
      <div style={{ fontSize: '32px', fontWeight: '800', color: '#1a1a14', lineHeight: '1', marginBottom: '6px' }}>
        {value}
      </div>
      <div style={{ fontSize: '13px', fontWeight: '600', color: '#5a5248', marginBottom: '4px' }}>
        {label}
      </div>
      <div style={{ fontSize: '11px', color: '#c4bfb5', direction: 'rtl', textAlign: 'right', marginBottom: '4px' }}>
        {labelAr}
      </div>
      <div style={{ fontSize: '11px', color: trendColor, fontWeight: '500' }}>
        {trend}
      </div>
    </div>
  );
}
