import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Building2, Users2, Plus, X, Save, Edit2, Trash2, UserMinus, Wrench } from 'lucide-react';
import { ConfirmDialog, AlertDialog } from '../components/CustomDialogs';

const T = {
  en: {
    title: 'Campus Rooms', subtitle: 'Manage room capacities and student assignments',
    available: 'Available', full: 'Full', addRoom: 'Add Room',
    loading: 'Loading rooms...', empty: 'No rooms added yet. Click "Add Room" to get started.',
    rooms: 'rooms', occupancy: 'Occupancy', beds: 'Beds', edit: 'Edit', delete: 'Delete',
    activeTickets: 'Active Ticket(s)', tickets: 'Maintenance Tickets',
    noTickets: 'No active maintenance tickets for this room.',
    currentResidents: 'Current Residents', roomEmpty: 'This room is currently empty.',
    unknownLevel: 'Unknown Level', general: 'General', remove: 'Remove',
    bloc: 'Bloc', bedsOccupied: 'Beds Occupied',
    addNewRoom: 'Add New Room', editRoom: 'Edit Room',
    blocBuilding: 'Bloc / Building', roomNumber: 'Room Number', capacity: 'Capacity',
    blockPlaceholder: 'e.g. A, B, Main', roomPlaceholder: 'e.g. 101',
    cancel: 'Cancel', saving: 'Saving...', saveRoom: 'Save Room', updateRoom: 'Update Room',
    saveFail: 'Failed to save room.', deleteFail: 'Failed to delete room.',
    deleteConfirm: 'Are you sure you want to delete this room? This might affect students currently assigned to it.',
    unassignConfirm: 'Remove this student from the room?',
    unassignFail: 'Failed to unassign student',
  },
  ar: {
    title: 'غرف الحرم الجامعي', subtitle: 'إدارة سعة الغرف وإسكان الطلبة',
    available: 'متاحة', full: 'ممتلئة', addRoom: 'إضافة غرفة',
    loading: 'جاري تحميل الغرف...', empty: 'لم تتم إضافة غرف بعد. اضغط "إضافة غرفة" للبدء.',
    rooms: 'غرفة', occupancy: 'الإشغال', beds: 'أسرة', edit: 'تعديل', delete: 'حذف',
    activeTickets: 'تذكرة نشطة', tickets: 'تذاكر الصيانة',
    noTickets: 'لا توجد تذاكر صيانة نشطة لهذه الغرفة.',
    currentResidents: 'المقيمون الحاليون', roomEmpty: 'هذه الغرفة فارغة حالياً.',
    unknownLevel: 'مستوى غير معروف', general: 'عام', remove: 'إزالة',
    bloc: 'المبنى', bedsOccupied: 'أسرة مشغولة',
    addNewRoom: 'إضافة غرفة جديدة', editRoom: 'تعديل الغرفة',
    blocBuilding: 'المبنى', roomNumber: 'رقم الغرفة', capacity: 'السعة',
    blockPlaceholder: 'مثال: A, B, رئيسي', roomPlaceholder: 'مثال: 101',
    cancel: 'إلغاء', saving: 'جاري الحفظ...', saveRoom: 'حفظ الغرفة', updateRoom: 'تحديث الغرفة',
    saveFail: 'فشل حفظ الغرفة.', deleteFail: 'فشل حذف الغرفة.',
    deleteConfirm: 'هل أنت متأكد من حذف هذه الغرفة؟ قد يؤثر ذلك على الطلبة المسجلين فيها.',
    unassignConfirm: 'إزالة هذا الطالب من الغرفة؟',
    unassignFail: 'فشل إزالة الطالب',
  },
  fr: {
    title: 'Chambres du Campus', subtitle: 'Gérer les capacités des chambres et les affectations',
    available: 'Disponible', full: 'Complet', addRoom: 'Ajouter une Chambre',
    loading: 'Chargement des chambres...', empty: 'Aucune chambre ajoutée. Cliquez "Ajouter une Chambre" pour commencer.',
    rooms: 'chambres', occupancy: 'Occupation', beds: 'Lits', edit: 'Modifier', delete: 'Supprimer',
    activeTickets: 'Ticket(s) actif(s)', tickets: 'Tickets de Maintenance',
    noTickets: 'Aucun ticket de maintenance actif pour cette chambre.',
    currentResidents: 'Résidents Actuels', roomEmpty: 'Cette chambre est actuellement vide.',
    unknownLevel: 'Niveau inconnu', general: 'Général', remove: 'Retirer',
    bloc: 'Bloc', bedsOccupied: 'Lits Occupés',
    addNewRoom: 'Ajouter une Chambre', editRoom: 'Modifier la Chambre',
    blocBuilding: 'Bloc / Bâtiment', roomNumber: 'Numéro de Chambre', capacity: 'Capacité',
    blockPlaceholder: 'ex: A, B, Principal', roomPlaceholder: 'ex: 101',
    cancel: 'Annuler', saving: 'Enregistrement...', saveRoom: 'Enregistrer', updateRoom: 'Mettre à jour',
    saveFail: 'Échec de l\'enregistrement.', deleteFail: 'Échec de la suppression.',
    deleteConfirm: 'Voulez-vous vraiment supprimer cette chambre ? Cela peut affecter les étudiants qui y sont assignés.',
    unassignConfirm: 'Retirer cet étudiant de la chambre ?',
    unassignFail: 'Échec du retrait de l\'étudiant',
  }
};

export default function RoomsPage() {
  const [lang] = useState(() => localStorage.getItem('lang') || 'en');
  const t = T[lang] || T.en;
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null); // Detailed room view
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [editRoomId, setEditRoomId] = useState(null);

  // Dialog State
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [alertDialog, setAlertDialog] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    building: '', room_number: '', capacity: 2
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = () => {
    setLoading(true);
    api.get('/dashboard/rooms')
      .then(res => setRooms(res.data))
      .catch(() => setRooms([]))
      .finally(() => setLoading(false));
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveRoom = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');
    try {
      if (editRoomId) {
        await api.put(`/dashboard/rooms/${editRoomId}`, formData);
      } else {
        await api.post('/dashboard/rooms', formData);
      }
      setIsModalOpen(false);
      setEditRoomId(null);
      setFormData({ building: '', room_number: '', capacity: 2 });
      fetchRooms();
    } catch (err) {
      setFormError(err.response?.data?.error || t.saveFail);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (e, room) => {
    e.stopPropagation();
    setFormData({
      building: room.building || '',
      room_number: room.room_number || '',
      capacity: room.capacity || 2
    });
    setEditRoomId(room.id);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (e, id) => {
    e.stopPropagation();
    setConfirmDialog({
      message: t.deleteConfirm,
      onConfirm: async () => {
        try {
          await api.delete(`/dashboard/rooms/${id}`);
          fetchRooms();
          if (selectedRoom?.id === id) setSelectedRoom(null);
        } catch (err) {
          setAlertDialog({ message: t.deleteFail });
        }
      }
    });
  };

  const handleUnassignStudent = (studentId) => {
    setConfirmDialog({
      message: t.unassignConfirm,
      onConfirm: async () => {
        try {
          await api.put(`/students/${studentId}/unassign`);
          // Update local state to reflect instantly
          setSelectedRoom(prev => ({
            ...prev,
            students: prev.students.filter(s => s.id !== studentId),
            occupied_count: parseInt(prev.occupied_count) - 1,
            status: 'available'
          }));
          fetchRooms();
        } catch (err) {
          setAlertDialog({ message: t.unassignFail });
        }
      }
    });
  };

  const available = rooms.filter(r => r.status === 'available').length;
  const full = rooms.filter(r => r.status === 'full').length;

  const grouped = rooms.reduce((acc, r) => {
    const key = r.building || 'Main';
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1a1a14', marginBottom: '4px' }}>{t.title}</h1>
          <p style={{ color: '#8a7f72', fontSize: '13px' }}>{t.subtitle}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <StatChip label={t.available} value={available} color="#5c651f" bg="#f4f6ec" border="#c7d6a2" />
          <StatChip label={t.full} value={full} color="#b84a2e" bg="#fce4db" border="#f8c7b4" />
          
          <button
            onClick={() => {
              setEditRoomId(null);
              setFormData({ building: '', room_number: '', capacity: 2 });
              setIsModalOpen(true);
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: '#5c651f', color: '#fff', border: 'none', marginLeft: '12px',
              padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: '700',
              cursor: 'pointer', boxShadow: '0 4px 14px rgba(92,101,31,0.25)', transition: 'transform 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            <Plus size={18} /> {t.addRoom}
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '48px', textAlign: 'center', color: '#8a7f72' }}>{t.loading}</div>
      ) : Object.keys(grouped).length === 0 ? (
        <div style={{ padding: '48px', textAlign: 'center', color: '#8a7f72', background: '#fff', borderRadius: '16px', border: '1px dashed #c7d6a2' }}>
          {t.empty}
        </div>
      ) : (
        Object.entries(grouped).map(([bloc, blocRooms]) => (
          <div key={bloc}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '8px',
                background: '#e3ebd0', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Building2 size={14} style={{ color: '#5c651f' }} />
              </div>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#1a1a14' }}>{bloc}</span>
              <span style={{ fontSize: '12px', color: '#8a7f72' }}>· {blocRooms.length} {t.rooms}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
              {blocRooms.map(r => {
                const isAvailable = r.status === 'available';
                const occ = parseInt(r.occupied_count) || 0;
                const cap = parseInt(r.capacity) || 2;
                const fillPercentage = Math.min((occ / cap) * 100, 100);

                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRoom(r)}
                    style={{
                      background: '#ffffff',
                      border: `1.5px solid ${isAvailable ? '#c7d6a2' : '#f8c7b4'}`,
                      borderRadius: '14px',
                      padding: '18px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      transition: 'transform 0.15s, box-shadow 0.15s',
                      cursor: 'pointer',
                      display: 'flex', flexDirection: 'column'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 24px rgba(0,0,0,0.08)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          fontSize: '22px', fontWeight: '800', color: '#1a1a14',
                          fontFamily: 'monospace', letterSpacing: '-0.5px',
                        }}>
                          {r.room_number}
                        </div>
                        {(r.tickets && r.tickets.length > 0) && (
                          <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: '#fce4db', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={`${r.tickets.length} ${t.activeTickets}`}>
                            <Wrench size={12} style={{ color: '#d45c3c' }} />
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <div style={{
                          width: '10px', height: '10px', borderRadius: '50%',
                          background: isAvailable ? '#8ea45c' : '#d45c3c',
                          boxShadow: `0 0 6px ${isAvailable ? 'rgba(142,164,92,0.5)' : 'rgba(212,92,60,0.5)'}`,
                        }} />
                        <button onClick={(e) => handleEditClick(e, r)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8ea45c', padding: '2px' }} title={t.edit}>
                          <Edit2 size={14} />
                        </button>
                        <button onClick={(e) => handleDeleteClick(e, r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d45c3c', padding: '2px' }} title={t.delete}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Visual Bed-Level Tracking */}
                    <div style={{ marginTop: 'auto' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#8a7f72', marginBottom: '6px', fontWeight: '600' }}>
                        <span>{t.occupancy}</span>
                        <span>{occ} / {cap} {t.beds}</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: '#f5f1ea', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${fillPercentage}%`, height: '100%', 
                          background: isAvailable ? '#8ea45c' : '#d45c3c',
                          transition: 'width 0.4s ease'
                        }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      {/* ── Room Details Modal (Who is assigned?) ── */}
      {selectedRoom && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 90, padding: '20px'
        }} onClick={() => setSelectedRoom(null)}>
          <div style={{
            background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '500px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)', overflow: 'hidden'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ background: '#f9f7f3', padding: '24px', borderBottom: '1px solid #e8e2d6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#e3ebd0', color: '#5c651f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1a1a14' }}>{t.bloc} {selectedRoom.building} - {selectedRoom.room_number}</h2>
                  <p style={{ fontSize: '13px', color: '#8a7f72', fontWeight: '600' }}>{selectedRoom.occupied_count} / {selectedRoom.capacity} {t.bedsOccupied}</p>
                </div>
              </div>
              <button onClick={() => setSelectedRoom(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8a7f72' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#5c651f', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>{t.currentResidents}</h3>
              
              {(!selectedRoom.students || selectedRoom.students.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#8a7f72', background: '#fafaf7', borderRadius: '12px', border: '1px dashed #e8e2d6' }}>
                  {t.roomEmpty}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedRoom.students.map(student => (
                    <div key={student.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#fff', border: '1px solid #e8e2d6', borderRadius: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#1a1a14' }}>{student.name}</div>
                        <div style={{ fontSize: '12px', color: '#8a7f72', marginTop: '2px' }}>
                          {student.study_year || t.unknownLevel} • {student.speciality || t.general}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleUnassignStudent(student.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fce4db', color: '#d45c3c', border: '1px solid #f8c7b4', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f8c7b4'}
                        onMouseLeave={e => e.currentTarget.style.background = '#fce4db'}
                      >
                        <UserMinus size={14} /> {t.remove}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Active Tickets Section ── */}
              <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#b84a2e', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '24px', marginBottom: '16px' }}>{t.tickets}</h3>
              
              {(!selectedRoom.tickets || selectedRoom.tickets.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#8a7f72', background: '#fafaf7', borderRadius: '12px', border: '1px dashed #e8e2d6' }}>
                  {t.noTickets}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedRoom.tickets.map(ticket => (
                    <div key={ticket.id} style={{ padding: '12px 16px', background: '#fff', border: '1px solid #f8c7b4', borderRadius: '12px', borderLeft: '4px solid #d45c3c' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: '#1a1a14', textTransform: 'capitalize' }}>{ticket.type}</div>
                          <div style={{ fontSize: '12px', color: '#8a7f72', marginTop: '2px' }}>{ticket.description}</div>
                        </div>
                        <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', background: '#fce4db', color: '#d45c3c', padding: '4px 8px', borderRadius: '6px' }}>
                          {ticket.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Add / Edit Room Modal ── */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, padding: '20px'
        }}>
          <div style={{
            background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '400px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)', overflow: 'hidden'
          }}>
            <div style={{ background: '#f9f7f3', padding: '20px 24px', borderBottom: '1px solid #e8e2d6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#e3ebd0', color: '#5c651f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={18} />
                </div>
                <div>
                  <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#1a1a14' }}>{editRoomId ? t.editRoom : t.addNewRoom}</h2>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8a7f72' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              {formError && (
                <div style={{ padding: '12px', background: '#fce4db', color: '#d45c3c', borderRadius: '8px', fontSize: '13px', fontWeight: '600', marginBottom: '20px' }}>
                  {formError}
                </div>
              )}

              <form onSubmit={handleSaveRoom} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>{t.blocBuilding}</label>
                  <input required name="building" value={formData.building} onChange={handleInputChange} style={inputStyle} placeholder={t.blockPlaceholder} />
                </div>
                <div>
                  <label style={labelStyle}>{t.roomNumber}</label>
                  <input required name="room_number" value={formData.room_number} onChange={handleInputChange} style={inputStyle} placeholder={t.roomPlaceholder} />
                </div>
                <div>
                  <label style={labelStyle}>{t.capacity}</label>
                  <input type="number" min="1" max="10" required name="capacity" value={formData.capacity} onChange={handleInputChange} style={inputStyle} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #e8e2d6', background: '#fff', color: '#8a7f72', fontWeight: '600', cursor: 'pointer' }}>
                    {t.cancel}
                  </button>
                  <button type="submit" disabled={isSubmitting} style={{
                    padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#5c651f', color: '#fff', fontWeight: '700',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', opacity: isSubmitting ? 0.7 : 1
                  }}>
                    <Save size={16} /> {isSubmitting ? t.saving : (editRoomId ? t.updateRoom : t.saveRoom)}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Dialogs ── */}
      {confirmDialog && <ConfirmDialog message={confirmDialog.message} onConfirm={confirmDialog.onConfirm} onCancel={() => setConfirmDialog(null)} />}
      {alertDialog && <AlertDialog message={alertDialog.message} onClose={() => setAlertDialog(null)} />}
    </div>
  );
}

function StatChip({ label, value, color, bg, border }) {
  return (
    <div style={{ padding: '8px 14px', borderRadius: '10px', background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span style={{ fontSize: '16px', fontWeight: '800', color }}>{value}</span>
      <span style={{ fontSize: '12px', color, fontWeight: '500' }}>{label}</span>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '12px', fontWeight: '700', color: '#8a7f72', marginBottom: '6px' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e8e2d6', outline: 'none', fontSize: '13px', color: '#1a1a14', background: '#fafaf7' };
