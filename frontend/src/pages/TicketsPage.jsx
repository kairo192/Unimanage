import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { ConfirmDialog, AlertDialog } from '../components/CustomDialogs';
import { Wrench, Filter, X, Trash2 } from 'lucide-react';

const T = {
  en: {
    title: 'Maintenance Tickets', all: 'All', pending: 'Pending', inProgress: 'In Progress', resolved: 'Resolved',
    loading: 'Loading tickets...', empty: 'No tickets found for this filter.',
    room: 'Room', roomLabel: 'Room:', delete: 'Delete ticket', ticket: 'Ticket', type: 'Type', status: 'Status',
    student: 'Student', description: 'Description', image: 'Attached Image',
    noDesc: 'No description provided.',
    updateFail: 'Failed to update ticket status.', deleteFail: 'Failed to delete ticket.',
  },
  ar: {
    title: 'تذاكر الصيانة', all: 'الكل', pending: 'قيد الانتظار', inProgress: 'قيد التنفيذ', resolved: 'تم الحل',
    loading: 'جاري تحميل التذاكر...', empty: 'لا توجد تذاكر تطابق هذا الفلتر.',
    room: 'الغرفة', roomLabel: 'الغرفة:', delete: 'حذف التذكرة', ticket: 'تذكرة', type: 'النوع', status: 'الحالة',
    student: 'الطالب', description: 'الوصف', image: 'الصورة المرفقة',
    noDesc: 'لا يوجد وصف.',
    updateFail: 'فشل تحديث حالة التذكرة.', deleteFail: 'فشل حذف التذكرة.',
  },
  fr: {
    title: 'Tickets de Maintenance', all: 'Tous', pending: 'En attente', inProgress: 'En cours', resolved: 'Résolu',
    loading: 'Chargement des tickets...', empty: 'Aucun ticket trouvé pour ce filtre.',
    room: 'Chambre', roomLabel: 'Chambre :', delete: 'Supprimer le ticket', ticket: 'Ticket', type: 'Type', status: 'Statut',
    student: 'Étudiant', description: 'Description', image: 'Image jointe',
    noDesc: 'Aucune description fournie.',
    updateFail: 'Échec de la mise à jour du statut.', deleteFail: 'Échec de la suppression du ticket.',
  },
};

const PRIORITY_STYLE = {
  high:   { bg: '#fce4db', color: '#b84a2e', border: '#f8c7b4', dot: '#d45c3c' },
  medium: { bg: '#fef0df', color: '#b8631c', border: '#fddeba', dot: '#e07e27' },
  low:    { bg: '#f4f6ec', color: '#5c651f', border: '#c7d6a2', dot: '#8ea45c' },
};
const STATUS_STYLE = {
  resolved:    { bg: '#f4f6ec', color: '#5c651f' },
  in_progress: { bg: '#fef0df', color: '#b8631c' },
  pending:     { bg: '#f5f1ea', color: '#7a7860' },
};

const stripApi = (url) => (url || '').replace(/\/api\/?$/, '');
const API_ORIGIN = stripApi(api.defaults.baseURL);

export default function TicketsPage() {
  const [lang] = useState(() => localStorage.getItem('lang') || 'en');
  const t = T[lang] || T.en;
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertDialog, setAlertDialog] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchTickets = () => {
    api.get('/tickets')
      .then(res => setTickets(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTickets(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/tickets/${id}/status`, { status });
      fetchTickets();
    } catch (err) { 
      const msg = err?.response?.data?.error || t.updateFail;
      setAlertDialog({ message: msg });
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/tickets/${id}`);
      fetchTickets();
    } catch (err) {
      const msg = err?.response?.data?.error || t.deleteFail;
      setAlertDialog({ message: msg });
    }
  };

  const filtered = filter === 'all' ? tickets : tickets.filter(t => t.status === filter);

  const counts = {
    all: tickets.length,
    pending: tickets.filter(t => t.status === 'pending').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#1a1a14', marginBottom: '4px' }}>{t.title}</h1>
          <p style={{ color: '#8a7f72', fontSize: '13px' }}>{T.ar.title} · {T.fr.title}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', background: '#ffffff', padding: '6px', borderRadius: '12px', border: '1px solid #e8e2d6', width: 'fit-content' }}>
        {[
          { key: 'all', label: t.all },
          { key: 'pending', label: t.pending },
          { key: 'in_progress', label: t.inProgress },
          { key: 'resolved', label: t.resolved },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              padding: '7px 16px', borderRadius: '8px',
              border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
              transition: 'all 0.15s',
              background: filter === tab.key ? '#1a1e0f' : 'transparent',
              color: filter === tab.key ? '#ffffff' : '#8a7f72',
            }}
          >
            {tab.label}
            <span style={{
              marginLeft: '6px',
              padding: '2px 6px', borderRadius: '10px',
              fontSize: '11px', fontWeight: '700',
              background: filter === tab.key ? 'rgba(255,255,255,0.15)' : '#f5f1ea',
              color: filter === tab.key ? '#f6b371' : '#8a7f72',
            }}>
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '48px', textAlign: 'center', color: '#8a7f72' }}>{t.loading}</div>
      ) : filtered.length === 0 ? (
        <div style={{
          padding: '48px', textAlign: 'center', color: '#8a7f72',
          background: '#fff', borderRadius: '16px', border: '1px solid #e8e2d6',
        }}>
          {t.empty}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map(ticket => {
            const p = PRIORITY_STYLE[ticket.priority] || PRIORITY_STYLE.low;
            const s = STATUS_STYLE[ticket.status] || STATUS_STYLE.pending;
            const hasImage = !!ticket.image_url;
            const stLabel = ticket.status === 'pending' ? t.pending : ticket.status === 'in_progress' ? t.inProgress : t.resolved;
            return (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                style={{
                  background: '#ffffff', borderRadius: '14px',
                  border: '1px solid #e8e2d6',
                  padding: '18px 22px',
                  display: 'grid',
                  gridTemplateColumns: '40px 1fr 1fr 120px 150px 150px 40px',
                  alignItems: 'center',
                  gap: '16px',
                  boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
                  transition: 'box-shadow 0.15s',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.04)'}
              >
                <div style={{ fontSize: '12px', fontFamily: 'monospace', color: '#c4bfb5', fontWeight: '600' }}>
                  #{ticket.id}
                </div>

                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#1a1a14', textTransform: 'capitalize', marginBottom: '3px' }}>
                    {ticket.type}
                    {hasImage && <span style={{ marginLeft: '8px', fontSize: '14px', opacity: 0.5 }}>🖼️</span>}
                  </div>
                  <div style={{ fontSize: '12px', color: '#8a7f72', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '240px' }}>
                    {ticket.description}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '13px', color: '#1a1a14', fontWeight: '500', marginBottom: '2px' }}>
                    {ticket.student_name || '—'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#8a7f72' }}>
                    {t.roomLabel} <strong>{ticket.room_number || '—'}</strong>
                  </div>
                </div>

                <div>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    padding: '5px 10px', borderRadius: '20px',
                    fontSize: '11px', fontWeight: '700', textTransform: 'capitalize',
                    background: p.bg, color: p.color, border: `1px solid ${p.border}`,
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: p.dot, flexShrink: 0 }} />
                    {ticket.priority}
                  </span>
                </div>

                <div>
                  <span style={{
                    display: 'inline-block',
                    padding: '5px 10px', borderRadius: '20px',
                    fontSize: '11px', fontWeight: '700',
                    background: s.bg, color: s.color,
                  }}>
                    {stLabel}
                  </span>
                </div>

                <div onClick={e => e.stopPropagation()}>
                  <select
                    value={ticket.status}
                    onChange={e => updateStatus(ticket.id, e.target.value)}
                    style={{
                      width: '100%', padding: '7px 10px', borderRadius: '8px',
                      border: '1.5px solid #e8e2d6',
                      background: '#fafaf7', color: '#1a1a14', fontSize: '12px',
                      outline: 'none', cursor: 'pointer', fontWeight: '500',
                    }}
                    onFocus={e => e.target.style.borderColor = '#d45c3c'}
                    onBlur={e => e.target.style.borderColor = '#e8e2d6'}
                  >
                    <option value="pending">{t.pending}</option>
                    <option value="in_progress">{t.inProgress}</option>
                    <option value="resolved">{t.resolved}</option>
                  </select>
                </div>
                <div onClick={e => { e.stopPropagation(); handleDelete(ticket.id); }} style={{ cursor: 'pointer', color: '#c4bfb5', display: 'flex', justifyContent: 'center', transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#d45c3c'}
                  onMouseLeave={e => e.currentTarget.style.color = '#c4bfb5'}
                  title={t.delete}
                >
                  <Trash2 size={16} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div
          onClick={() => setSelectedTicket(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(26,30,15,0.4)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#ffffff', borderRadius: '18px',
              width: '520px', maxWidth: '100%', maxHeight: '90vh',
              overflowY: 'auto', border: '1px solid #e8e2d6',
              boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
            }}
          >
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '20px 24px', borderBottom: '1px solid #e8e2d6',
            }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a14' }}>
                {t.ticket} #{selectedTicket.id}
              </h2>
              <button
                onClick={() => setSelectedTicket(null)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#8a7f72', padding: '4px', borderRadius: '6px',
                  display: 'flex',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#8a7f72', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{t.type}</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#1a1a14', textTransform: 'capitalize' }}>{selectedTicket.type}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#8a7f72', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{t.status}</div>
                  <span style={{
                    display: 'inline-block', padding: '4px 10px', borderRadius: '20px',
                    fontSize: '11px', fontWeight: '700',
                    background: (STATUS_STYLE[selectedTicket.status] || STATUS_STYLE.pending).bg,
                    color: (STATUS_STYLE[selectedTicket.status] || STATUS_STYLE.pending).color,
                  }}>
                    {selectedTicket.status === 'pending' ? t.pending : selectedTicket.status === 'in_progress' ? t.inProgress : t.resolved}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#8a7f72', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{t.student}</div>
                  <div style={{ fontSize: '14px', color: '#1a1a14' }}>{selectedTicket.student_name || '—'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#8a7f72', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{t.room}</div>
                  <div style={{ fontSize: '14px', color: '#1a1a14' }}>{selectedTicket.room_number || '—'}</div>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#8a7f72', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{t.description}</div>
                <div style={{ fontSize: '13px', color: '#1a1a14', lineHeight: '1.6', background: '#fafaf7', padding: '12px 14px', borderRadius: '10px', border: '1px solid #f5f1ea' }}>
                  {selectedTicket.description || t.noDesc}
                </div>
              </div>

              {selectedTicket.image_url && (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#8a7f72', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{t.image}</div>
                  <img
                    src={selectedTicket.image_url.startsWith('/') ? `${API_ORIGIN}${selectedTicket.image_url}` : `${API_ORIGIN}/${selectedTicket.image_url}`}
                    alt={t.ticket}
                    style={{
                      width: '100%', maxHeight: '360px', objectFit: 'contain',
                      borderRadius: '12px', border: '1px solid #e8e2d6',
                      background: '#fafaf7',
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {alertDialog && <AlertDialog message={alertDialog.message} onClose={() => setAlertDialog(null)} />}
    </div>
  );
}
