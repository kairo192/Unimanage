import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Users, Search, Plus, X, UserPlus, Save, GraduationCap, Edit2, Trash2, Sparkles } from 'lucide-react';
import { ConfirmDialog, AlertDialog } from '../components/CustomDialogs';

const ALGERIAN_WILAYAS = [
  "01 - Adrar", "02 - Chlef", "03 - Laghouat", "04 - Oum El Bouaghi", "05 - Batna", "06 - Béjaïa", "07 - Biskra", "08 - Béchar", "09 - Blida", "10 - Bouira",
  "11 - Tamanrasset", "12 - Tébessa", "13 - Tlemcen", "14 - Tiaret", "15 - Tizi Ouzou", "16 - Alger", "17 - Djelfa", "18 - Jijel", "19 - Sétif", "20 - Saïda",
  "21 - Skikda", "22 - Sidi Bel Abbès", "23 - Annaba", "24 - Guelma", "25 - Constantine", "26 - Médéa", "27 - Mostaganem", "28 - M'Sila", "29 - Mascara", "30 - Ouargla",
  "31 - Oran", "32 - El Bayadh", "33 - Illizi", "34 - Bordj Bou Arréridj", "35 - Boumerdès", "36 - El Tarf", "37 - Tindouf", "38 - Tissemsilt", "39 - El Oued", "40 - Khenchela",
  "41 - Souk Ahras", "42 - Tipaza", "43 - Mila", "44 - Aïn Defla", "45 - Naâma", "46 - Aïn Témouchent", "47 - Ghardaïa", "48 - Relizane", "49 - Timimoun", "50 - Bordj Badji Mokhtar",
  "51 - Ouled Djellal", "52 - Béni Abbès", "53 - In Salah", "54 - In Guezzam", "55 - Touggourt", "56 - Djanet", "57 - El M'Ghair", "58 - El Meniaa"
];

const STUDY_YEARS = [
  "L1 (Licence 1)", "L2 (Licence 2)", "L3 (Licence 3)",
  "M1 (Master 1)", "M2 (Master 2)",
  "D1 (Doctorat 1)", "D2 (Doctorat 2)", "D3 (Doctorat 3)", "D4+",
];

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [editStudentId, setEditStudentId] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [alertDialog, setAlertDialog] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', date_of_birth: '', gender: 'Male',
    phone: '', email: '', wilaya: '', baladiya: '', national_id: '', student_number: '',
    department: '', speciality: '', study_year: '', 
    residence: '', building: '', room_number: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studentsRes, roomsRes] = await Promise.all([
        api.get('/students'),
        api.get('/dashboard/rooms')
      ]);
      setStudents(studentsRes.data);
      setRooms(roomsRes.data);
    } catch (error) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');
    try {
      if (editStudentId) {
        await api.put(`/students/${editStudentId}`, formData);
      } else {
        await api.post('/students', formData);
      }
      setIsModalOpen(false);
      setEditStudentId(null);
      setFormData({
        first_name: '', last_name: '', date_of_birth: '', gender: 'Male',
        phone: '', wilaya: '', baladiya: '', national_id: '', student_number: '',
        department: '', speciality: '', study_year: '',
        residence: '', building: '', room_number: ''
      });
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Error saving student. Check for duplicates.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (student) => {
    setFormData({
      first_name: student.first_name || '',
      last_name: student.last_name || '',
      date_of_birth: student.date_of_birth ? student.date_of_birth.split('T')[0] : '',
      gender: student.gender || 'Male',
      phone: student.phone || '',
      email: student.email || '',
      wilaya: student.wilaya || '',
      baladiya: student.baladiya || '',
      national_id: student.national_id || '',
      student_number: student.student_number || '',
      department: student.department || '',
      speciality: student.speciality || '',
      study_year: student.study_year || '',
      residence: student.residence || '',
      building: student.building || '',
      room_number: student.room_number || ''
    });
    setEditStudentId(student.id);
    setIsModalOpen(true);
  };

  const handleSmartAssign = async () => {
    try {
      setFormError('');
      const res = await api.get('/students/smart-assign', {
        params: { speciality: formData.speciality, study_year: formData.study_year }
      });
      setFormData(prev => ({
        ...prev,
        building: res.data.building,
        room_number: res.data.room_number
      }));
    } catch (err) {
      setFormError(err.response?.data?.error || 'No available rooms found for auto-assignment.');
    }
  };

  const handleDeleteClick = (id) => {
    setConfirmDialog({
      message: 'Are you sure you want to delete this student?',
      onConfirm: async () => {
        try {
          await api.delete(`/students/${id}`);
          fetchData();
        } catch (err) {
          setAlertDialog({ message: 'Failed to delete student.' });
        }
      }
    });
  };

  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.student_number?.toLowerCase().includes(search.toLowerCase()) ||
    s.national_id?.toLowerCase().includes(search.toLowerCase()) ||
    s.speciality?.toLowerCase().includes(search.toLowerCase())
  );

  const COLORS = ['#d45c3c','#5c651f','#8ea45c','#f6b371','#b8631c','#7b743e','#bcc99b'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
      
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1a1a14', marginBottom: '4px' }}>Students Inventory</h1>
          <p style={{ color: '#8a7f72', fontSize: '13px' }}>Manage full student profiles, LMD levels, and residency details.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{
            padding: '10px 16px', borderRadius: '10px',
            background: '#fce4db', color: '#b84a2e',
            fontSize: '13px', fontWeight: '700', border: '1px solid #f8c7b4',
            display: 'flex', alignItems: 'center'
          }}>
            {students.length} Registered
          </div>
          <button
            onClick={() => {
              setEditStudentId(null);
              setFormData({
                first_name: '', last_name: '', date_of_birth: '', gender: 'Male',
                phone: '', email: '', wilaya: '', baladiya: '', national_id: '', student_number: '',
                department: '', speciality: '', study_year: '',
                residence: '', building: '', room_number: ''
              });
              setIsModalOpen(true);
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: '#d45c3c', color: '#fff', border: 'none',
              padding: '10px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: '700',
              cursor: 'pointer', boxShadow: '0 4px 14px rgba(212,92,60,0.3)', transition: 'transform 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            <UserPlus size={18} /> Add Student
          </button>
        </div>
      </div>

      {/* ── Search ── */}
      <div style={{ position: 'relative' }}>
        <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#8a7f72' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, matricule, NIN, or speciality..."
          style={{
            width: '100%', padding: '11px 14px 11px 40px',
            borderRadius: '12px', border: '1px solid #e8e2d6',
            background: '#ffffff', fontSize: '13px', color: '#1a1a14',
            outline: 'none', boxSizing: 'border-box',
          }}
          onFocus={e => e.target.style.borderColor = '#d45c3c'}
          onBlur={e => e.target.style.borderColor = '#e8e2d6'}
        />
      </div>

      {/* ── Table ── */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e8e2d6', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1fr 1fr 1fr 80px', gap: '0', padding: '12px 20px', background: '#f9f7f3', borderBottom: '1px solid #e8e2d6' }}>
          {['Student', 'Matricule', 'NIN', 'Level', 'Wilaya', 'Room', 'Actions'].map(h => (
            <div key={h} style={{ fontSize: '11px', fontWeight: '700', color: '#8a7f72', textTransform: 'uppercase', letterSpacing: '0.6px', textAlign: h === 'Actions' ? 'right' : 'left' }}>{h}</div>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#8a7f72' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#8a7f72', fontSize: '14px' }}>No students found in the database.</div>
        ) : filtered.map((s, i) => (
          <div
            key={s.id}
            style={{
              display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1fr 1fr 1fr 80px',
              padding: '16px 20px', alignItems: 'center',
              borderBottom: i < filtered.length - 1 ? '1px solid #f5f1ea' : 'none',
              transition: 'background 0.1s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#fafaf7'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                background: COLORS[i % COLORS.length] + '25',
                border: `1.5px solid ${COLORS[i % COLORS.length]}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px', fontWeight: '800', color: COLORS[i % COLORS.length],
              }}>
                {s.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#1a1a14' }}>{s.name}</div>
                <div style={{ fontSize: '11px', color: '#8a7f72', marginTop: '2px' }}>{s.speciality || 'No speciality'}</div>
              </div>
            </div>
            <div style={{ fontSize: '12px', fontFamily: 'monospace', color: '#8a7f72', fontWeight: '500' }}>{s.student_number || '—'}</div>
            <div style={{ fontSize: '12px', fontFamily: 'monospace', color: '#8a7f72', fontWeight: '500' }}>{s.national_id || '—'}</div>
            <div>
              <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', background: '#fef0df', color: '#b8631c' }}>
                {s.study_year || 'Unknown'}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#5a5248', fontWeight: '600' }}>{s.wilaya ? s.wilaya.split(' - ')[1] : '—'}</div>
            <div>
              {s.room_number
                ? <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', background: '#e3ebd0', color: '#5c651f', border: '1px solid #c7d6a2' }}>Bloc {s.building} - {s.room_number}</span>
                : <span style={{ fontSize: '12px', color: '#c4bfb5', fontStyle: 'italic' }}>Unassigned</span>
              }
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={() => handleEditClick(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8ea45c' }} title="Edit">
                <Edit2 size={16} />
              </button>
              <button onClick={() => handleDeleteClick(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d45c3c' }} title="Delete">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Add Student Modal ── */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, padding: '20px'
        }}>
          <div style={{
            background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '800px',
            maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ position: 'sticky', top: 0, background: '#fff', padding: '24px 32px', borderBottom: '1px solid #e8e2d6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fce4db', color: '#d45c3c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GraduationCap size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1a1a14' }}>{editStudentId ? 'Edit Student Profile' : 'Register New Student'}</h2>
                  <p style={{ fontSize: '12px', color: '#8a7f72' }}>Comprehensive student and residency profile</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8a7f72' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ padding: '32px' }}>
              {formError && (
                <div style={{ padding: '12px', background: '#fce4db', color: '#d45c3c', borderRadius: '8px', fontSize: '13px', fontWeight: '600', marginBottom: '24px' }}>
                  {formError}
                </div>
              )}

              <form onSubmit={handleSaveStudent} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                
                {/* Personal Info Section */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#5c651f', borderBottom: '1px solid #e8e2d6', paddingBottom: '8px', marginBottom: '16px' }}>Personal Information</h3>
                </div>

                <div>
                  <label style={labelStyle}>First Name (Prénom)</label>
                  <input required name="first_name" value={formData.first_name} onChange={handleInputChange} style={inputStyle} placeholder="Ahmed" />
                </div>
                <div>
                  <label style={labelStyle}>Last Name (Nom)</label>
                  <input required name="last_name" value={formData.last_name} onChange={handleInputChange} style={inputStyle} placeholder="Benali" />
                </div>
                <div>
                  <label style={labelStyle}>Date of Birth</label>
                  <input type="date" required name="date_of_birth" value={formData.date_of_birth} onChange={handleInputChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleInputChange} style={inputStyle}>
                    <option value="Male">Male (ذكر)</option>
                    <option value="Female">Female (أنثى)</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Wilaya</label>
                  <select required name="wilaya" value={formData.wilaya} onChange={handleInputChange} style={inputStyle}>
                    <option value="">Select Wilaya...</option>
                    {ALGERIAN_WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Municipality (Baladiya)</label>
                  <input required name="baladiya" value={formData.baladiya} onChange={handleInputChange} style={inputStyle} placeholder="e.g. Blida Centre" />
                </div>

                {/* Academic Info Section */}
                <div style={{ gridColumn: '1 / -1', marginTop: '12px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#5c651f', borderBottom: '1px solid #e8e2d6', paddingBottom: '8px', marginBottom: '16px' }}>Academic & Identity Details</h3>
                </div>

                <div>
                  <label style={labelStyle}>Student ID (Matricule)</label>
                  <input required name="student_number" value={formData.student_number} onChange={handleInputChange} style={inputStyle} placeholder="e.g. 2026123456" />
                </div>
                <div>
                  <label style={labelStyle}>Email (for login)</label>
                  <input name="email" value={formData.email || ''} onChange={handleInputChange} style={inputStyle} placeholder="student@university.dz" type="email" />
                </div>
                <div>
                  <label style={labelStyle}>National ID (NIN / Carte Nat.)</label>
                  <input required name="national_id" value={formData.national_id} onChange={handleInputChange} style={inputStyle} placeholder="18-digit national number" />
                </div>
                <div>
                  <label style={labelStyle}>Department / Faculty</label>
                  <input required name="department" value={formData.department} onChange={handleInputChange} style={inputStyle} placeholder="e.g. Sciences Appliquées" />
                </div>
                <div>
                  <label style={labelStyle}>Speciality (Spécialité)</label>
                  <input required name="speciality" value={formData.speciality} onChange={handleInputChange} style={inputStyle} placeholder="e.g. Informatique (IA)" />
                </div>
                <div>
                  <label style={labelStyle}>Level of Study (LMD)</label>
                  <select required name="study_year" value={formData.study_year} onChange={handleInputChange} style={inputStyle}>
                    <option value="">Select level...</option>
                    {STUDY_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>

                {/* Accommodation Section */}
                <div style={{ gridColumn: '1 / -1', marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e8e2d6', paddingBottom: '8px', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#5c651f' }}>Accommodation Assignment</h3>
                  <button type="button" onClick={handleSmartAssign} style={{
                    display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px',
                    background: '#f4f6ec', color: '#5c651f', border: '1px solid #c7d6a2', fontSize: '12px', fontWeight: '700', cursor: 'pointer'
                  }}>
                    <Sparkles size={14} /> Smart Assign
                  </button>
                </div>

                <div>
                  <label style={labelStyle}>Residence / Department</label>
                  <input name="residence" value={formData.residence} onChange={handleInputChange} style={inputStyle} placeholder="e.g. Résidence 1" />
                </div>
                <div>
                  <label style={labelStyle}>Bloc / Building</label>
                  <input name="building" value={formData.building} onChange={handleInputChange} style={inputStyle} placeholder="e.g. A, B, C" />
                </div>
                <div>
                  <label style={labelStyle}>Room Number</label>
                  <input name="room_number" value={formData.room_number} onChange={handleInputChange} style={inputStyle} placeholder="e.g. 104" />
                </div>
                <div>
                  <label style={labelStyle}>Phone Number</label>
                  <input name="phone" value={formData.phone} onChange={handleInputChange} style={inputStyle} placeholder="05XX XX XX XX" />
                </div>
                {/* Footer Buttons */}
                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e8e2d6' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '12px 24px', borderRadius: '10px', border: '1px solid #e8e2d6', background: '#fff', color: '#8a7f72', fontWeight: '600', cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} style={{
                    padding: '12px 24px', borderRadius: '10px', border: 'none', background: '#d45c3c', color: '#fff', fontWeight: '700',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: isSubmitting ? 0.7 : 1
                  }}>
                    <Save size={16} /> {isSubmitting ? 'Saving...' : (editStudentId ? 'Update Student' : 'Register Student')}
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

const labelStyle = { display: 'block', fontSize: '12px', fontWeight: '700', color: '#8a7f72', marginBottom: '6px' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e8e2d6', outline: 'none', fontSize: '13px', color: '#1a1a14', background: '#fafaf7' };
