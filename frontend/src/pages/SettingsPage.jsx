import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  Settings, UserPlus, Trash2, Edit2, Shield, Globe, 
  X, Check, Lock, Mail, User, ShieldAlert, Search,
  Laptop, Smartphone, MapPin
} from 'lucide-react';
import { ConfirmDialog, AlertDialog } from '../components/CustomDialogs';
const API_ORIGIN = api.defaults.baseURL.replace(/\/api$/, '');

const ST = {
  en: {
    title: "System Settings",
    subtitle: "Configure system options, language preferences, and manage administrator access",
    generalTab: "General Options",
    usersTab: "Staff Accounts & Roles",
    langPref: "Language Preference",
    createBtn: "Create Staff Account",
    colName: "FULL NAME",
    colEmail: "EMAIL ADDRESS",
    colRole: "ROLE / PERMISSION",
    colActions: "ACTIONS",
    modalCreateTitle: "New Staff Account",
    modalEditTitle: "Edit Staff Account",
    labelName: "Full Name",
    placeholderName: "Enter full name",
    labelEmail: "Email Address",
    placeholderEmail: "name@university.edu",
    labelPassword: "Security Password",
    placeholderPassword: "Create secure password",
    labelRole: "System Role / Permissions",
    cancelBtn: "Cancel",
    saveChangesBtn: "Save Changes",
    createAccountBtn: "Create Account",
    confirmDelete: "Are you absolutely sure you want to delete this staff account? They will lose complete system access immediately.",
    roleDirector: "Director (Full Control)",
    roleAdmissions: "Admissions Staff (Students & Rooms)",
    roleMaintenance: "Maintenance Staff (Tickets Only)",
    roleAdmin: "Admin (Full Control)",
    enLabel: "English (EN)",
    enSub: "System interface and reports set to English",
    frLabel: "Français (FR)",
    frSub: "Interface du système et rapports en français",
    arLabel: "العربية (AR)",
    arSub: "تعريب كامل لواجهة النظام والتقارير",
    resetPass: "Reset Password",
    leaveBlank: "(Leave blank to keep current)",
    enterNewPass: "Enter new password",
    toastLangChanged: "Language preference updated successfully!",
    logsTab: "Activity Logs History",
    colAction: "ACTION",
    colDetails: "LOG DESCRIPTION & DETAILS",
    colIp: "IP ADDRESS",
    colTime: "DATE & TIME",
    colUser: "PERFORMED BY",
    searchPlaceholder: "Search logs by action, description, or user...",
    profileTitle: "My Profile Details",
    profileSub: "Update your professional display name, profile avatar, and account security details",
    profileName: "Display Name",
    profileEmail: "Account Email (Non-editable)",
    profileAvatar: "Profile Picture",
    profileAvatarSub: "Click to upload your avatar (JPG, PNG, max 5MB)",
    profilePassword: "New Secure Password",
    profilePasswordSub: "Leave blank to keep your current password",
    profileSaveBtn: "Save Profile Details",
    profileUpdating: "Updating profile...",
    profileSuccess: "Your profile has been updated successfully!",
    adjustTitle: "Adjust Profile Picture",
    adjustSub: "Drag to pan, slide to zoom and rotate your image for a perfect fit",
    adjustZoom: "Zoom",
    adjustRotate: "Rotation",
    adjustSave: "Save Adjustment",
    adjustCancel: "Cancel",
    securityTab: "Security Options",
    autoLogoutLabel: "Automatic Sign Out / Inactivity Timeout",
    autoLogoutSub: "Automatically log out of your account after a period of inactivity to secure your session.",
    timeout3Min: "3 Minutes (Default)",
    timeout1Min: "1 Minute",
    timeout5Min: "5 Minutes",
    timeout10Min: "10 Minutes",
    timeout30Min: "30 Minutes",
    timeoutNever: "Never Disable",
    securitySaveBtn: "Save Security Settings",
    toastSecurityUpdated: "Security preferences updated successfully!",
    enhancedAuditing: "Enhanced Auditing Logs",
    enhancedAuditingSub: "Track and log every page view and interaction (Recommended)",
    confirmDeletes: "Double-confirm critical deletions",
    confirmDeletesSub: "Always prompt before deleting elements from inventory",
    studentsTab: "Student Accounts",
    studentSelectStudent: "Select a student to activate",
    studentPasswordPlaceholder: "Set a secure password",
    studentActivateBtn: "Activate Account",
    studentActive: "Active",
    studentInactive: "Inactive",
    colStudentName: "STUDENT NAME",
    colStudentEmail: "EMAIL",
    colStudentRoom: "ROOM",
    colStudentNumber: "STUDENT ID",
    studentNotFound: "No students available without accounts",
    studentActivatedSuccess: "Student account activated successfully!",
    studentFailed: "Failed to activate student account",
    studentSearch: "Search students by name, email or student number...",
    studentsFetchFailed: "Failed to fetch students",
    studentNoEmail: "No email set",
    resetStudentPwdTitle: "Reset Student Password",
    resetStudentPwdSelect: "Select a student with an existing account",
    resetStudentPwdPlaceholder: "Enter new secure password",
    resetStudentPwdBtn: "Reset Password",
    resetStudentPwdSuccess: "Student password reset successfully!",
    resetStudentPwdFailed: "Failed to reset student password",
  },
  ar: {
    title: "إعدادات النظام",
    subtitle: "تكوين خيارات النظام، تفضيلات اللغة، وإدارة صلاحيات المشرفين",
    generalTab: "خيارات عامة",
    usersTab: "حسابات الموظفين والأدوار",
    langPref: "تفضيل اللغة",
    createBtn: "إنشاء حساب موظف",
    colName: "الاسم الكامل",
    colEmail: "البريد الإلكتروني",
    colRole: "الدور / الصلاحية",
    colActions: "الإجراءات",
    modalCreateTitle: "حساب موظف جديد",
    modalEditTitle: "تعديل حساب الموظف",
    labelName: "الاسم الكامل",
    placeholderName: "أدخل الاسم الكامل",
    labelEmail: "البريد الإلكتروني",
    placeholderEmail: "name@university.edu",
    labelPassword: "كلمة المرور الأمنية",
    placeholderPassword: "أنشئ كلمة مرور آمنة",
    labelRole: "دور النظام / الصلاحيات",
    cancelBtn: "إلغاء",
    saveChangesBtn: "حفظ التغييرات",
    createAccountBtn: "إنشاء الحساب",
    confirmDelete: "هل أنت متأكد تمامًا من رغبتك في حذف حساب الموظف هذا؟ سيفقدون الوصول الكامل إلى النظام فورًا.",
    roleDirector: "المدير (تحكم كامل)",
    roleAdmissions: "موظف القبول والتسجيل (الطلاب والغرف)",
    roleMaintenance: "موظف الصيانة (التذاكر فقط)",
    roleAdmin: "مشرف (تحكم كامل)",
    enLabel: "English (EN)",
    enSub: "System interface and reports set to English",
    frLabel: "Français (FR)",
    frSub: "Interface du système et rapports en français",
    arLabel: "العربية (AR)",
    arSub: "تعريب كامل لواجهة النظام والتقارير",
    resetPass: "إعادة تعيين كلمة المرور",
    leaveBlank: "(اتركه فارغاً للاحتفاظ بكلمة المرور الحالية)",
    enterNewPass: "أدخل كلمة المرور الجديدة",
    toastLangChanged: "تم تحديث تفضيلات اللغة بنجاح!",
    logsTab: "سجل النشاطات",
    colAction: "الإجراء",
    colDetails: "تفاصيل النشاط",
    colIp: "عنوان IP",
    colTime: "التاريخ والوقت",
    colUser: "الموظف المسؤول",
    searchPlaceholder: "البحث في السجلات عن طريق الإجراء، التفاصيل أو اسم الموظف...",
    profileTitle: "تفاصيل ملفي الشخصي",
    profileSub: "تحديث اسمك الكامل، صورتك الشخصية، وتفاصيل أمان الحساب",
    profileName: "الاسم المعروض",
    profileEmail: "البريد الإلكتروني (غير قابل للتعديل)",
    profileAvatar: "الصورة الشخصية",
    profileAvatarSub: "انقر لتحميل صورتك الشخصية (JPG, PNG, بحد أقصى 5 ميجابايت)",
    profilePassword: "كلمة مرور جديدة",
    profilePasswordSub: "اتركه فارغاً للاحتفاظ بكلمة المرور الحالية",
    profileSaveBtn: "حفظ تفاصيل الملف الشخصي",
    profileUpdating: "جاري التحديث...",
    profileSuccess: "تم تحديث ملفك الشخصي بنجاح!",
    adjustTitle: "تعديل الصورة الشخصية",
    adjustSub: "اسحب لتحريك الصورة، واستخدم الأشرطة للتكبير والتدوير لتناسب الإطار",
    adjustZoom: "تكبير",
    adjustRotate: "تدوير",
    adjustSave: "حفظ التعديل",
    adjustCancel: "إلغاء",
    securityTab: "خيارات الأمان",
    autoLogoutLabel: "تسجيل الخروج التلقائي / مهلة الخمول",
    autoLogoutSub: "قم بتسجيل الخروج تلقائياً بعد فترة من الخمول لتأمين جلستك وحماية بياناتك.",
    timeout3Min: "3 دقائق (افتراضي)",
    timeout1Min: "دقيقة واحدة",
    timeout5Min: "5 دقائق",
    timeout10Min: "10 دقائق",
    timeout30Min: "30 دقيقة",
    timeoutNever: "تعطيل الخروج التلقائي",
    securitySaveBtn: "حفظ إعدادات الأمان",
    toastSecurityUpdated: "تم تحديث إعدادات الأمان بنجاح!",
    enhancedAuditing: "سجلات تدقيق معززة",
    enhancedAuditingSub: "تتبع وتسجيل كل زيارة وتفاعل داخل النظام (موصى به)",
    confirmDeletes: "تأكيد مزدوج للإجراءات الحرجة",
    confirmDeletesSub: "طلب تأكيد دائماً قبل حذف العناصر من المخزون",
    studentsTab: "حسابات الطلاب",
    studentSelectStudent: "اختر طالبًا لتفعيل حسابه",
    studentPasswordPlaceholder: "تعيين كلمة مرور آمنة",
    studentActivateBtn: "تفعيل الحساب",
    studentActive: "نشط",
    studentInactive: "غير نشط",
    colStudentName: "اسم الطالب",
    colStudentEmail: "البريد الإلكتروني",
    colStudentRoom: "الغرفة",
    colStudentNumber: "رقم الطالب",
    studentNotFound: "لا يوجد طلاب بدون حسابات",
    studentActivatedSuccess: "تم تفعيل حساب الطالب بنجاح!",
    studentFailed: "فشل تفعيل حساب الطالب",
    studentSearch: "البحث عن طالب بالاسم أو البريد الإلكتروني أو رقم الطالب...",
    studentsFetchFailed: "فشل جلب بيانات الطلاب",
    studentNoEmail: "لا يوجد بريد إلكتروني",
    resetStudentPwdTitle: "إعادة تعيين كلمة مرور الطالب",
    resetStudentPwdSelect: "اختر طالبًا لديه حساب نشط",
    resetStudentPwdPlaceholder: "أدخل كلمة مرور آمنة جديدة",
    resetStudentPwdBtn: "إعادة تعيين",
    resetStudentPwdSuccess: "تم إعادة تعيين كلمة مرور الطالب بنجاح!",
    resetStudentPwdFailed: "فشل إعادة تعيين كلمة مرور الطالب",
  },
  fr: {
    title: "Paramètres du Système",
    subtitle: "Configurez les options du système, les préférences linguistiques et gérez l'accès des administrateurs",
    generalTab: "Options Générales",
    usersTab: "Comptes du Personnel & Rôles",
    langPref: "Préférence Linguistique",
    createBtn: "Créer un compte personnel",
    colName: "NOM COMPLET",
    colEmail: "ADRESSE E-MAIL",
    colRole: "RÔLE / AUTORISATION",
    colActions: "ACTIONS",
    modalCreateTitle: "Nouveau compte de personnel",
    modalEditTitle: "Modifier le compte de personnel",
    labelName: "Nom Complet",
    placeholderName: "Entrez le nom complet",
    labelEmail: "Adresse E-mail",
    placeholderEmail: "name@university.edu",
    labelPassword: "Mot de passe de sécurité",
    placeholderPassword: "Créer un mot de passe sécurisé",
    labelRole: "Rôle du système / Autorisations",
    cancelBtn: "Annuler",
    saveChangesBtn: "Enregistrer les modifications",
    createAccountBtn: "Créer le compte",
    confirmDelete: "Êtes-vous absolument sûr de vouloir supprimer ce compte ? Ils perdront immédiatement tout accès au système.",
    roleDirector: "Directeur (Contrôle total)",
    roleAdmissions: "Personnel des Admissions (Étudiants & Chambres)",
    roleMaintenance: "Personnel de Maintenance (Tickets Uniquement)",
    roleAdmin: "Admin (Contrôle total)",
    enLabel: "English (EN)",
    enSub: "System interface and reports set to English",
    frLabel: "Français (FR)",
    frSub: "Interface du système et rapports en français",
    arLabel: "العربية (AR)",
    arSub: "تعريب كامل لواجهة النظام والتقارير",
    resetPass: "Réinitialiser le mot de passe",
    leaveBlank: "(Laisser vide pour conserver le mot de passe actuel)",
    enterNewPass: "Entrez le nouveau mot de passe",
    toastLangChanged: "Préférence linguistique mise à jour avec succès !",
    logsTab: "Logs d'Activité",
    colAction: "ACTION",
    colDetails: "DÉTAILS & DESCRIPTION",
    colIp: "ADRESSE IP",
    colTime: "DATE & HEURE",
    colUser: "EFFECTUÉ PAR",
    searchPlaceholder: "Rechercher par action, description ou utilisateur...",
    profileTitle: "Détails de mon profil",
    profileSub: "Mettez à jour votre nom d'affichage, votre photo de profil et vos informations de sécurité",
    profileName: "Nom d'affichage",
    profileEmail: "Adresse E-mail (Non modifiable)",
    profileAvatar: "Photo de profil",
    profileAvatarSub: "Cliquez pour télécharger votre avatar (JPG, PNG, max 5 Mo)",
    profilePassword: "Nouveau mot de passe",
    profilePasswordSub: "Laissez vide pour conserver le mot de passe actuel",
    profileSaveBtn: "Enregistrer le profil",
    profileUpdating: "Mise à jour du profil...",
    profileSuccess: "Votre profil a été mis à jour avec succès !",
    adjustTitle: "Ajuster la photo de profil",
    adjustSub: "Faites glisser pour déplacer, zoomez et pivotez pour un ajustement parfait",
    adjustZoom: "Zoom",
    adjustRotate: "Rotation",
    adjustSave: "Confirmer l'ajustement",
    adjustCancel: "Annuler",
    securityTab: "Options de Sécurité",
    autoLogoutLabel: "Déconnexion Automatique / Délai d'Inactivité",
    autoLogoutSub: "Déconnectez-vous automatiquement après une période d'inactivité pour sécuriser votre session.",
    timeout3Min: "3 Minutes (Par défaut)",
    timeout1Min: "1 Minute",
    timeout5Min: "5 Minutes",
    timeout10Min: "10 Minutes",
    timeout30Min: "30 Minutes",
    timeoutNever: "Ne jamais désactiver",
    securitySaveBtn: "Enregistrer les options de sécurité",
    toastSecurityUpdated: "Préférences de sécurité mises à jour avec succès !",
    enhancedAuditing: "Journalisation d'audit améliorée",
    enhancedAuditingSub: "Enregistrer et suivre chaque vue de page et interaction (Recommandé)",
    confirmDeletes: "Double confirmation des suppressions",
    confirmDeletesSub: "Toujours demander confirmation avant de supprimer des éléments",
    studentsTab: "Comptes Étudiants",
    studentSelectStudent: "Sélectionnez un étudiant à activer",
    studentPasswordPlaceholder: "Définir un mot de passe sécurisé",
    studentActivateBtn: "Activer le compte",
    studentActive: "Actif",
    studentInactive: "Inactif",
    colStudentName: "NOM DE L'ÉTUDIANT",
    colStudentEmail: "E-MAIL",
    colStudentRoom: "CHAMBRE",
    colStudentNumber: "NUMÉRO D'ÉTUDIANT",
    studentNotFound: "Aucun étudiant disponible sans compte",
    studentActivatedSuccess: "Compte étudiant activé avec succès !",
    studentFailed: "Échec de l'activation du compte étudiant",
    studentSearch: "Rechercher un étudiant par nom, email ou numéro...",
    studentsFetchFailed: "Échec de la récupération des étudiants",
    studentNoEmail: "Pas d'e-mail défini",
    resetStudentPwdTitle: "Réinitialiser le mot de passe étudiant",
    resetStudentPwdSelect: "Sélectionnez un étudiant avec un compte existant",
    resetStudentPwdPlaceholder: "Entrez un nouveau mot de passe sécurisé",
    resetStudentPwdBtn: "Réinitialiser",
    resetStudentPwdSuccess: "Mot de passe étudiant réinitialisé avec succès !",
    resetStudentPwdFailed: "Échec de la réinitialisation du mot de passe étudiant",
  }
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState(localStorage.getItem('settingsActiveTab') || 'general'); // 'general' or 'users'
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'en');
  const [currentUser, setCurrentUser] = useState(null);
  const t = ST[lang] || ST.en;

  // Security preferences states

  const [inactivityTimeout, setInactivityTimeout] = useState(localStorage.getItem('inactivity_timeout') || '3');
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState({ show: false, sessionId: null });
  const [enhancedAuditing, setEnhancedAuditing] = useState(localStorage.getItem('enhanced_auditing') === 'true');
  const [confirmDeletes, setConfirmDeletes] = useState(localStorage.getItem('confirm_deletes') === 'true');

  // Modals / Dialogs state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'staff' });
  const [editFormData, setEditFormData] = useState({ name: '', email: '', role: 'staff', password: '' });
  
  // Custom dialogs states
  const [confirmDelete, setConfirmDelete] = useState({ show: false, userId: null });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Activity Logs States
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Student Accounts States
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [newStudentPassword, setNewStudentPassword] = useState('');
  const [activatingStudent, setActivatingStudent] = useState(false);
  const [resetPwdStudentId, setResetPwdStudentId] = useState('');
  const [resetPwdValue, setResetPwdValue] = useState('');
  const [resettingPwd, setResettingPwd] = useState(false);

  // Profile management states
  const [profileName, setProfileName] = useState('');
  const [profilePassword, setProfilePassword] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [profileUpdating, setProfileUpdating] = useState(false);

  // Profile picture adjustment states
  const [originalImage, setOriginalImage] = useState('');
  const [showAdjuster, setShowAdjuster] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setCurrentUser(parsed);
        setProfileName(parsed.name || '');
        if (parsed.avatar) {
          setAvatarPreview(parsed.avatar.startsWith('http') ? parsed.avatar : API_ORIGIN + parsed.avatar);
        }
      } catch (err) {
        console.error('Failed to parse user storage:', err);
      }
    }
    fetchUsers();

    if (localStorage.getItem('langChanged') === 'true') {
      const currentLang = localStorage.getItem('lang') || 'en';
      const msg = ST[currentLang]?.toastLangChanged || ST.en.toastLangChanged;
      showToast(msg, 'success');
      localStorage.removeItem('langChanged');
    }
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!profileName.trim()) {
      showToast('Name cannot be empty.', 'warning');
      return;
    }

    setProfileUpdating(true);
    try {
      const formData = new FormData();
      formData.append('name', profileName);
      if (profilePassword.trim()) {
        formData.append('password', profilePassword);
      }
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const res = await api.put('/auth/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const updatedUser = res.data.user;

      // Update local storage user details
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const newUserObj = { ...storedUser, name: updatedUser.name, avatar: updatedUser.avatar };
      localStorage.setItem('user', JSON.stringify(newUserObj));

      // Update react states
      setCurrentUser(newUserObj);
      setProfilePassword('');
      setAvatarFile(null);
      if (updatedUser.avatar) {
        setAvatarPreview(updatedUser.avatar.startsWith('http') ? updatedUser.avatar : API_ORIGIN + updatedUser.avatar);
      }

      showToast(t.profileSuccess || 'Profile updated successfully!', 'success');

      // Dispatch custom event to notify Navbar/Sidebar to update immediately
      window.dispatchEvent(new Event('userProfileUpdated'));

      // Also reload slightly after to guarantee state synchronization
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.error || 'Failed to update profile.', 'danger');
    } finally {
      setProfileUpdating(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image file size must be less than 5MB.', 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setOriginalImage(reader.result);
        setZoom(1);
        setRotation(0);
        setPanX(0);
        setPanY(0);
        setShowAdjuster(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPanX(e.clientX - dragStart.x);
    setPanY(e.clientY - dragStart.y);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - panX, y: e.touches[0].clientY - panY });
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPanX(e.touches[0].clientX - dragStart.x);
    setPanY(e.touches[0].clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSaveAdjustment = () => {
    const img = new Image();
    img.src = originalImage;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');

      // Fill background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 300, 300);

      ctx.save();
      // Translate to canvas center
      ctx.translate(150, 150);

      // Apply Panning in unscaled canvas space (1.5x scaling factor because viewport is 200px and canvas is 300px)
      const scaleFactor = 300 / 200;
      ctx.translate(panX * scaleFactor, panY * scaleFactor);

      // Apply rotation
      ctx.rotate((rotation * Math.PI) / 180);

      // Apply zoom
      ctx.scale(zoom, zoom);

      // Calculate size to draw
      const drawWidth = (img.width / img.height) > 1 ? 200 * (img.width / img.height) : 200;
      const drawHeight = (img.width / img.height) > 1 ? 200 : 200 * (img.height / img.width);

      // Draw centering the image
      ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);

      ctx.restore();

      canvas.toBlob((blob) => {
        const file = new File([blob], 'cropped-avatar.png', { type: 'image/png' });
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(blob));
        setShowAdjuster(false);
      }, 'image/png');
    };
  };

  const handleLangChange = (newLang) => {
    setLang(newLang);
    localStorage.setItem('lang', newLang);
    localStorage.setItem('langChanged', 'true');
    // Reload to apply language change globally across AdminLayout
    window.location.reload();
  };

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    localStorage.setItem('settingsActiveTab', tabName);
  };

  const handleSecuritySave = (e) => {
    e.preventDefault();
    localStorage.setItem('inactivity_timeout', inactivityTimeout);
    localStorage.setItem('enhanced_auditing', enhancedAuditing.toString());
    localStorage.setItem('confirm_deletes', confirmDeletes.toString());
    showToast(t.toastSecurityUpdated, 'success');
    window.dispatchEvent(new Event('securitySettingsUpdated'));
  };

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await api.get('/auth/logs');
      setLogs(res.data);
    } catch (err) {
      console.error('Failed to load activity logs:', err);
    } finally {
      setLogsLoading(false);
    }
  };

  const fetchStudents = async () => {
    setStudentsLoading(true);
    try {
      const res = await api.get('/students');
      setStudents(res.data);
    } catch (err) {
      console.error('Failed to load students:', err);
      showToast(t.studentsFetchFailed, 'danger');
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleActivateStudent = async () => {
    if (!selectedStudentId || !newStudentPassword.trim()) {
      showToast(t.studentSelectStudent, 'warning');
      return;
    }
    setActivatingStudent(true);
    try {
      await api.post('/auth/student-register', {
        student_id: selectedStudentId,
        password: newStudentPassword,
      });
      setSelectedStudentId('');
      setNewStudentPassword('');
      showToast(t.studentActivatedSuccess, 'success');
      fetchStudents();
    } catch (err) {
      showToast(err.response?.data?.error || t.studentFailed, 'danger');
    } finally {
      setActivatingStudent(false);
    }
  };

  const handleResetStudentPassword = async () => {
    if (!resetPwdStudentId || !resetPwdValue.trim()) {
      showToast(t.resetStudentPwdSelect, 'warning');
      return;
    }
    setResettingPwd(true);
    try {
      await api.put(`/auth/students/${resetPwdStudentId}/password`, { new_password: resetPwdValue });
      setResetPwdStudentId('');
      setResetPwdValue('');
      showToast(t.resetStudentPwdSuccess, 'success');
      fetchStudents();
    } catch (err) {
      showToast(err.response?.data?.error || t.resetStudentPwdFailed, 'danger');
    } finally {
      setResettingPwd(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'security') {
      fetchSessions();
    }
    if (activeTab === 'logs') {
      fetchLogs();
    }
    if (activeTab === 'students') {
      fetchStudents();
    }
  }, [activeTab]);

  const fetchSessions = async () => {
    setSessionsLoading(true);
    try {
      const res = await api.get('/auth/sessions');
      setSessions(res.data);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setSessionsLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId) => {
    try {
      await api.post('/auth/revoke-session', { sessionId });
      fetchSessions();
      showToast('Session revoked successfully.', 'success');
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.error || 'Failed to revoke session.', 'danger');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      showToast('All fields are required to create a staff account.', 'warning');
      return;
    }
    try {
      await api.post('/auth/users', formData);
      setFormData({ name: '', email: '', password: '', role: 'staff' });
      setShowCreateModal(false);
      fetchUsers();
      showToast('Staff account has been created successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to create staff account.', 'danger');
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: '' // Optional password reset
    });
    setShowEditModal(true);
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/auth/users/${selectedUser.id}`, editFormData);
      setShowEditModal(false);
      fetchUsers();
      // If editing own account, update localStorage + state immediately
      if (currentUser && selectedUser.id === currentUser.id) {
        const updated = { ...currentUser, name: editFormData.name, role: editFormData.role };
        localStorage.setItem('user', JSON.stringify(updated));
        setCurrentUser(updated);
        window.dispatchEvent(new Event('userProfileUpdated'));
      }
      showToast(res.data?.message || 'Account details have been modified successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to modify account.', 'danger');
    }
  };

  const handleDeleteClick = (id) => {
    if (currentUser && currentUser.id === id) {
      showToast('You cannot delete your own active Director account.', 'warning');
      return;
    }
    setConfirmDelete({ show: true, userId: id });
  };

  const executeDelete = async () => {
    try {
      await api.delete(`/auth/users/${confirmDelete.userId}`);
      setConfirmDelete({ show: false, userId: null });
      fetchUsers();
      showToast('Staff account has been removed permanently.', 'success');
    } catch (err) {
      setConfirmDelete({ show: false, userId: null });
      showToast(err.response?.data?.error || 'Failed to delete user account.', 'danger');
    }
  };

  const isDirector = currentUser?.role === 'director' || currentUser?.role === 'admin';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#1a1a14', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: '#fce4db', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Settings size={18} style={{ color: '#d45c3c' }} />
          </span>
          {t.title}
        </h1>
        <p style={{ color: '#8a7f72', fontSize: '13px' }}>
          {t.subtitle}
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid #e8e2d6', pb: '12px' }}>
        <button 
          onClick={() => handleTabChange('general')}
          style={{
            padding: '8px 16px', borderRadius: '8px', border: 'none',
            fontSize: '13px', fontWeight: '700', cursor: 'pointer',
            background: activeTab === 'general' ? '#1a1e0f' : 'transparent',
            color: activeTab === 'general' ? '#fff' : '#6b6456',
            transition: 'all 0.15s'
          }}
        >
          {t.generalTab}
        </button>
        <button 
          onClick={() => handleTabChange('security')}
          style={{
            padding: '8px 16px', borderRadius: '8px', border: 'none',
            fontSize: '13px', fontWeight: '700', cursor: 'pointer',
            background: activeTab === 'security' ? '#1a1e0f' : 'transparent',
            color: activeTab === 'security' ? '#fff' : '#6b6456',
            transition: 'all 0.15s'
          }}
        >
          {t.securityTab}
        </button>
        {isDirector && (
          <>
            <button 
              onClick={() => handleTabChange('users')}
              style={{
                padding: '8px 16px', borderRadius: '8px', border: 'none',
                fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                background: activeTab === 'users' ? '#1a1e0f' : 'transparent',
                color: activeTab === 'users' ? '#fff' : '#6b6456',
                transition: 'all 0.15s'
              }}
            >
              {t.usersTab}
            </button>
            <button 
              onClick={() => handleTabChange('logs')}
              style={{
                padding: '8px 16px', borderRadius: '8px', border: 'none',
                fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                background: activeTab === 'logs' ? '#1a1e0f' : 'transparent',
                color: activeTab === 'logs' ? '#fff' : '#6b6456',
                transition: 'all 0.15s'
              }}
            >
              {t.logsTab}
            </button>
            <button 
              onClick={() => handleTabChange('students')}
              style={{
                padding: '8px 16px', borderRadius: '8px', border: 'none',
                fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                background: activeTab === 'students' ? '#1a1e0f' : 'transparent',
                color: activeTab === 'students' ? '#fff' : '#6b6456',
                transition: 'all 0.15s'
              }}
            >
              {t.studentsTab}
            </button>
          </>
        )}
      </div>

      {/* Content tabs */}
      {activeTab === 'general' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Profile Section */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e8e2d6', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#1a1a14', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <User size={18} style={{ color: '#d45c3c' }} />
              {t.profileTitle}
            </h2>
            <p style={{ color: '#8a7f72', fontSize: '12px', marginBottom: '24px' }}>
              {t.profileSub}
            </p>

            <form onSubmit={handleProfileUpdate} style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
              
              {/* Left Side: Avatar Upload */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', minWidth: '180px', flex: '1' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#6b6456', alignSelf: 'flex-start' }}>{t.profileAvatar}</label>
                <div style={{ position: 'relative', width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', border: '2px dashed #d45c3c', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafaf7', cursor: 'pointer' }}>
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#8a7f72' }}>
                      <User size={36} style={{ color: '#c4bfb5' }} />
                    </div>
                  )}
                  <input 
                    type="file" 
                    onChange={handleAvatarChange}
                    accept="image/*"
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} 
                  />
                </div>
                <span style={{ fontSize: '11px', color: '#8a7f72', textAlign: 'center', maxWidth: '160px' }}>
                  {t.profileAvatarSub}
                </span>
              </div>

              {/* Right Side: Form Inputs */}
              <div style={{ flex: '3', minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#6b6456' }}>{t.profileName}</label>
                  <div style={{ position: 'relative' }}>
                    <User size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#c4bfb5' }} />
                    <input 
                      type="text" 
                      value={profileName} 
                      onChange={e => setProfileName(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '10px', border: '1px solid #e8e2d6', outline: 'none', fontSize: '13px', color: '#1a1a14' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#6b6456' }}>{t.profileEmail}</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#c4bfb5' }} />
                    <input 
                      type="text" 
                      value={currentUser?.email || ''} 
                      disabled
                      style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '10px', border: '1px solid #e8e2d6', outline: 'none', fontSize: '13px', background: '#fafaf7', color: '#8a7f72', cursor: 'not-allowed' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#6b6456' }}>{t.profilePassword} <span style={{ fontWeight: 'normal', color: '#8a7f72' }}>{t.profilePasswordSub}</span></label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#c4bfb5' }} />
                    <input 
                      type="password" 
                      value={profilePassword} 
                      onChange={e => setProfilePassword(e.target.value)}
                      placeholder="••••••••"
                      style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '10px', border: '1px solid #e8e2d6', outline: 'none', fontSize: '13px', color: '#1a1a14' }}
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={profileUpdating}
                  style={{
                    alignSelf: 'flex-start',
                    marginTop: '8px',
                    padding: '10px 20px', borderRadius: '10px', border: 'none',
                    background: '#1a1e0f', color: '#fff', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s',
                    opacity: profileUpdating ? '0.7' : '1'
                  }}
                  onMouseEnter={e => !profileUpdating && (e.currentTarget.style.background = '#d45c3c')}
                  onMouseLeave={e => !profileUpdating && (e.currentTarget.style.background = '#1a1e0f')}
                >
                  {profileUpdating ? t.profileUpdating : t.profileSaveBtn}
                </button>

              </div>

            </form>
          </div>

          {/* Language Preference Section */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e8e2d6', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#1a1a14', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Globe size={18} style={{ color: '#d45c3c' }} />
              {t.langPref}
            </h2>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div 
                onClick={() => handleLangChange('en')}
                style={{
                  flex: 1, minWidth: '140px', padding: '20px', borderRadius: '12px', border: `2px solid ${lang === 'en' ? '#d45c3c' : '#e8e2d6'}`,
                  background: lang === 'en' ? '#fdf7f5' : '#fff', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s'
                }}
              >
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#1a1a14', marginBottom: '6px' }}>{t.enLabel}</div>
                <div style={{ fontSize: '11px', color: '#8a7f72' }}>{t.enSub}</div>
              </div>

              <div 
                onClick={() => handleLangChange('fr')}
                style={{
                  flex: 1, minWidth: '140px', padding: '20px', borderRadius: '12px', border: `2px solid ${lang === 'fr' ? '#d45c3c' : '#e8e2d6'}`,
                  background: lang === 'fr' ? '#fdf7f5' : '#fff', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s'
                }}
              >
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#1a1a14', marginBottom: '6px' }}>{t.frLabel}</div>
                <div style={{ fontSize: '11px', color: '#8a7f72' }}>{t.frSub}</div>
              </div>

              <div 
                onClick={() => handleLangChange('ar')}
                style={{
                  flex: 1, minWidth: '140px', padding: '20px', borderRadius: '12px', border: `2px solid ${lang === 'ar' ? '#d45c3c' : '#e8e2d6'}`,
                  background: lang === 'ar' ? '#fdf7f5' : '#fff', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s'
                }}
              >
                <div style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'Cairo', color: '#1a1a14', marginBottom: '6px' }}>{t.arLabel}</div>
                <div style={{ fontSize: '11px', color: '#8a7f72' }}>{t.arSub}</div>
              </div>
            </div>
          </div>

        </div>
      )}

      {activeTab === 'security' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1a1a14', marginBottom: '8px' }}>{t.securityTab}</h2>
          {/* Inactivity Timeout */}
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e8e2d6', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a14', marginBottom: '8px' }}>{t.autoLogoutLabel}</h3>
            <p style={{ color: '#8a7f72', fontSize: '12.5px', marginBottom: '12px' }}>{t.autoLogoutSub}</p>
            <select
              value={inactivityTimeout}
              onChange={(e) => setInactivityTimeout(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e8e2d6', background: '#fff', fontSize: '13px' }}
            >
              <option value="1">{t.timeout1Min}</option>
              <option value="3">{t.timeout3Min}</option>
              <option value="5">{t.timeout5Min}</option>
              <option value="10">{t.timeout10Min}</option>
              <option value="30">{t.timeout30Min}</option>
              <option value="0">{t.timeoutNever}</option>
            </select>
          </div>
          {/* Enhanced Auditing */}
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e8e2d6', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a14', marginBottom: '8px' }}>{t.enhancedAuditing}</h3>
            <p style={{ color: '#8a7f72', fontSize: '12.5px', marginBottom: '12px' }}>{t.enhancedAuditingSub}</p>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input type="checkbox" checked={enhancedAuditing} onChange={(e) => setEnhancedAuditing(e.target.checked)} style={{ marginRight: '8px' }} />
              {enhancedAuditing ? 'Enabled' : 'Disabled'}
            </label>
          </div>
          {/* Confirm Deletes */}
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e8e2d6', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a14', marginBottom: '8px' }}>{t.confirmDeletes}</h3>
            <p style={{ color: '#8a7f72', fontSize: '12.5px', marginBottom: '12px' }}>{t.confirmDeletesSub}</p>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input type="checkbox" checked={confirmDeletes} onChange={(e) => setConfirmDeletes(e.target.checked)} style={{ marginRight: '8px' }} />
              {confirmDeletes ? 'Enabled' : 'Disabled'}
            </label>
          </div>
          {/* Active Sessions */}
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e8e2d6', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginTop: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a14', marginBottom: '8px' }}>Active Sessions</h3>
            {sessionsLoading ? (
              <div style={{ color: '#8a7f72', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 0' }}>
                <span className="animate-spin" style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid #8a7f72', borderTopColor: 'transparent', borderRadius: '50%' }}></span>
                Loading sessions...
              </div>
            ) : sessions.length === 0 ? (
              <div style={{ color: '#8a7f72', padding: '12px 0' }}>No active sessions found.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                {sessions.map((s) => {
                  const isCurrent = s.is_current;
                  const isMobile = /iphone|ipad|ipod|android/i.test(s.os || '');
                  const DeviceIcon = isMobile ? Smartphone : Laptop;
                  const formattedIp = s.ip === '::1' ? '127.0.0.1 (Localhost)' : s.ip;
                  
                  return (
                    <div 
                      key={s.id} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        padding: '14px 16px', 
                        background: isCurrent ? '#f9faf6' : '#fff', 
                        border: isCurrent ? '1px solid #d0deb9' : '1px solid #e8e2d6', 
                        borderRadius: '10px',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '8px', 
                          background: isCurrent ? '#eef4e4' : '#fafaf7', 
                          color: isCurrent ? '#6d8c40' : '#8a7f72', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center' 
                        }}>
                          <DeviceIcon size={20} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: '700', color: '#1a1a14', fontSize: '14px' }}>
                              {s.browser} on {s.os || 'Unknown OS'}
                            </span>
                            {isCurrent && (
                              <span style={{ 
                                background: '#edf7ed', 
                                color: '#1e4620', 
                                fontSize: '10.5px', 
                                fontWeight: '700', 
                                padding: '2px 8px', 
                                borderRadius: '12px',
                                border: '1px solid #c8e6c9',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>
                                <span style={{ width: '5px', height: '5px', background: '#2e7d32', borderRadius: '50%', display: 'inline-block' }}></span>
                                Current Device
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', marginTop: '4px', fontSize: '12px', color: '#8a7f72' }}>
                            <span>IP: <strong style={{ color: '#5a5045' }}>{formattedIp}</strong></span>
                            <span style={{ color: '#ccc' }}>•</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <MapPin size={12} style={{ color: '#ac9e8c' }} />
                              {s.location || 'Unknown Location'}
                            </span>
                            <span style={{ color: '#ccc' }}>•</span>
                            <span>Last active: {new Date(s.last_active).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        {isCurrent ? (
                          <span style={{ fontSize: '12px', color: '#8a7f72', fontWeight: '500', paddingRight: '8px' }}>
                            Active
                          </span>
                        ) : (
                          <button 
                            onClick={() => setConfirmRevoke({ show: true, sessionId: s.id })} 
                            style={{ 
                              background: 'transparent', 
                              color: '#d45c3c', 
                              border: '1px solid #e8c4b9', 
                              borderRadius: '6px', 
                              padding: '6px 12px', 
                              fontSize: '12.5px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = '#d45c3c';
                              e.currentTarget.style.color = '#fff';
                              e.currentTarget.style.borderColor = '#d45c3c';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = '#d45c3c';
                              e.currentTarget.style.borderColor = '#e8c4b9';
                            }}
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <button
            onClick={handleSecuritySave}
            style={{
              padding: '12px 20px', background: '#1a1e0f', color: '#fff', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', alignSelf: 'flex-start',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#d45c3c'}
            onMouseLeave={e => e.currentTarget.style.background = '#1a1e0f'}
          >
            {t.securitySaveBtn}
          </button>
        </div>
      )}

      {activeTab === 'users' && isDirector && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Action bar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              onClick={() => setShowCreateModal(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 18px', borderRadius: '10px',
                background: '#1a1e0f', color: '#fff', border: 'none',
                fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#d45c3c'}
              onMouseLeave={e => e.currentTarget.style.background = '#1a1e0f'}
            >
              <UserPlus size={15} />
              {t.createBtn}
            </button>
          </div>

          {/* Table */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e8e2d6', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '3px solid #f0ede4', borderTop: '3px solid #d45c3c', animation: 'spin 0.8s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#fafaf7', borderBottom: '1px solid #e8e2d6' }}>
                    <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#8a7f72', textTransform: 'uppercase' }}>{t.colName}</th>
                    <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#8a7f72', textTransform: 'uppercase' }}>{t.colEmail}</th>
                    <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#8a7f72', textTransform: 'uppercase' }}>{t.colRole}</th>
                    <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#8a7f72', textTransform: 'uppercase', textAlign: 'right' }}>{t.colActions}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #f5f1ea', transition: 'background 0.15s' }}>
                      <td style={{ padding: '16px 20px', fontSize: '13px', fontWeight: '700', color: '#1a1a14' }}>{u.name}</td>
                      <td style={{ padding: '16px 20px', fontSize: '13px', color: '#6b6456' }}>{u.email}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px',
                          padding: '4px 8px', borderRadius: '6px',
                          background: u.role === 'director' ? '#fce4db' : u.role === 'admissions' ? '#e3ebd0' : '#fef0df',
                          color: u.role === 'director' ? '#d45c3c' : u.role === 'admissions' ? '#5c651f' : '#b8631c'
                        }}>
                          {u.role === 'director' ? t.roleDirector : u.role === 'admissions' ? t.roleAdmissions : t.roleMaintenance}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button 
                            onClick={() => handleEditClick(u)}
                            style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1px solid #e8e2d6', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = '#d45c3c'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = '#e8e2d6'}
                          >
                            <Edit2 size={13} style={{ color: '#8a7f72' }} />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(u.id)}
                            style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1px solid #e8e2d6', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = '#d45c3c'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = '#e8e2d6'}
                          >
                            <Trash2 size={13} style={{ color: '#d45c3c' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {activeTab === 'logs' && isDirector && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Search bar & Filter */}
          <div style={{ display: 'flex', gap: '12px', background: '#ffffff', padding: '16px', borderRadius: '14px', border: '1px solid #e8e2d6', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8a7f72' }} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                style={{
                  width: '100%', padding: '10px 12px 10px 38px', borderRadius: '10px',
                  border: '1px solid #e8e2d6', outline: 'none', fontSize: '13px',
                  fontFamily: lang === 'ar' ? 'Cairo' : 'inherit'
                }}
              />
            </div>
          </div>

          {/* Table Container */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e8e2d6', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            {logsLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '250px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '3px solid #f0ede4', borderTop: '3px solid #d45c3c', animation: 'spin 0.8s linear infinite' }} />
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: lang === 'ar' ? 'right' : 'left' }} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                  <thead>
                    <tr style={{ background: '#fafaf7', borderBottom: '1px solid #e8e2d6' }}>
                      <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#8a7f72', fontFamily: lang === 'ar' ? 'Cairo' : 'inherit' }}>{t.colTime}</th>
                      <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#8a7f72', fontFamily: lang === 'ar' ? 'Cairo' : 'inherit' }}>{t.colUser}</th>
                      <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#8a7f72', fontFamily: lang === 'ar' ? 'Cairo' : 'inherit' }}>{t.colAction}</th>
                      <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#8a7f72', fontFamily: lang === 'ar' ? 'Cairo' : 'inherit' }}>{t.colDetails}</th>
                      <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#8a7f72', fontFamily: lang === 'ar' ? 'Cairo' : 'inherit' }}>{t.colIp}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs
                      .filter(log => {
                        const term = searchQuery.toLowerCase();
                        return (
                          (log.user_name || '').toLowerCase().includes(term) ||
                          (log.user_email || '').toLowerCase().includes(term) ||
                          (log.action || '').toLowerCase().includes(term) ||
                          (log.details || '').toLowerCase().includes(term) ||
                          (log.ip_address || '').toLowerCase().includes(term)
                        );
                      })
                      .map(log => (
                        <tr key={log.id} style={{ borderBottom: '1px solid #f5f1ea', transition: 'all 0.1s' }} onMouseEnter={e => e.currentTarget.style.background = '#fafaf7'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ padding: '14px 20px', fontSize: '13px', color: '#6b6456', whiteSpace: 'nowrap' }}>
                            {new Date(log.created_at).toLocaleString(lang === 'ar' ? 'ar-DZ' : lang === 'fr' ? 'fr-FR' : 'en-US')}
                          </td>
                          <td style={{ padding: '14px 20px', fontSize: '13px' }}>
                            <div style={{ fontWeight: '700', color: '#1a1a14' }}>{log.user_name || 'System'}</div>
                            <div style={{ fontSize: '11px', color: '#8a7f72' }}>{log.user_email || ''}</div>
                          </td>
                          <td style={{ padding: '14px 20px', fontSize: '13px', fontWeight: '700' }}>
                            <span style={{
                              padding: '4px 8px', borderRadius: '6px', fontSize: '11px',
                              background: log.action === 'Login' ? '#e2f0d9' : log.action.includes('Delete') ? '#fce4db' : '#fef2cb',
                              color: log.action === 'Login' ? '#385723' : log.action.includes('Delete') ? '#c55a11' : '#7f6000'
                            }}>
                              {log.action}
                            </span>
                          </td>
                          <td style={{ padding: '14px 20px', fontSize: '13px', color: '#4a443a', maxWidth: '300px', wordBreak: 'break-word' }}>
                            {log.details}
                          </td>
                          <td style={{ padding: '14px 20px', fontSize: '13px', color: '#8a7f72', fontFamily: 'monospace' }}>
                            {log.ip_address || '—'}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'students' && isDirector && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Activation Form */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e8e2d6', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#1a1a14', marginBottom: '4px' }}>{t.studentSelectStudent}</h2>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 250px' }}>
                <select
                  value={selectedStudentId}
                  onChange={e => setSelectedStudentId(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e8e2d6', outline: 'none', fontSize: '13px', background: '#fff', fontFamily: lang === 'ar' ? 'Cairo' : 'inherit' }}
                >
                  <option value="">-- {t.studentSelectStudent} --</option>
                  {students
                    .filter(s => !s.has_password)
                    .map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.email || s.student_number || t.studentNoEmail})</option>
                    ))}
                </select>
              </div>
              <div style={{ flex: '1 1 200px' }}>
                <input
                  type="password"
                  value={newStudentPassword}
                  onChange={e => setNewStudentPassword(e.target.value)}
                  placeholder={t.studentPasswordPlaceholder}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e8e2d6', outline: 'none', fontSize: '13px' }}
                />
              </div>
              <button
                onClick={handleActivateStudent}
                disabled={activatingStudent}
                style={{
                  padding: '10px 18px', borderRadius: '10px', border: 'none',
                  background: activatingStudent ? '#8a7f72' : '#1a1e0f', color: '#fff',
                  fontSize: '13px', fontWeight: '700', cursor: activatingStudent ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s', whiteSpace: 'nowrap'
                }}
                onMouseEnter={e => { if (!activatingStudent) e.currentTarget.style.background = '#d45c3c'; }}
                onMouseLeave={e => { if (!activatingStudent) e.currentTarget.style.background = '#1a1e0f'; }}
              >
                {activatingStudent ? '...' : t.studentActivateBtn}
              </button>
            </div>
          </div>

          {/* Reset Password Card */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e8e2d6', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#1a1a14', marginBottom: '4px' }}>{t.resetStudentPwdTitle}</h2>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 250px' }}>
                <select
                  value={resetPwdStudentId}
                  onChange={e => setResetPwdStudentId(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e8e2d6', outline: 'none', fontSize: '13px', background: '#fff', fontFamily: lang === 'ar' ? 'Cairo' : 'inherit' }}
                >
                  <option value="">-- {t.resetStudentPwdSelect} --</option>
                  {students
                    .filter(s => s.has_password)
                    .map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.email || s.student_number || t.studentNoEmail})</option>
                    ))}
                </select>
              </div>
              <div style={{ flex: '1 1 200px' }}>
                <input
                  type="password"
                  value={resetPwdValue}
                  onChange={e => setResetPwdValue(e.target.value)}
                  placeholder={t.resetStudentPwdPlaceholder}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e8e2d6', outline: 'none', fontSize: '13px' }}
                />
              </div>
              <button
                onClick={handleResetStudentPassword}
                disabled={resettingPwd}
                style={{
                  padding: '10px 18px', borderRadius: '10px', border: 'none',
                  background: resettingPwd ? '#8a7f72' : '#b8631c', color: '#fff',
                  fontSize: '13px', fontWeight: '700', cursor: resettingPwd ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s', whiteSpace: 'nowrap'
                }}
                onMouseEnter={e => { if (!resettingPwd) e.currentTarget.style.background = '#d45c3c'; }}
                onMouseLeave={e => { if (!resettingPwd) e.currentTarget.style.background = '#b8631c'; }}
              >
                {resettingPwd ? '...' : t.resetStudentPwdBtn}
              </button>
            </div>
          </div>

          {/* Students Table */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e8e2d6', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e8e2d6' }}>
              <input
                type="text"
                value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)}
                placeholder={t.studentSearch}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e8e2d6', outline: 'none', fontSize: '13px', fontFamily: lang === 'ar' ? 'Cairo' : 'inherit' }}
              />
            </div>
            {studentsLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '3px solid #f0ede4', borderTop: '3px solid #d45c3c', animation: 'spin 0.8s linear infinite' }} />
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: lang === 'ar' ? 'right' : 'left' }} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                  <thead>
                    <tr style={{ background: '#fafaf7', borderBottom: '1px solid #e8e2d6' }}>
                      <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '700', color: '#8a7f72', textTransform: 'uppercase' }}>{t.colStudentName}</th>
                      <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '700', color: '#8a7f72', textTransform: 'uppercase' }}>{t.colStudentEmail}</th>
                      <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '700', color: '#8a7f72', textTransform: 'uppercase' }}>{t.colStudentNumber}</th>
                      <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '700', color: '#8a7f72', textTransform: 'uppercase' }}>{t.colStudentRoom}</th>
                      <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '700', color: '#8a7f72', textTransform: 'uppercase' }}>{t.colStatus}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students
                      .filter(s => {
                        const q = studentSearch.toLowerCase();
                        return !q || (s.name || '').toLowerCase().includes(q) || (s.email || '').toLowerCase().includes(q) || (s.student_number || '').toLowerCase().includes(q);
                      })
                      .map(s => (
                        <tr key={s.id} style={{ borderBottom: '1px solid #f5f1ea', transition: 'all 0.1s' }} onMouseEnter={e => e.currentTarget.style.background = '#fafaf7'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ padding: '14px 20px', fontSize: '13px', fontWeight: '700', color: '#1a1a14' }}>{s.name}</td>
                          <td style={{ padding: '14px 20px', fontSize: '13px', color: '#6b6456' }}>{s.email || t.studentNoEmail}</td>
                          <td style={{ padding: '14px 20px', fontSize: '13px', color: '#6b6456' }}>{s.student_number || '-'}</td>
                          <td style={{ padding: '14px 20px', fontSize: '13px', color: '#6b6456' }}>{s.room_number || '-'}</td>
                          <td style={{ padding: '14px 20px' }}>
                            <span style={{
                              fontSize: '11px', fontWeight: '700',
                              padding: '4px 10px', borderRadius: '6px',
                              background: s.has_password ? '#e2f0d9' : '#fce4db',
                              color: s.has_password ? '#385723' : '#c55a11',
                            }}>
                              {s.has_password ? t.studentActive : t.studentInactive}
                            </span>
                          </td>
                        </tr>
                      ))}
                    {students.length === 0 && (
                      <tr>
                        <td colSpan="5" style={{ padding: '40px 20px', textAlign: 'center', color: '#8a7f72', fontSize: '13px' }}>{t.studentNotFound}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── CREATE USER MODAL ── */}
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(26,30,15,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#ffffff', borderRadius: '18px', width: '440px', border: '1px solid #e8e2d6', boxShadow: '0 24px 64px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f5f1ea', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#1a1a14', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <UserPlus size={18} style={{ color: '#d45c3c' }} />
                {t.modalCreateTitle}
              </h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8a7f72' }}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#6b6456' }}>{t.labelName}</label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#c4bfb5' }} />
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t.placeholderName}
                    style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '10px', border: '1px solid #e8e2d6', outline: 'none', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#6b6456' }}>{t.labelEmail}</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#c4bfb5' }} />
                  <input 
                    type="email" 
                    value={formData.email} 
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder={t.placeholderEmail}
                    style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '10px', border: '1px solid #e8e2d6', outline: 'none', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#6b6456' }}>{t.labelPassword}</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#c4bfb5' }} />
                  <input 
                    type="password" 
                    value={formData.password} 
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    placeholder={t.placeholderPassword}
                    style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '10px', border: '1px solid #e8e2d6', outline: 'none', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#6b6456' }}>{t.labelRole}</label>
                <select 
                  value={formData.role} 
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e8e2d6', outline: 'none', fontSize: '13px', background: '#fff' }}
                >
                  <option value="director">{t.roleDirector}</option>
                  <option value="admissions">{t.roleAdmissions}</option>
                  <option value="maintenance">{t.roleMaintenance}</option>
                </select>
              </div>

              <button 
                type="submit"
                style={{
                  marginTop: '10px', padding: '12px', borderRadius: '10px', border: 'none',
                  background: '#1a1e0f', color: '#fff', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#d45c3c'}
                onMouseLeave={e => e.currentTarget.style.background = '#1a1e0f'}
              >
                {t.createAccountBtn}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT USER MODAL ── */}
      {showEditModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(26,30,15,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#ffffff', borderRadius: '18px', width: '440px', border: '1px solid #e8e2d6', boxShadow: '0 24px 64px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f5f1ea', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#1a1a14', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <Edit2 size={18} style={{ color: '#d45c3c' }} />
                {t.modalEditTitle}
              </h3>
              <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8a7f72' }}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleEditUser} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#6b6456' }}>{t.labelName}</label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#c4bfb5' }} />
                  <input 
                    type="text" 
                    value={editFormData.name} 
                    onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '10px', border: '1px solid #e8e2d6', outline: 'none', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#6b6456' }}>{t.labelEmail}</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#c4bfb5' }} />
                  <input 
                    type="email" 
                    value={editFormData.email} 
                    onChange={e => setEditFormData({ ...editFormData, email: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '10px', border: '1px solid #e8e2d6', outline: 'none', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#6b6456' }}>{t.labelRole}</label>
                <select 
                  value={editFormData.role} 
                  onChange={e => setEditFormData({ ...editFormData, role: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e8e2d6', outline: 'none', fontSize: '13px', background: '#fff' }}
                >
                  <option value="director">{t.roleDirector}</option>
                  <option value="admissions">{t.roleAdmissions}</option>
                  <option value="maintenance">{t.roleMaintenance}</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#6b6456' }}>{t.resetPass} <span style={{ fontWeight: 'normal', color: '#8a7f72' }}>{t.leaveBlank}</span></label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#c4bfb5' }} />
                  <input 
                    type="password" 
                    value={editFormData.password} 
                    onChange={e => setEditFormData({ ...editFormData, password: e.target.value })}
                    placeholder={t.enterNewPass}
                    style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '10px', border: '1px solid #e8e2d6', outline: 'none', fontSize: '13px' }}
                  />
                </div>
              </div>

              <button 
                type="submit"
                style={{
                  marginTop: '10px', padding: '12px', borderRadius: '10px', border: 'none',
                  background: '#1a1e0f', color: '#fff', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#d45c3c'}
                onMouseLeave={e => e.currentTarget.style.background = '#1a1e0f'}
              >
                {t.saveChangesBtn}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── CUSTOM CONFIRM DELETE DIALOG ── */}
      {confirmDelete.show && (
        <ConfirmDialog 
          message={t.confirmDelete}
          onConfirm={executeDelete}
          onCancel={() => setConfirmDelete({ show: false, userId: null })}
        />
      )}
{/* Confirm Revoke Session Dialog */}
{confirmRevoke.show && (
  <ConfirmDialog
    message="Are you sure you want to revoke this session?"
    onConfirm={() => {
      handleRevokeSession(confirmRevoke.sessionId);
      setConfirmRevoke({ show: false, sessionId: null });
    }}
    onCancel={() => setConfirmRevoke({ show: false, sessionId: null })}
  />
)}
      {/* ── PREMIUM TOAST NOTIFICATION ── */}
      {toast.show && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 10000,
          background: toast.type === 'success' ? '#f6faf0' : toast.type === 'warning' ? '#fffdf5' : '#fdf7f5',
          border: `1px solid ${toast.type === 'success' ? '#c7d6a2' : toast.type === 'warning' ? '#fddeba' : '#f8c7b4'}`,
          borderRadius: '12px',
          padding: '14px 20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          maxWidth: '360px',
          animation: 'slideIn 0.3s ease-out',
          pointerEvents: 'auto',
        }}>
          <style>{`
            @keyframes slideIn {
              from { transform: translateX(120%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          `}</style>
          {toast.type === 'success' ? (
            <Check size={18} style={{ color: '#5c651f' }} />
          ) : (
            <ShieldAlert size={18} style={{ color: '#d45c3c' }} />
          )}
          <span style={{ fontSize: '13px', fontWeight: '600', color: toast.type === 'success' ? '#3a4012' : '#3d1610', lineHeight: '1.4' }}>
            {toast.message}
          </span>
        </div>
      )}

      {/* ── PROFILE PICTURE ADJUSTER MODAL ── */}
      {showAdjuster && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(26,30,15,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, backdropFilter: 'blur(6px)' }}>
          <div style={{ background: '#ffffff', borderRadius: '20px', width: '460px', border: '1px solid #e8e2d6', boxShadow: '0 24px 64px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
            
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f5f1ea', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#1a1a14', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <Edit2 size={18} style={{ color: '#d45c3c' }} />
                {t.adjustTitle}
              </h3>
              <button onClick={() => setShowAdjuster(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8a7f72' }}>
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <p style={{ color: '#8a7f72', fontSize: '12px', textAlign: 'center', margin: '0 0 8px 0', width: '100%' }}>
                {t.adjustSub}
              </p>

              {/* Circular Viewport */}
              <div 
                style={{
                  position: 'relative',
                  width: '200px',
                  height: '200px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '2px solid #d45c3c',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08), inset 0 2px 10px rgba(0,0,0,0.1)',
                  cursor: 'move',
                  background: '#eae5d8',
                  touchAction: 'none'
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleMouseUp}
              >
                <img 
                  src={originalImage} 
                  alt="Adjust Preview"
                  draggable={false}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: 'auto',
                    height: '100%',
                    maxWidth: 'none',
                    maxHeight: 'none',
                    transform: `translate(calc(-50% + ${panX}px), calc(-50% + ${panY}px)) scale(${zoom}) rotate(${rotation}deg)`,
                    transformOrigin: 'center center',
                    userSelect: 'none',
                    pointerEvents: 'none'
                  }}
                />
              </div>

              {/* Controls */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
                
                {/* Zoom Control */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', color: '#6b6456' }}>
                    <span>{t.adjustZoom}</span>
                    <span>{zoom.toFixed(2)}x</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="4.0" 
                    step="0.05"
                    value={zoom}
                    onChange={e => setZoom(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: '#d45c3c', cursor: 'pointer' }}
                  />
                </div>

                {/* Rotation Control */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', color: '#6b6456' }}>
                    <span>{t.adjustRotate}</span>
                    <span>{rotation}°</span>
                  </div>
                  <input 
                    type="range" 
                    min="-180" 
                    max="180" 
                    step="1"
                    value={rotation}
                    onChange={e => setRotation(parseInt(e.target.value))}
                    style={{ width: '100%', accentColor: '#d45c3c', cursor: 'pointer' }}
                  />
                </div>

              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '10px' }}>
                <button 
                  onClick={() => setShowAdjuster(false)}
                  style={{
                    flex: 1, padding: '10px 16px', borderRadius: '10px', border: '1px solid #e8e2d6',
                    background: 'transparent', color: '#6b6456', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fcfbf9'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {t.adjustCancel}
                </button>
                <button 
                  onClick={handleSaveAdjustment}
                  style={{
                    flex: 1, padding: '10px 16px', borderRadius: '10px', border: 'none',
                    background: '#1a1e0f', color: '#fff', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#d45c3c'}
                  onMouseLeave={e => e.currentTarget.style.background = '#1a1e0f'}
                >
                  {t.adjustSave}
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
