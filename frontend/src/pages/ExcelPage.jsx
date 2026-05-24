import { useState } from 'react';
import api from '../api/axios';
import { AlertDialog } from '../components/CustomDialogs';
import { Upload, Download, CheckCircle2, AlertCircle, CloudUpload, HelpCircle, FileText, Settings, Sparkles } from 'lucide-react';

const T = {
  ar: {
    dir: 'rtl',
    title: 'أدوات الاستيراد والتصدير (Excel)',
    subtitle: 'استورد بيانات الطلاب والغ الغرف جماعياً أو قم بتصدير التقارير الإدارية بضغطة زر واحدة',
    importCardTitle: 'استيراد البيانات الجماعية',
    importCardSub: 'تحميل ملفات Excel لإضافة سجلات جديدة للنظام',
    importTypeLabel: 'نوع الاستيراد',
    studentsType: '👨‍🎓 الطلاب',
    roomsType: '🏠 الغرف',
    dropZoneDefault: 'اسحب وأفلت ملف Excel هنا',
    dropZoneBrowse: 'أو انقر لتصفح الملفات · .xlsx / .xls / .csv',
    dropZoneReady: 'الملف جاهز للرفع والتحليل',
    uploadBtnDefault: 'رفع واستيراد البيانات',
    uploadBtnProcessing: '⏳ جاري المعالجة والتحقق...',
    successTitle: 'تم الاستيراد بنجاح',
    insertedLabel: 'تم إدخالها',
    skippedLabel: 'تخطيها',
    errorsLabel: 'الأخطاء',
    exportCardTitle: 'تصدير التقارير الإدارية',
    exportCardSub: 'تنزيل تقارير Excel منسقة ومنظمة للمديرية',
    downloadTemplateBtn: 'تحميل قالب الاستيراد CSV',
    instructionsTitle: '📋 دليل إعداد ملف الاستيراد لتفادي الأخطاء',
    instructionsDesc: 'يرجى التأكد من تسمية الأعمدة (Headers) في الملف بنفس الأسماء التالية تماماً للحصول على استيراد صحيح وبدون أي أخطاء:',
    studentsInstruct: 'استيراد الطلاب (ملف الطلاب):',
    roomsInstruct: 'استيراد الغرف (ملف الغرف):',
    reqFields: 'الحقول المطلوبة أساسية',
    optFields: 'الحقول الاختيارية',
    examples: 'أمثلة وتنسيق الحقول',
    btnDownloadTemplate: 'تحميل القالب الفارغ',
    validationErrorsTitle: 'تفاصيل أخطاء التحقق من الصحة:',
    wizardTitle: '🧙‍♂️ مساعد ذكي لمطابقة الأعمدة ونقل البيانات',
    wizardDesc: 'لقد قمنا بتحليل ملفك. يرجى مطابقة أعمدة ملفك مع حقول قاعدة البيانات أدناه:',
    previewLabel: 'عينة',
    mappedBadge: 'مطابق تلقائياً',
    unmappedBadge: 'غير مطابق',
    parsingNotice: '⚡ المحلل الذكي يقوم بفحص الملف...',
  },
  fr: {
    dir: 'ltr',
    title: 'Outils Excel (Import / Export)',
    subtitle: 'Importez des données massives d\'étudiants et de chambres, ou générez des rapports administratifs en un clic',
    importCardTitle: 'Importation de données en masse',
    importCardSub: 'Téléchargez des fichiers Excel pour importer de nouveaux enregistrements',
    importTypeLabel: 'Type d\'importation',
    studentsType: '👨‍🎓 Étudiants',
    roomsType: '🏠 Chambres',
    dropZoneDefault: 'Glissez et déposez votre fichier Excel ici',
    dropZoneBrowse: 'ou cliquez pour parcourir · .xlsx / .xls / .csv',
    dropZoneReady: 'Fichier prêt pour le téléchargement',
    uploadBtnDefault: 'Téléverser et Importer',
    uploadBtnProcessing: '⏳ Traitement en cours...',
    successTitle: 'Importation réussie',
    insertedLabel: 'Insérés',
    skippedLabel: 'Ignorés',
    errorsLabel: 'Erreurs',
    exportCardTitle: 'Générer des rapports administratifs',
    exportCardSub: 'Téléchargez des rapports Excel structurés et formatés',
    downloadTemplateBtn: 'Télécharger le modèle CSV',
    instructionsTitle: '📋 Guide de préparation des fichiers d\'importation',
    instructionsDesc: 'Veuillez vous assurer que les colonnes (Headers) de votre fichier correspondent exactement aux noms suivants pour éviter tout rejet :',
    studentsInstruct: 'Importation des Étudiants :',
    roomsInstruct: 'Importation des Chambres :',
    reqFields: 'Champs requis obligatoires',
    optFields: 'Champs optionnels secondaires',
    examples: 'Exemples et Formats attendus',
    btnDownloadTemplate: 'Télécharger le modèle',
    validationErrorsTitle: 'Détails des erreurs de validation :',
    wizardTitle: '🧙‍♂️ Assistant de Correspondance Intelligente & Migration',
    wizardDesc: 'Nous avons analysé votre fichier. Associez les colonnes de votre fichier aux champs du système ci-dessous :',
    previewLabel: 'Aperçu',
    mappedBadge: 'Auto-associé',
    unmappedBadge: 'Non-associé',
    parsingNotice: '⚡ Analyseur intelligent en cours de lecture...',
  },
  en: {
    dir: 'ltr',
    title: 'Excel Tools (Import / Export)',
    subtitle: 'Import bulk records of students and rooms or export clean administrative reports in one click',
    importCardTitle: 'Bulk Data Import',
    importCardSub: 'Upload Excel/CSV files to batch import new records',
    importTypeLabel: 'Import Type',
    studentsType: '👨‍🎓 Students',
    roomsType: '🏠 Rooms',
    dropZoneDefault: 'Drop Excel/CSV file here',
    dropZoneBrowse: 'or click to browse · .xlsx / .xls / .csv',
    dropZoneReady: 'File ready to import',
    uploadBtnDefault: 'Upload & Import Data',
    uploadBtnProcessing: '⏳ Processing...',
    successTitle: 'Import Successful',
    insertedLabel: 'Inserted',
    skippedLabel: 'Skipped',
    errorsLabel: 'Errors',
    exportCardTitle: 'Generate Administrative Reports',
    exportCardSub: 'Download professionally formatted Excel documents',
    downloadTemplateBtn: 'Download CSV Template',
    instructionsTitle: '📋 File Preparation & Header Guideline',
    instructionsDesc: 'To ensure a smooth data import process, please verify your spreadsheet columns match these exact headers:',
    studentsInstruct: 'Student Directory Import:',
    roomsInstruct: 'Rooms & Residence Inventory Import:',
    reqFields: 'Core Required Fields',
    optFields: 'Optional Fields',
    examples: 'Field Examples & Format',
    btnDownloadTemplate: 'Download Template',
    validationErrorsTitle: 'Validation Errors Detail:',
    wizardTitle: '🧙‍♂️ Smart Column Mapping & Legacy Migration Assistant',
    wizardDesc: 'We parsed your spreadsheet. Verify or map your file columns to the system fields below:',
    previewLabel: 'Sample',
    mappedBadge: 'Auto-Mapped',
    unmappedBadge: 'Unmapped',
    parsingNotice: '⚡ Smart Analyzer parsing file...',
  }
};

const SMART_MATCH_RULES = {
  full_name: ['name', 'nom', 'fullname', 'full_name', 'الاسم', 'الاسم الكامل', 'student name', 'nom complet', 'student_name'],
  student_number: ['student_number', 'student number', 'matricule', 'id', 'code', 'رقم التسجيل', 'رقم الطالب', 'رقم الكود', 'student_id', 'studentId'],
  speciality: ['speciality', 'specialité', 'specialite', 'التخصص', 'filière', 'filiere', 'branch'],
  study_year: ['study_year', 'study year', 'année', 'annee', 'السنة', 'السنة الدراسية', 'niveau', 'level'],
  phone: ['phone', 'mobile', 'telephone', 'téléphone', 'الهاتف', 'رقم الهاتف', 'phone_number'],
  wilaya: ['wilaya', 'province', 'الولاية', 'state', 'city'],
  room_number: ['room_number', 'room number', 'chambre', 'room', 'رقم الغرفة', 'الغرفة'],
  building: ['building', 'bâtiment', 'batiment', 'المبنى', 'block', 'بلوك', 'pavillon'],
  capacity: ['capacity', 'capacité', 'capacite', 'السعة', 'القدرة', 'beds', 'عدد الأسرة']
};

const autoMapHeaders = (fileHeaders, type) => {
  const expectedFields = type === 'students' 
    ? ['full_name', 'student_number', 'speciality', 'study_year', 'phone', 'wilaya']
    : ['room_number', 'building', 'capacity'];

  const mappings = {};
  
  expectedFields.forEach(field => {
    const rules = SMART_MATCH_RULES[field] || [];
    // Find a header in fileHeaders that closely matches any of the rules
    const match = fileHeaders.find(h => {
      const normalizedH = h.toLowerCase().trim().replace(/[\s_-]+/g, '');
      return rules.some(r => {
        const normalizedR = r.toLowerCase().trim().replace(/[\s_-]+/g, '');
        return normalizedH === normalizedR || normalizedH.includes(normalizedR) || normalizedR.includes(normalizedH);
      });
    });
    
    if (match) {
      mappings[field] = match;
    } else {
      // Fallback: see if there is an exact case-insensitive match
      const exactMatch = fileHeaders.find(h => h.toLowerCase() === field.toLowerCase());
      if (exactMatch) mappings[field] = exactMatch;
      else mappings[field] = ''; // Manual mapping needed
    }
  });
  
  return mappings;
};

export default function ExcelPage() {
  const [file, setFile] = useState(null);
  const [importType, setImportType] = useState('students');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [alertDialog, setAlertDialog] = useState(null);
  const [lang] = useState(() => localStorage.getItem('lang') || 'ar');

  // Smart Migration States
  const [parsedHeaders, setParsedHeaders] = useState([]);
  const [parsedSample, setParsedSample] = useState({});
  const [columnMappings, setColumnMappings] = useState({});
  const [showMappingWizard, setShowMappingWizard] = useState(false);
  const [parsingFile, setParsingFile] = useState(false);

  const t = T[lang] || T.ar;

  const handleFileChange = async (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setError('');
    setResult(null);
    setParsingFile(true);
    setShowMappingWizard(false);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await api.post('/excel/import/parse-headers', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const { headers, sample } = res.data;
      setParsedHeaders(headers);
      setParsedSample(sample);

      // Auto-map headers based on selected importType
      const initialMappings = autoMapHeaders(headers, importType);
      setColumnMappings(initialMappings);
      setShowMappingWizard(true);
    } catch (err) {
      console.error('Failed to parse file headers:', err);
      setError(err.response?.data?.error || 'Failed to analyse file. Make sure it has readable column headers.');
      setShowMappingWizard(false);
    } finally {
      setParsingFile(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    if (showMappingWizard) {
      formData.append('mappings', JSON.stringify(columnMappings));
    }
    setUploading(true); 
    setError(''); 
    setResult(null);
    try {
      const res = await api.post(`/excel/import/${importType}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data); 
      setFile(null);
      setShowMappingWizard(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (type) => {
    try {
      const res = await api.get(`/excel/export/${type}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) { 
      console.error('Export download failed:', err);
      setAlertDialog({ message: err.response?.data?.error || 'Download failed' });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault(); 
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith('.xlsx') || f.name.endsWith('.xls') || f.name.endsWith('.csv'))) {
      handleFileChange(f);
    }
  };

  const downloadTemplate = (type) => {
    let headers = [];
    let sampleRow = [];
    let filename = '';

    if (type === 'students') {
      headers = [
        'full_name', 'first_name', 'last_name', 'email', 'date_of_birth', 
        'gender', 'phone', 'wilaya', 'baladiya', 'national_id', 
        'student_number', 'department', 'speciality', 'study_year', 'faculty'
      ];
      sampleRow = [
        'Anis Belkacem', 'Anis', 'Belkacem', 'anis.b@univ-blida2.dz', '2003-05-14', 
        'male', '0555123456', 'Blida', 'El Affroun', '123456789012', 
        '2026_987654', 'Computer Science', 'Artificial Intelligence', 'L3', 'Faculty of Sciences'
      ];
      filename = 'students_import_template.csv';
    } else if (type === 'rooms') {
      headers = ['room_number', 'building', 'capacity'];
      sampleRow = ['104', 'Block B', '3'];
      filename = 'rooms_import_template.csv';
    }

    // Generate CSV string with UTF-8 BOM so Excel opens it with correct encoding
    const csvContent = "\uFEFF" + [
      headers.join(','),
      sampleRow.join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const EXPORTS = [
    { type: 'dashboard-report', title: 'Administrative Report', titleFr: 'Rapport Administratif', titleAr: 'التقرير الإداري الإجمالي', desc: 'Full KPI and operations summary', icon: '📊' },
    { type: 'students', title: 'Students Directory', titleFr: 'Annuaire des Étudiants', titleAr: 'دليل الطلبة والمسكن', desc: 'All students with room assignments', icon: '👨‍🎓' },
    { type: 'tickets', title: 'Maintenance Log', titleFr: 'Rapport de Maintenance', titleAr: 'سجل الصيانة والأعطال', desc: 'All tickets with status and priority', icon: '🔧' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', direction: t.dir, fontFamily: lang === 'ar' ? "'Cairo', sans-serif" : 'inherit' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1a1a14', marginBottom: '6px' }}>{t.title}</h1>
        <p style={{ color: '#8a7f72', fontSize: '13px', lineHeight: '1.5' }}>{t.subtitle}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>

        {/* ── Import Card ─────────────────────────────── */}
        <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e8e2d6', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f5f1ea', background: '#fafaf7', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fce4db', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Upload size={18} style={{ color: '#d45c3c' }} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#1a1a14' }}>{t.importCardTitle}</div>
              <div style={{ fontSize: '12px', color: '#8a7f72', marginTop: '1px' }}>{t.importCardSub}</div>
            </div>
          </div>

          <div style={{ padding: '24px' }}>
            <form onSubmit={handleUpload}>
              
              {/* Type selector */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#6b6456', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px', textAlign: lang === 'ar' ? 'right' : 'left' }}>
                  {t.importTypeLabel}
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {['students', 'rooms'].map(type => (
                    <button
                      key={type} type="button"
                      onClick={() => {
                        setImportType(type);
                        setFile(null);
                        setShowMappingWizard(false);
                      }}
                      style={{
                        flex: 1, padding: '12px', borderRadius: '12px',
                        border: `2px solid ${importType === type ? '#d45c3c' : '#e8e2d6'}`,
                        background: importType === type ? '#fdf3f0' : '#fafaf7',
                        color: importType === type ? '#d45c3c' : '#6b6456',
                        fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                        transition: 'all 0.18s',
                      }}
                    >
                      {type === 'students' ? t.studentsType : t.roomsType}
                    </button>
                  ))}
                </div>
              </div>

              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('fileInput').click()}
                style={{
                  border: `2px dashed ${dragOver ? '#d45c3c' : file ? '#8ea45c' : '#e8e2d6'}`,
                  borderRadius: '14px', padding: '36px 20px',
                  textAlign: 'center', cursor: 'pointer',
                  background: dragOver ? '#fdf3f0' : file ? '#f4f6ec' : '#fafaf7',
                  transition: 'all 0.18s', marginBottom: '20px',
                  boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.02)'
                }}
              >
                <input
                  id="fileInput" type="file" accept=".xlsx,.xls,.csv"
                  style={{ display: 'none' }}
                  onChange={e => handleFileChange(e.target.files[0])}
                />
                <CloudUpload size={36} style={{ color: file ? '#8ea45c' : '#c4bfb5', marginBottom: '10px' }} />
                {parsingFile ? (
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#d45c3c' }}>{t.parsingNotice}</div>
                ) : file ? (
                  <>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#5c651f' }}>{file.name}</div>
                    <div style={{ fontSize: '12px', color: '#8a7f72', marginTop: '5px' }}>{(file.size / 1024).toFixed(1)} KB · {t.dropZoneReady}</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#5a5248' }}>{t.dropZoneDefault}</div>
                    <div style={{ fontSize: '12px', color: '#8a7f72', marginTop: '5px' }}>{t.dropZoneBrowse}</div>
                  </>
                )}
              </div>

              {/* 🧙‍♂️ SMART COLUMN MAPPING WIZARD */}
              {showMappingWizard && (
                <div style={{ marginBottom: '20px', padding: '18px', border: '1.5px solid #c7d6a2', borderRadius: '14px', background: '#f7faf5', textAlign: 'left', animation: 'fadeIn 0.25s ease' }}>
                  <style>{`
                    @keyframes fadeIn {
                      from { opacity: 0; transform: translateY(6px); }
                      to { opacity: 1; transform: translateY(0); }
                    }
                  `}</style>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <Sparkles size={18} style={{ color: '#5c651f' }} />
                    <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#3a4012', margin: 0, display: 'flex', alignItems: 'center', gap: '5px' }}>
                      {t.wizardTitle}
                    </h3>
                  </div>
                  <p style={{ fontSize: '11px', color: '#6b6456', margin: '0 0 14px 0', lineHeight: '1.4' }}>
                    {t.wizardDesc}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {Object.keys(columnMappings).map(field => {
                      const isMapped = columnMappings[field] !== '';
                      return (
                        <div key={field} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: '8px', background: isMapped ? '#ffffff' : '#fff5ee', border: `1px solid ${isMapped ? '#e3ebd0' : '#ffd5bd'}`, gap: '10px' }}>
                          
                          {/* Label and sample */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#1a1a14', textTransform: 'capitalize' }}>
                              {field.replace('_', ' ')}
                              {(field === 'full_name' || field === 'student_number' || field === 'room_number') && <span style={{ color: '#d45c3c', marginLeft: '3px' }}>*</span>}
                            </div>
                            {columnMappings[field] && parsedSample[columnMappings[field]] !== undefined && (
                              <div style={{ fontSize: '10px', color: '#8a7f72', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {t.previewLabel}: <span style={{ color: '#5c651f', fontWeight: '700', fontStyle: 'italic' }}>{parsedSample[columnMappings[field]] !== null ? String(parsedSample[columnMappings[field]]) : 'empty'}</span>
                              </div>
                            )}
                          </div>

                          {/* Selector */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {isMapped ? (
                              <span style={{ fontSize: '9px', background: '#e3ebd0', color: '#5c651f', padding: '2px 5px', borderRadius: '4px', fontWeight: '800' }}>{t.mappedBadge}</span>
                            ) : (
                              <span style={{ fontSize: '9px', background: '#ffebe0', color: '#d45c3c', padding: '2px 5px', borderRadius: '4px', fontWeight: '800' }}>{t.unmappedBadge}</span>
                            )}
                            <select
                              value={columnMappings[field]}
                              onChange={e => setColumnMappings(prev => ({ ...prev, [field]: e.target.value }))}
                              style={{
                                padding: '5px 8px', borderRadius: '6px', border: '1px solid #e8e2d6',
                                fontSize: '11px', background: '#ffffff', outline: 'none', color: '#5a5248',
                                maxWidth: '130px', cursor: 'pointer'
                              }}
                            >
                              <option value="">-- select --</option>
                              {parsedHeaders.map(hdr => (
                                <option key={hdr} value={hdr}>{hdr}</option>
                              ))}
                            </select>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                type="submit" disabled={!file || uploading}
                style={{
                  width: '100%', padding: '13px',
                  borderRadius: '12px', border: 'none',
                  background: !file || uploading ? '#e8e2d6' : '#d45c3c',
                  color: !file || uploading ? '#8a7f72' : '#ffffff',
                  fontSize: '14px', fontWeight: '700',
                  cursor: !file || uploading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: !file || uploading ? 'none' : '0 4px 14px rgba(212,92,60,0.25)'
                }}
                onMouseEnter={e => { if (file && !uploading) e.currentTarget.style.background = '#b84a2e'; }}
                onMouseLeave={e => { if (file && !uploading) e.currentTarget.style.background = '#d45c3c'; }}
              >
                {uploading ? t.uploadBtnProcessing : t.uploadBtnDefault}
              </button>
            </form>

            {error && (
              <div style={{ marginTop: '16px', padding: '14px', borderRadius: '12px', background: '#fdf3f0', color: '#b84a2e', border: '1px solid #f8c7b4', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {result && (
              <div style={{ marginTop: '20px', padding: '20px', borderRadius: '16px', background: '#f6faf0', border: '1px solid #c7d6a2' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '14px', fontWeight: '700', color: '#3a4012' }}>
                  <CheckCircle2 size={18} style={{ color: '#5c651f' }} />
                  <span>{t.successTitle}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center' }}>
                  {[
                    { label: t.insertedLabel, value: result.inserted, color: '#5c651f', bg: '#ffffff' },
                    { label: t.skippedLabel, value: result.skipped, color: '#b8631c', bg: '#ffffff' },
                    { label: t.errorsLabel, value: result.errors?.length || 0, color: '#b84a2e', bg: '#ffffff' },
                  ].map(({ label, value, color, bg }) => (
                    <div key={label} style={{ background: bg, borderRadius: '10px', padding: '14px', border: '1px solid #e8e2d6' }}>
                      <div style={{ fontSize: '26px', fontWeight: '800', color }}>{value}</div>
                      <div style={{ fontSize: '11px', color: '#8a7f72', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '4px' }}>{label}</div>
                    </div>
                  ))}
                </div>

                {result.errors && result.errors.length > 0 && (
                  <div style={{ marginTop: '16px', borderTop: '1px solid #e3ebd0', paddingTop: '14px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#b84a2e', marginBottom: '8px' }}>
                      {t.validationErrorsTitle}
                    </div>
                    <div style={{ maxHeight: '120px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {result.errors.map((err, idx) => (
                        <div key={idx} style={{ fontSize: '11.5px', color: '#8a4030', background: '#fff5f2', padding: '6px 10px', borderRadius: '6px', borderLeft: '3px solid #b84a2e', textAlign: 'left', direction: 'ltr' }}>
                          {err}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>

        {/* ── Export Card ─────────────────────────────── */}
        <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e8e2d6', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f5f1ea', background: '#fafaf7', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#e3ebd0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Download size={18} style={{ color: '#5c651f' }} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#1a1a14' }}>{t.exportCardTitle}</div>
              <div style={{ fontSize: '12px', color: '#8a7f72', marginTop: '1px' }}>{t.exportCardSub}</div>
            </div>
          </div>

          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {EXPORTS.map(({ type, title, titleFr, titleAr, desc, icon }) => (
              <button
                key={type}
                onClick={() => handleDownload(type)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  padding: '16px 20px', borderRadius: '14px',
                  background: '#fafaf7', border: '1.5px solid #e8e2d6',
                  cursor: 'pointer', textAlign: lang === 'ar' ? 'right' : 'left',
                  transition: 'all 0.2s', width: '100%',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#d45c3c'; e.currentTarget.style.background = '#fdf3f0'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8e2d6'; e.currentTarget.style.background = '#fafaf7'; }}
              >
                <div style={{
                  width: '46px', height: '46px', borderRadius: '12px',
                  background: '#f5f1ea', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '24px', flexShrink: 0,
                }}>
                  {icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#1a1a14', marginBottom: '2px' }}>
                    {lang === 'ar' ? titleAr : lang === 'fr' ? titleFr : title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#8a7f72' }}>{desc}</div>
                </div>
                <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#e3ebd0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Download size={16} style={{ color: '#5c651f' }} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── File Preparation Guide & Template Downloads ── */}
      <div style={{ background: '#f7faf5', borderRadius: '20px', border: '1.5px solid #c7d6a2', padding: '26px', boxShadow: '0 4px 15px rgba(92,101,31,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <HelpCircle size={22} style={{ color: '#5c651f' }} />
          <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#3a4012', margin: 0 }}>
            {t.instructionsTitle}
          </h2>
        </div>
        <p style={{ color: '#6b6456', fontSize: '13px', margin: '0 0 20px 0', lineHeight: '1.6' }}>
          {t.instructionsDesc}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          
          {/* Students Template Card */}
          <div style={{ background: '#ffffff', border: '1px solid #e3ebd0', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', justifyBetween: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '18px' }}>👨‍🎓</span>
                <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#1a1a14', margin: 0 }}>{t.studentsInstruct}</h3>
              </div>
              <ul style={{ paddingLeft: lang === 'ar' ? 0 : '18px', paddingRight: lang === 'ar' ? '18px' : 0, margin: '0 0 16px 0', fontSize: '12px', color: '#6b6456', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li><strong>{t.reqFields}:</strong> <code>full_name</code>, <code>student_number</code></li>
                <li><strong>{t.optFields}:</strong> <code>first_name</code>, <code>last_name</code>, <code>email</code>, <code>wilaya</code>, <code>speciality</code>, <code>study_year</code>, <code>phone</code></li>
                <li><strong>{t.examples}:</strong> wilaya (<code>Blida</code>), speciality (<code>Catering</code>), study_year (<code>L3</code>), gender (<code>male</code> / <code>female</code>)</li>
              </ul>
            </div>
            <button 
              onClick={() => downloadTemplate('students')}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '10px 14px', borderRadius: '10px', border: '1px solid #5c651f',
                background: 'transparent', color: '#5c651f', fontSize: '12.5px', fontWeight: '700',
                cursor: 'pointer', transition: 'all 0.15s', marginTop: 'auto'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#e3ebd0'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <FileText size={15} />
              <span>{t.btnDownloadTemplate}</span>
            </button>
          </div>

          {/* Rooms Template Card */}
          <div style={{ background: '#ffffff', border: '1px solid #e3ebd0', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', justifyBetween: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '18px' }}>🏠</span>
                <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#1a1a14', margin: 0 }}>{t.roomsInstruct}</h3>
              </div>
              <ul style={{ paddingLeft: lang === 'ar' ? 0 : '18px', paddingRight: lang === 'ar' ? '18px' : 0, margin: '0 0 16px 0', fontSize: '12px', color: '#6b6456', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li><strong>{t.reqFields}:</strong> <code>room_number</code></li>
                <li><strong>{t.optFields}:</strong> <code>building</code>, <code>capacity</code></li>
                <li><strong>{t.examples}:</strong> room_number (<code>104</code>), building (<code>Block A</code>), capacity (<code>2</code> / <code>3</code>)</li>
              </ul>
            </div>
            <button 
              onClick={() => downloadTemplate('rooms')}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '10px 14px', borderRadius: '10px', border: '1px solid #5c651f',
                background: 'transparent', color: '#5c651f', fontSize: '12.5px', fontWeight: '700',
                cursor: 'pointer', transition: 'all 0.15s', marginTop: 'auto'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#e3ebd0'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <FileText size={15} />
              <span>{t.btnDownloadTemplate}</span>
            </button>
          </div>

        </div>
      </div>

      {alertDialog && <AlertDialog message={alertDialog.message} onClose={() => setAlertDialog(null)} />}
    </div>
  );
}
