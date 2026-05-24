import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  ChefHat, Plus, Search, Trash2, Edit2, X, Calendar, 
  AlertTriangle, TrendingDown, History, Clock, ArrowDownRight, Check
} from 'lucide-react';

const C_ST = {
  en: {
    title: "Restaurant & Catering Stock",
    subtitle: "Daily raw food tracking, safety expiration date guards, and consumption logs for DOU El Affroun residences",
    searchPlaceholder: "Search food supplies by name, category, or location...",
    btnLogConsumption: "Log Food Consumption",
    btnAddItem: "Add Food Supply",
    colName: "ITEM NAME",
    colCategory: "CATEGORY",
    colQty: "STOCK QUANTITY",
    colExpiry: "EXPIRATION DATE",
    colStatus: "SAFETY STATUS",
    colActions: "ACTIONS",
    
    // Statuses
    safe: "Safe & Valid",
    expired: "🔴 EXPIRED",
    expiringSoon: "🟡 EXPIRING SOON",
    lowStock: "📉 LOW STOCK",
    normalStock: "✓ IN STOCK",
    
    // Expiration Warnings Box
    safetyWarnings: "🚨 Food Safety Alerts",
    expiredItemsText: "Immediate Action Required: Perished batches detected! Do not serve to students.",
    expiringSoonText: "Usage Priority: Batches expiring within the next 7 days. Use immediately.",
    noWarnings: "✓ All food batches are safe, valid, and within normal expiration dates.",

    // Consumption Modals
    modalConsumeTitle: "Log Kitchen Consumption",
    labelFoodItem: "Select Food Ingredient",
    labelQtyUsed: "Quantity Used",
    labelResidence: "Dormitory Residence Kitchen",
    btnLog: "Confirm Deduction",

    // Add batch modals
    modalAddTitle: "Add Raw Material Batch",
    modalEditTitle: "Edit Supply Details",
    labelName: "Ingredient Name",
    placeholderName: "e.g. Basmati Rice, Sunflower Oil, Frozen Beef",
    labelCategory: "Ingredient Category",
    labelQuantity: "Initial Quantity",
    labelUnit: "Measurement Unit",
    labelThreshold: "Low Stock Alert Threshold",
    labelExpiry: "Expiration Date",
    labelSupplier: "Distributor / Supplier",
    labelLocation: "Storage Cold Room / Depot",
    btnCancel: "Cancel",
    btnSave: "Enregistrer Details",
    btnCreate: "Add Batch",

    // Consumption History Tab
    tabStock: "Active Inventory Stock",
    tabHistory: "Consumption History logs",
    colUsedTime: "CONSUMED AT",
    colUsedItem: "INGREDIENT",
    colUsedQty: "QTY DEDUCTED",
    colResidenceName: "KITCHEN LOCATION",
    colActor: "LOGGED BY",
    emptyHistory: "No food consumption has been logged yet.",
    toastAdded: "Food batch added successfully!",
    toastUpdated: "Batch details modified successfully!",
    toastDeleted: "Batch removed from stock permanently.",
    toastConsumed: "Kitchen consumption successfully logged!",
    toastError: "Database error occurred."
  },
  ar: {
    title: "مخزن الإطعام الجامعي",
    subtitle: "تتبع المواد الغذائية اليومية، وصمام الأمان لتاريخ الصلاحية، وسجلات الاستهلاك لإقامات العفرون",
    searchPlaceholder: "البحث عن المواد الغذائية بالاسم، الصنف، أو موقع التخزين...",
    btnLogConsumption: "تسجيل استهلاك المطبخ",
    btnAddItem: "إضافة دفعة غذائية",
    colName: "اسم المادة الغذائية",
    colCategory: "الصنف",
    colQty: "كمية المخزون",
    colExpiry: "تاريخ انتهاء الصلاحية",
    colStatus: "حالة سلامة الأغذية",
    colActions: "الإجراءات",
    
    // Statuses
    safe: "آمن وصالح",
    expired: "🔴 منتهي الصلاحية",
    expiringSoon: "🟡 يقترب من الانتهاء",
    lowStock: "📉 مخزون منخفض",
    normalStock: "✓ متوفر",

    // Expiration Warnings Box
    safetyWarnings: "🚨 تنبيهات سلامة الأغذية",
    expiredItemsText: "إجراء عاجل مطلوب: تم رصد دفعات منتهية الصلاحية! يمنع تقديمها للطلبة.",
    expiringSoonText: "أولوية الاستهلاك: دفعات تنتهي صلاحيتها خلال 7 أيام القادمة. يجب استخدامها فوراً.",
    noWarnings: "✓ جميع دفعات الأغذية آمنة وصالحة وتواريخ صلاحيتها طبيعية.",

    // Consumption Modals
    modalConsumeTitle: "تسجيل استهلاك المطبخ اليومي",
    labelFoodItem: "اختر المادة الغذائية",
    labelQtyUsed: "الكمية المستهلكة",
    labelResidence: "مطبخ الإقامة الجامعية",
    btnLog: "تأكيد خصم الكمية",

    // Add batch modals
    modalAddTitle: "إضافة دفعة مواد أولية جديدة",
    modalEditTitle: "تعديل تفاصيل الدفعة",
    labelName: "اسم المادة الأولية",
    placeholderName: "مثال: أرز بسمتي، زيت عباد الشمس، لحم بقري مجمد",
    labelCategory: "صنف المادة الغذائية",
    labelQuantity: "الكمية الأولية",
    labelUnit: "وحدة القياس",
    labelThreshold: "حد التنبيه بانخفاض المخزون",
    labelExpiry: "تاريخ انتهاء الصلاحية",
    labelSupplier: "الموزع / المورد",
    labelLocation: "موقع التخزين / غرف التبريد",
    btnCancel: "إلغاء",
    btnSave: "حفظ التعديلات",
    btnCreate: "إضافة الدفعة",

    // Consumption History Tab
    tabStock: "مخزون المواد النشط",
    tabHistory: "سجل استهلاك المواد اليومي",
    colUsedTime: "تاريخ ووقت الاستهلاك",
    colUsedItem: "المادة الغذائية",
    colUsedQty: "الكمية المخصومة",
    colResidenceName: "مطبخ الإقامة",
    colActor: "الموظف المسؤول",
    emptyHistory: "لم يتم تسجيل أي استهلاك للمواد الغذائية بعد.",
    toastAdded: "تمت إضافة الدفعة الغذائية بنجاح!",
    toastUpdated: "تم تعديل تفاصيل الدفعة بنجاح!",
    toastDeleted: "تم حذف المادة الغذائية من المخزون نهائياً.",
    toastConsumed: "تم تسجيل استهلاك المطبخ وتحديث المخزون بنجاح!",
    toastError: "حدث خطأ في قاعدة البيانات."
  },
  fr: {
    title: "Catering & Stock Restauration",
    subtitle: "Suivi quotidien des denrées, alertes de péremption de sécurité et historique d'utilisation pour DOU El Affroun",
    searchPlaceholder: "Rechercher des produits par nom, catégorie, ou stockage...",
    btnLogConsumption: "Saisir Consommation Cuisine",
    btnAddItem: "Ajouter un Lot d'Épicerie",
    colName: "DENRÉE ALIMENTAIRE",
    colCategory: "CATÉGORIE",
    colQty: "QUANTITÉ EN STOCK",
    colExpiry: "DATE DE PÉREMPTION",
    colStatus: "SÉCURITÉ ALIMENTAIRE",
    colActions: "ACTIONS",
    
    // Statuses
    safe: "Sûr & Valide",
    expired: "🔴 PÉRIMÉ",
    expiringSoon: "🟡 EXPIRATION PROCHE",
    lowStock: "📉 STOCK FAIBLE",
    normalStock: "✓ DISPONIBLE",

    // Expiration Warnings Box
    safetyWarnings: "🚨 Alertes de Sécurité Alimentaire",
    expiredItemsText: "Action Immédiate Requise: Lots périmés détectés! Ne pas servir aux étudiants.",
    expiringSoonText: "Priorité d'utilisation: Lots expirant dans les 7 prochains jours. À consommer d'urgence.",
    noWarnings: "✓ Tous les lots alimentaires sont sûrs, valides et dans des délais de consommation normaux.",

    // Consumption Modals
    modalConsumeTitle: "Déclaration de Consommation Cuisine",
    labelFoodItem: "Sélectionnez l'ingrédient",
    labelQtyUsed: "Quantité Consommée",
    labelResidence: "Cuisine de la Résidence Universitaire",
    btnLog: "Valider la Déduction",

    // Add batch modals
    modalAddTitle: "Nouveau Lot de Matières Premières",
    modalEditTitle: "Modifier les Détails du Lot",
    labelName: "Nom de l'Ingrédient",
    placeholderName: "ex: Riz Basmati, Huile de Tournesol, Viande Bovine",
    labelCategory: "Catégorie de l'Ingrédient",
    labelQuantity: "Quantité Initiale",
    labelUnit: "Unité de Mesure",
    labelThreshold: "Alerte de Stock Faible",
    labelExpiry: "Date de Péremption",
    labelSupplier: "Distributeur / Fournisseur",
    labelLocation: "Lieu de Stockage / Chambre Froide",
    btnCancel: "Annuler",
    btnSave: "Enregistrer les modifications",
    btnCreate: "Ajouter le Lot",

    // Consumption History Tab
    tabStock: "Stock Actif des Matières",
    tabHistory: "Historique d'Utilisation Quotidienne",
    colUsedTime: "CONSOMMÉ LE",
    colUsedItem: "INGRÉDIENT",
    colUsedQty: "QTY DÉDUITE",
    colResidenceName: "CUISINE RÉCEPTIVE",
    colActor: "DÉCLARÉ PAR",
    emptyHistory: "Aucune consommation n'a encore été déclarée.",
    toastAdded: "Lot de denrées alimentaires ajouté avec succès !",
    toastUpdated: "Détails du lot modifiés avec succès !",
    toastDeleted: "Lot supprimé définitivement du stock.",
    toastConsumed: "Consommation enregistrée et stock ajusté avec succès !",
    toastError: "Une erreur de base de données est survenue."
  }
};

export default function CateringPage() {
  const lang = localStorage.getItem('lang') || 'en';
  const t = C_ST[lang] || C_ST.en;

  const [activeSubTab, setActiveSubTab] = useState('stock'); // 'stock' or 'history'
  const [inventory, setInventory] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConsumeModal, setShowConsumeModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '', category: 'Dry Goods', quantity: '', unit: 'kg', 
    min_alert_threshold: '10.00', expiry_date: '', supplier: '', location: ''
  });

  const [consumeData, setConsumeData] = useState({
    item_id: '', quantity_used: '', residence_name: 'Hassan Khira Dining Hall'
  });

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

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

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/catering/inventory');
      setInventory(res.data);
    } catch (err) {
      console.error(err);
      showToast(t.toastError, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get('/catering/consumption');
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchHistory();
  }, []);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.expiry_date) return;
    try {
      await api.post('/catering/inventory', formData);
      setShowAddModal(false);
      setFormData({
        name: '', category: 'Dry Goods', quantity: '', unit: 'kg', 
        min_alert_threshold: '10.00', expiry_date: '', supplier: '', location: ''
      });
      fetchInventory();
      fetchHistory();
      showToast(t.toastAdded, 'success');
    } catch (err) {
      showToast(err.response?.data?.error || t.toastError, 'danger');
    }
  };

  const handleEditClick = (item) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      min_alert_threshold: item.min_alert_threshold,
      expiry_date: item.expiry_date ? item.expiry_date.substring(0, 10) : '',
      supplier: item.supplier,
      location: item.location
    });
    setShowEditModal(true);
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/catering/inventory/${selectedItem.id}`, formData);
      setShowEditModal(false);
      setSelectedItem(null);
      fetchInventory();
      showToast(t.toastUpdated, 'success');
    } catch (err) {
      showToast(err.response?.data?.error || t.toastError, 'danger');
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذه المادة نهائياً؟' : lang === 'fr' ? 'Êtes-vous sûr de vouloir supprimer cet élément ?' : 'Are you sure you want to delete this food batch?')) return;
    try {
      await api.delete(`/catering/inventory/${id}`);
      fetchInventory();
      showToast(t.toastDeleted, 'success');
    } catch (err) {
      showToast(t.toastError, 'danger');
    }
  };

  const handleConsumeSubmit = async (e) => {
    e.preventDefault();
    if (!consumeData.item_id || !consumeData.quantity_used) return;
    try {
      await api.post('/catering/consume', consumeData);
      setShowConsumeModal(false);
      setConsumeData({ item_id: '', quantity_used: '', residence_name: 'Hassan Khira Dining Hall' });
      fetchInventory();
      fetchHistory();
      showToast(t.toastConsumed, 'success');
    } catch (err) {
      showToast(err.response?.data?.error || t.toastError, 'danger');
    }
  };

  // Food Safety Expiration Alerts logic
  const expiredItems = inventory.filter(item => item.is_expired);
  const expiringSoonItems = inventory.filter(item => !item.is_expired && item.days_until_expiry >= 0 && item.days_until_expiry <= 7);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1100px', textAlign: lang === 'ar' ? 'right' : 'left' }} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#1a1a14', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: '#fdf3e7', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ChefHat size={20} style={{ color: '#d45c3c' }} />
            </span>
            {t.title}
          </h1>
          <p style={{ color: '#8a7f72', fontSize: '13px' }}>{t.subtitle}</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setShowConsumeModal(true)}
            style={{
              padding: '10px 16px', borderRadius: '10px', background: '#1a1e0f', color: '#fff',
              border: 'none', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#d45c3c'}
            onMouseLeave={e => e.currentTarget.style.background = '#1a1e0f'}
          >
            <ArrowDownRight size={16} />
            {t.btnLogConsumption}
          </button>
          
          <button 
            onClick={() => {
              setFormData({
                name: '', category: 'Dry Goods', quantity: '', unit: 'kg', 
                min_alert_threshold: '10.00', expiry_date: '', supplier: '', location: ''
              });
              setShowAddModal(true);
            }}
            style={{
              padding: '10px 16px', borderRadius: '10px', background: '#ffffff', color: '#d45c3c',
              border: '1px solid #d45c3c', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#d45c3c'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#d45c3c'; }}
          >
            <Plus size={16} />
            {t.btnAddItem}
          </button>
        </div>
      </div>

      {/* 🚨 FOOD SAFETY ALERTS BOX */}
      <div style={{ 
        background: '#ffffff', borderRadius: '16px', border: '1px solid #e8e2d6', padding: '20px', 
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '14px' 
      }}>
        <h2 style={{ fontSize: '14px', fontWeight: '800', color: '#1a1a14', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <AlertTriangle size={18} style={{ color: expiredItems.length > 0 ? '#d45c3c' : '#f6b371' }} />
          {t.safetyWarnings}
        </h2>
        
        {expiredItems.length === 0 && expiringSoonItems.length === 0 ? (
          <p style={{ margin: 0, fontSize: '13px', color: '#385723', background: '#e2f0d9', padding: '12px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px' }}>✓</span> {t.noWarnings}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {expiredItems.length > 0 && (
              <div style={{ background: '#fdf5f2', borderLeft: '4px solid #d45c3c', padding: '12px 16px', borderRadius: '8px' }}>
                <div style={{ fontWeight: '700', fontSize: '13px', color: '#d45c3c', marginBottom: '4px' }}>
                  {t.expiredItemsText}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                  {expiredItems.map(item => (
                    <span key={item.id} style={{ background: 'rgba(212,92,60,0.1)', color: '#d45c3c', fontSize: '11px', padding: '3px 8px', borderRadius: '6px', fontWeight: '600' }}>
                      ⚠️ {item.name} ({new Date(item.expiry_date).toLocaleDateString(lang === 'ar' ? 'ar-DZ' : 'fr-FR')})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {expiringSoonItems.length > 0 && (
              <div style={{ background: '#fefbf0', borderLeft: '4px solid #f6b371', padding: '12px 16px', borderRadius: '8px' }}>
                <div style={{ fontWeight: '700', fontSize: '13px', color: '#b27329', marginBottom: '4px' }}>
                  {t.expiringSoonText}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                  {expiringSoonItems.map(item => (
                    <span key={item.id} style={{ background: 'rgba(246,179,113,0.15)', color: '#b27329', fontSize: '11px', padding: '3px 8px', borderRadius: '6px', fontWeight: '600' }}>
                      ⏳ {item.name} ({item.days_until_expiry} {lang === 'ar' ? 'أيام متبقية' : 'jours restants'})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid #e8e2d6', paddingBottom: '4px' }}>
        <button 
          onClick={() => setActiveSubTab('stock')}
          style={{
            padding: '10px 18px', borderRadius: '8px', border: 'none',
            fontSize: '13px', fontWeight: '700', cursor: 'pointer',
            background: activeSubTab === 'stock' ? '#1a1e0f' : 'transparent',
            color: activeSubTab === 'stock' ? '#fff' : '#6b6456',
            transition: 'all 0.15s'
          }}
        >
          {t.tabStock}
        </button>
        <button 
          onClick={() => setActiveSubTab('history')}
          style={{
            padding: '10px 18px', borderRadius: '8px', border: 'none',
            fontSize: '13px', fontWeight: '700', cursor: 'pointer',
            background: activeSubTab === 'history' ? '#1a1e0f' : 'transparent',
            color: activeSubTab === 'history' ? '#fff' : '#6b6456',
            transition: 'all 0.15s'
          }}
        >
          {t.tabHistory}
        </button>
      </div>

      {activeSubTab === 'stock' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Search bar */}
          <div style={{ display: 'flex', gap: '12px', background: '#ffffff', padding: '14px', borderRadius: '12px', border: '1px solid #e8e2d6', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', [lang === 'ar' ? 'right' : 'left']: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8a7f72' }} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                style={{
                  width: '100%', padding: lang === 'ar' ? '10px 38px 10px 12px' : '10px 12px 10px 38px', borderRadius: '10px',
                  border: '1px solid #e8e2d6', outline: 'none', fontSize: '13px'
                }}
              />
            </div>
          </div>

          {/* Grid/Table */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e8e2d6', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '3px solid #f0ede4', borderTop: '3px solid #d45c3c', animation: 'spin 0.8s linear infinite' }} />
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: lang === 'ar' ? 'right' : 'left' }}>
                  <thead>
                    <tr style={{ background: '#fafaf7', borderBottom: '1px solid #e8e2d6' }}>
                      <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#8a7f72' }}>{t.colName}</th>
                      <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#8a7f72' }}>{t.colCategory}</th>
                      <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#8a7f72' }}>{t.colQty}</th>
                      <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#8a7f72' }}>{t.colExpiry}</th>
                      <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#8a7f72' }}>{t.colStatus}</th>
                      <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#8a7f72', textAlign: 'center' }}>{t.colActions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory
                      .filter(item => {
                        const q = searchQuery.toLowerCase();
                        return (
                          item.name.toLowerCase().includes(q) ||
                          item.category.toLowerCase().includes(q) ||
                          (item.location || '').toLowerCase().includes(q)
                        );
                      })
                      .map(item => {
                        return (
                          <tr key={item.id} style={{ borderBottom: '1px solid #f5f1ea', transition: 'all 0.1s' }} onMouseEnter={e => e.currentTarget.style.background = '#fafaf7'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <td style={{ padding: '14px 20px', fontSize: '13px', fontWeight: '700', color: '#1a1a14' }}>
                              {item.name}
                              <div style={{ fontSize: '11px', color: '#8a7f72', fontWeight: '400', marginTop: '2px' }}>
                                📍 {item.location || 'Depot'} | 🏢 {item.supplier || 'DOU'}
                              </div>
                            </td>
                            <td style={{ padding: '14px 20px', fontSize: '13px', color: '#6b6456' }}>
                              {item.category}
                            </td>
                            <td style={{ padding: '14px 20px', fontSize: '13px', fontWeight: '700', color: item.is_low_stock ? '#d45c3c' : '#1a1a14' }}>
                              {item.quantity} {item.unit}
                              {item.is_low_stock && (
                                <div style={{ fontSize: '10px', color: '#d45c3c', fontWeight: '600' }}>
                                  ({t.lowStock})
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '14px 20px', fontSize: '13px', color: item.is_expired ? '#d45c3c' : '#6b6456' }}>
                              {new Date(item.expiry_date).toLocaleDateString(lang === 'ar' ? 'ar-DZ' : lang === 'fr' ? 'fr-FR' : 'en-US')}
                              {item.is_expired ? (
                                <span style={{ fontSize: '10px', color: '#d45c3c', fontWeight: '700', display: 'block' }}>{t.expired}</span>
                              ) : item.days_until_expiry <= 7 ? (
                                <span style={{ fontSize: '10px', color: '#b27329', fontWeight: '700', display: 'block' }}>⏳ {item.days_until_expiry} {lang === 'ar' ? 'أيام متبقية' : 'jours restants'}</span>
                              ) : null}
                            </td>
                            <td style={{ padding: '14px 20px', fontSize: '13px' }}>
                              <span style={{
                                padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700',
                                background: item.is_expired ? '#fce4db' : item.days_until_expiry <= 7 ? '#fef2cb' : '#e2f0d9',
                                color: item.is_expired ? '#c55a11' : item.days_until_expiry <= 7 ? '#7f6000' : '#385723'
                              }}>
                                {item.is_expired ? t.expired : item.days_until_expiry <= 7 ? t.expiringSoon : t.safe}
                              </span>
                            </td>
                            <td style={{ padding: '14px 20px', fontSize: '13px' }}>
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                <button 
                                  onClick={() => handleEditClick(item)}
                                  style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1px solid #e8e2d6', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s' }}
                                  onMouseEnter={e => e.currentTarget.style.borderColor = '#1a1e0f'}
                                  onMouseLeave={e => e.currentTarget.style.borderColor = '#e8e2d6'}
                                >
                                  <Edit2 size={13} style={{ color: '#6b6456' }} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteItem(item.id)}
                                  style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1px solid #e8e2d6', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s' }}
                                  onMouseEnter={e => e.currentTarget.style.borderColor = '#d45c3c'}
                                  onMouseLeave={e => e.currentTarget.style.borderColor = '#e8e2d6'}
                                >
                                  <Trash2 size={13} style={{ color: '#d45c3c' }} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'history' && (
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e8e2d6', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          {history.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '12px' }}>
              <History size={32} style={{ color: '#c4bfb5' }} />
              <p style={{ margin: 0, fontSize: '13px', color: '#8a7f72' }}>{t.emptyHistory}</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: lang === 'ar' ? 'right' : 'left' }}>
                <thead>
                  <tr style={{ background: '#fafaf7', borderBottom: '1px solid #e8e2d6' }}>
                    <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#8a7f72' }}>{t.colUsedTime}</th>
                    <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#8a7f72' }}>{t.colUsedItem}</th>
                    <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#8a7f72' }}>{t.colUsedQty}</th>
                    <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#8a7f72' }}>{t.colResidenceName}</th>
                    <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#8a7f72' }}>{t.colActor}</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #f5f1ea', transition: 'all 0.1s' }} onMouseEnter={e => e.currentTarget.style.background = '#fafaf7'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: '#6b6456' }}>
                        {new Date(log.used_at).toLocaleString(lang === 'ar' ? 'ar-DZ' : 'fr-FR')}
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', fontWeight: '700', color: '#1a1a14' }}>
                        {log.item_name}
                        <div style={{ fontSize: '10px', color: '#8a7f72', fontWeight: '400' }}>({log.item_category})</div>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', fontWeight: '700', color: '#d45c3c' }}>
                        -{log.quantity_used} {log.item_unit}
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: '#1a1a14', fontWeight: '600' }}>
                        {log.residence_name}
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: '#8a7f72' }}>
                        {log.user_name || 'System'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── ADD FOOD MODAL ── */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(26,30,15,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#ffffff', borderRadius: '18px', width: '480px', border: '1px solid #e8e2d6', boxShadow: '0 24px 64px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f5f1ea', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#1a1a14', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <ChefHat size={18} style={{ color: '#d45c3c' }} />
                {t.modalAddTitle}
              </h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8a7f72' }}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddItem} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#6b6456' }}>{t.labelName}</label>
                <input 
                  type="text" 
                  required
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t.placeholderName}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e8e2d6', outline: 'none', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#6b6456' }}>{t.labelCategory}</label>
                  <select 
                    value={formData.category} 
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e8e2d6', outline: 'none', fontSize: '13px' }}
                  >
                    <option value="Dry Goods">{lang === 'ar' ? 'مواد جافة' : 'Produits Secs'}</option>
                    <option value="Dairy">{lang === 'ar' ? 'مشتقات الحليب' : 'Produits Laitiers'}</option>
                    <option value="Meat & Fish">{lang === 'ar' ? 'لحوم وأسماك' : 'Viandes & Poissons'}</option>
                    <option value="Vegetables">{lang === 'ar' ? 'خضار وفواكه' : 'Fruits & Légumes'}</option>
                    <option value="Oils & Condiments">{lang === 'ar' ? 'زيوت وتوابل' : 'Huiles & Condiments'}</option>
                  </select>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#6b6456' }}>{t.labelUnit}</label>
                  <select 
                    value={formData.unit} 
                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e8e2d6', outline: 'none', fontSize: '13px' }}
                  >
                    <option value="kg">kg</option>
                    <option value="L">Liters (L)</option>
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="box">Boxes</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#6b6456' }}>{t.labelQuantity}</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={formData.quantity} 
                    onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="0.00"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e8e2d6', outline: 'none', fontSize: '13px' }}
                  />
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#6b6456' }}>{t.labelThreshold}</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={formData.min_alert_threshold} 
                    onChange={e => setFormData({ ...formData, min_alert_threshold: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e8e2d6', outline: 'none', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#6b6456' }}>{t.labelExpiry}</label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={15} style={{ position: 'absolute', [lang === 'ar' ? 'right' : 'left']: '12px', top: '50%', transform: 'translateY(-50%)', color: '#c4bfb5' }} />
                  <input 
                    type="date" 
                    required
                    value={formData.expiry_date} 
                    onChange={e => setFormData({ ...formData, expiry_date: e.target.value })}
                    style={{ width: '100%', padding: lang === 'ar' ? '10px 36px 10px 12px' : '10px 12px 10px 36px', borderRadius: '10px', border: '1px solid #e8e2d6', outline: 'none', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#6b6456' }}>{t.labelSupplier}</label>
                  <input 
                    type="text" 
                    value={formData.supplier} 
                    onChange={e => setFormData({ ...formData, supplier: e.target.value })}
                    placeholder="e.g. ONOU Distributors"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e8e2d6', outline: 'none', fontSize: '13px' }}
                  />
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#6b6456' }}>{t.labelLocation}</label>
                  <input 
                    type="text" 
                    value={formData.location} 
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Cold Room 2"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e8e2d6', outline: 'none', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '10px 18px', borderRadius: '10px', border: '1px solid #e8e2d6', background: '#fff', color: '#6b6456', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                  {t.btnCancel}
                </button>
                <button type="submit" style={{ padding: '10px 18px', borderRadius: '10px', border: 'none', background: '#1a1e0f', color: '#fff', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                  {t.btnCreate}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT FOOD MODAL ── */}
      {showEditModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(26,30,15,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#ffffff', borderRadius: '18px', width: '480px', border: '1px solid #e8e2d6', boxShadow: '0 24px 64px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f5f1ea', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#1a1a14', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <Edit2 size={18} style={{ color: '#d45c3c' }} />
                {t.modalEditTitle}
              </h3>
              <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8a7f72' }}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateItem} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#6b6456' }}>{t.labelName}</label>
                <input 
                  type="text" 
                  required
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e8e2d6', outline: 'none', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#6b6456' }}>{t.labelCategory}</label>
                  <select 
                    value={formData.category} 
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e8e2d6', outline: 'none', fontSize: '13px' }}
                  >
                    <option value="Dry Goods">{lang === 'ar' ? 'مواد جافة' : 'Produits Secs'}</option>
                    <option value="Dairy">{lang === 'ar' ? 'مشتقات الحليب' : 'Produits Laitiers'}</option>
                    <option value="Meat & Fish">{lang === 'ar' ? 'لحوم وأسماك' : 'Viandes & Poissons'}</option>
                    <option value="Vegetables">{lang === 'ar' ? 'خضار وفواكه' : 'Fruits & Légumes'}</option>
                    <option value="Oils & Condiments">{lang === 'ar' ? 'زيوت وتوابل' : 'Huiles & Condiments'}</option>
                  </select>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#6b6456' }}>{t.labelUnit}</label>
                  <select 
                    value={formData.unit} 
                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e8e2d6', outline: 'none', fontSize: '13px' }}
                  >
                    <option value="kg">kg</option>
                    <option value="L">Liters (L)</option>
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="box">Boxes</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#6b6456' }}>{t.labelQuantity}</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={formData.quantity} 
                    onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e8e2d6', outline: 'none', fontSize: '13px' }}
                  />
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#6b6456' }}>{t.labelThreshold}</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={formData.min_alert_threshold} 
                    onChange={e => setFormData({ ...formData, min_alert_threshold: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e8e2d6', outline: 'none', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#6b6456' }}>{t.labelExpiry}</label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={15} style={{ position: 'absolute', [lang === 'ar' ? 'right' : 'left']: '12px', top: '50%', transform: 'translateY(-50%)', color: '#c4bfb5' }} />
                  <input 
                    type="date" 
                    required
                    value={formData.expiry_date} 
                    onChange={e => setFormData({ ...formData, expiry_date: e.target.value })}
                    style={{ width: '100%', padding: lang === 'ar' ? '10px 36px 10px 12px' : '10px 12px 10px 36px', borderRadius: '10px', border: '1px solid #e8e2d6', outline: 'none', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#6b6456' }}>{t.labelSupplier}</label>
                  <input 
                    type="text" 
                    value={formData.supplier} 
                    onChange={e => setFormData({ ...formData, supplier: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e8e2d6', outline: 'none', fontSize: '13px' }}
                  />
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#6b6456' }}>{t.labelLocation}</label>
                  <input 
                    type="text" 
                    value={formData.location} 
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e8e2d6', outline: 'none', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowEditModal(false)} style={{ padding: '10px 18px', borderRadius: '10px', border: '1px solid #e8e2d6', background: '#fff', color: '#6b6456', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                  {t.btnCancel}
                </button>
                <button type="submit" style={{ padding: '10px 18px', borderRadius: '10px', border: 'none', background: '#1a1e0f', color: '#fff', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                  {t.btnSave}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── LOG KITCHEN CONSUMPTION MODAL ── */}
      {showConsumeModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(26,30,15,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#ffffff', borderRadius: '18px', width: '440px', border: '1px solid #e8e2d6', boxShadow: '0 24px 64px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f5f1ea', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#1a1a14', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <Clock size={18} style={{ color: '#d45c3c' }} />
                {t.modalConsumeTitle}
              </h3>
              <button onClick={() => setShowConsumeModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8a7f72' }}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleConsumeSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#6b6456' }}>{t.labelFoodItem}</label>
                <select 
                  required
                  value={consumeData.item_id} 
                  onChange={e => setConsumeData({ ...consumeData, item_id: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e8e2d6', outline: 'none', fontSize: '13px' }}
                >
                  <option value="">-- {lang === 'ar' ? 'اختر مادة غذائية' : 'Choisir une denrée'} --</option>
                  {inventory
                    .filter(item => !item.is_expired && parseFloat(item.quantity) > 0)
                    .map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.quantity} {item.unit} {lang === 'ar' ? 'متوفر' : 'dispo'})
                      </option>
                    ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#6b6456' }}>{t.labelQtyUsed}</label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  value={consumeData.quantity_used} 
                  onChange={e => setConsumeData({ ...consumeData, quantity_used: e.target.value })}
                  placeholder="0.00"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e8e2d6', outline: 'none', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#6b6456' }}>{t.labelResidence}</label>
                <select 
                  value={consumeData.residence_name} 
                  onChange={e => setConsumeData({ ...consumeData, residence_name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e8e2d6', outline: 'none', fontSize: '13px' }}
                >
                  <option value="Hassan Khira Dining Hall">{lang === 'ar' ? 'مطعم حسان خيرة' : 'Resto Hassan Khira'}</option>
                  <option value="Beni Mouimen Residence">{lang === 'ar' ? 'إقامة بني مويمن' : 'Resto Beni Mouimen'}</option>
                  <option value="El Affroun Central Kitchen">{lang === 'ar' ? 'المطبخ المركزي العفرون' : 'Cuisine Centrale Affroun'}</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button type="button" onClick={() => setShowConsumeModal(false)} style={{ padding: '10px 18px', borderRadius: '10px', border: '1px solid #e8e2d6', background: '#fff', color: '#6b6456', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                  {t.btnCancel}
                </button>
                <button type="submit" style={{ padding: '10px 18px', borderRadius: '10px', border: 'none', background: '#1a1e0f', color: '#fff', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                  {t.btnLog}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating success toast notifications */}
      {toast.show && (
        <div style={{
          position: 'fixed', top: '24px', right: lang === 'ar' ? 'auto' : '24px', left: lang === 'ar' ? '24px' : 'auto',
          zIndex: 10000, display: 'flex', alignItems: 'center', gap: '10px',
          padding: '14px 20px', borderRadius: '12px', background: '#1a1e0f', color: '#fff',
          boxShadow: '0 20px 48px rgba(26,30,15,0.2)', border: '1px solid rgba(255,255,255,0.08)',
          animation: 'slideIn 0.3s ease forwards'
        }}>
          <Check size={16} style={{ color: '#f6b371' }} />
          <span style={{ fontSize: '13px', fontWeight: '700', fontFamily: lang === 'ar' ? 'Cairo' : 'inherit' }}>{toast.message}</span>
          <style>{`
            @keyframes slideIn {
              from { transform: translateY(-20px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `}</style>
        </div>
      )}

    </div>
  );
}
