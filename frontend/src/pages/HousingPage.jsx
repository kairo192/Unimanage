import { useState, useEffect } from 'react';
import { 
  Plus, ArrowDownRight, Search, Edit2, Trash2, X, Check, AlertTriangle, 
  Warehouse, Bed, Hammer, ShieldCheck, ClipboardList, Info
} from 'lucide-react';
import api from '../api/axios';

const HOUSING_DICT = {
  'Housing & Maintenance Stock': {
    en: 'Housing & Maintenance Stock',
    fr: "Stock d'Hébergement & Maintenance",
    ar: 'مخزن الإيواء والصيانة'
  },
  'Linen & Bedding': {
    en: 'Linen & Bedding',
    fr: 'Linge & Literie',
    ar: 'الأفرشة والأغطية'
  },
  'Plumbing Parts': {
    en: 'Plumbing Parts',
    fr: 'Pièces de Plomberie',
    ar: 'قطع السباكة'
  },
  'Electrical Parts': {
    en: 'Electrical Parts',
    fr: 'Pièces Électriques',
    ar: 'قطع الكهرباء'
  },
  'General Hardware': {
    en: 'General Hardware',
    fr: 'Quincaillerie Générale',
    ar: 'العتاد العام والخرداوات'
  },
  'Track room assets, warm bedding, and plumbing/electrical spare parts for residencies.': {
    en: 'Track room assets, warm bedding, and plumbing/electrical spare parts for residencies.',
    fr: 'Gérez les draps, couvertures, matelas, et les pièces de rechange de plomberie et électricité.',
    ar: 'متابعة أصول الغرف، الأفرشة الدافئة، وقطع الغيار المخصصة لأعمال الصيانة والسباكة والكهرباء بالإقامات الجامعية.'
  },
  'Log Transfer / Dispatch': {
    en: 'Log Transfer / Dispatch',
    fr: 'Transférer / Distribuer',
    ar: 'تسجيل نقل / صرف صيانة'
  },
  'Add Supply Item': {
    en: 'Add Supply Item',
    fr: 'Ajouter un Article',
    ar: 'إضافة تجهيز جديد'
  },
  'Housing Inventory Warnings': {
    en: 'Housing Inventory Warnings',
    fr: 'Alertes de Stock Hébergement',
    ar: 'تنبيهات مخزون الإيواء والصيانة'
  },
  'Immediate Action: Items below minimum threshold. Reorder soon!': {
    en: 'Immediate Action: Items below minimum threshold. Reorder soon!',
    fr: 'Action Requise : Articles en sous-stock. Commandez bientôt !',
    ar: 'إجراء عاجل: بعض التجهيزات انخفضت عن حد الطلب الأدنى. يرجى إعادة الطلب!'
  },
  'All housing and maintenance assets are fully stocked.': {
    en: 'All housing and maintenance assets are fully stocked.',
    fr: "Tous les articles d'hébergement et de réparation sont bien stockés.",
    ar: 'جميع مستودعات الإيواء ومعدات الصيانة ممتلئة ولا توجد نواقص حالياً.'
  },
  'Active Supply Inventory': {
    en: 'Active Supply Inventory',
    fr: 'Inventaire Actif',
    ar: 'مخزون التجهيزات الحالي'
  },
  'Transfer & Dispatch Logs': {
    en: 'Transfer & Dispatch Logs',
    fr: 'Historique des Transferts',
    ar: 'سجل النقل والتوزيع'
  },
  'Search items by name, category, or supplier...': {
    en: 'Search items by name, category, or supplier...',
    fr: 'Rechercher par nom, catégorie, fournisseur...',
    ar: 'البحث باسم التجهيز، الفئة، أو المورد...'
  },
  'ITEM NAME': {
    en: 'ITEM NAME',
    fr: "NOM DE L'ARTICLE",
    ar: 'اسم التجهيز'
  },
  'CATEGORY': {
    en: 'CATEGORY',
    fr: 'CATÉGORIE',
    ar: 'الفئة'
  },
  'STOCK QUANTITY': {
    en: 'STOCK QUANTITY',
    fr: 'STOCK DISPONIBLE',
    ar: 'الكمية المتوفرة'
  },
  'ALERT LIMIT': {
    en: 'ALERT LIMIT',
    fr: "SEUIL D'ALERTE",
    ar: 'حد الأمان'
  },
  'SUPPLIER': {
    en: 'SUPPLIER',
    fr: 'FOURNISSEUR',
    ar: 'المورد / المصدر'
  },
  'LOCATION': {
    en: 'LOCATION',
    fr: 'EMPLACEMENT',
    ar: 'موقع التخزين'
  },
  'SAFETY STATUS': {
    en: 'SAFETY STATUS',
    fr: 'STATUT SÉCURITÉ',
    ar: 'حالة المخزون'
  },
  'ACTIONS': {
    en: 'ACTIONS',
    fr: 'ACTIONS',
    ar: 'إجراءات'
  },
  'LOW STOCK': {
    en: 'LOW STOCK',
    fr: 'SOUS-STOCK',
    ar: 'مخزون منخفض'
  },
  'WELL STOCKED': {
    en: 'WELL STOCKED',
    fr: 'STOCK OPTIMAL',
    ar: 'مخزون آمن'
  },
  'TRANSFERRED AT': {
    en: 'TRANSFERRED AT',
    fr: 'DATE TRANSFERT',
    ar: 'تاريخ العملية'
  },
  'PERFORMED BY': {
    en: 'PERFORMED BY',
    fr: 'OPÉRATEUR',
    ar: 'المنفذ'
  },
  'DISPATCH TYPE': {
    en: 'DISPATCH TYPE',
    fr: 'TYPE DE DISPATCH',
    ar: 'نوع الصرف'
  },
  'ITEM DISPATCHED': {
    en: 'ITEM DISPATCHED',
    fr: 'ARTICLE DISPATCHÉ',
    ar: 'المادة المصروفة'
  },
  'QTY DISPATCHED': {
    en: 'QTY DISPATCHED',
    fr: 'QTÉ ENLEVÉE',
    ar: 'الكمية المنقولة'
  },
  'DESTINATION': {
    en: 'DESTINATION',
    fr: 'DESTINATION / SERVICE',
    ar: 'الجهة المستقبلة'
  },
  'Linen Transfer': {
    en: 'Linen Transfer',
    fr: 'Transfert de Linge',
    ar: 'نقل أفرشة وأغطية'
  },
  'Maintenance Use': {
    en: 'Maintenance Use',
    fr: 'Usage Maintenance',
    ar: 'استعمال أعمال الصيانة'
  },
  'Close': {
    en: 'Close',
    fr: 'Fermer',
    ar: 'إغلاق'
  },
  'Save Item': {
    en: 'Save Item',
    fr: 'Enregistrer',
    ar: 'حفظ التجهيز'
  },
  'Cancel': {
    en: 'Cancel',
    fr: 'Annuler',
    ar: 'إلغاء'
  },
  'Edit Supply Item': {
    en: 'Edit Supply Item',
    fr: "Modifier l'Article",
    ar: 'تعديل بيانات التجهيز'
  },
  'Delete Item?': {
    en: 'Delete Item?',
    fr: "Supprimer l'article ?",
    ar: 'حذف التجهيز نهائياً؟'
  },
  'Are you sure you want to permanently delete': {
    en: 'Are you sure you want to permanently delete',
    fr: 'Êtes-vous sûr de vouloir supprimer définitivement',
    ar: 'هل أنت متأكد من رغبتك في حذف هذا التجهيز نهائياً؟'
  },
  'Confirm Delete': {
    en: 'Confirm Delete',
    fr: 'Confirmer',
    ar: 'تأكيد الحذف'
  },
  'Log Asset Transfer': {
    en: 'Log Asset Transfer',
    fr: 'Enregistrer le Transfert',
    ar: 'تسجيل صرف ونقل التجهيزات'
  },
  'Select Supply Item': {
    en: 'Select Supply Item',
    fr: "Sélectionner l'Article",
    ar: 'اختر التجهيز / القطعة'
  },
  'Choose item...': {
    en: 'Choose item...',
    fr: 'Choisir un article...',
    ar: 'اختر المادة من المخزن...'
  },
  'Quantity to Dispatch': {
    en: 'Quantity to Dispatch',
    fr: 'Quantité à Prélever',
    ar: 'الكمية المراد سحبها'
  },
  'Destination Residence / Team': {
    en: 'Destination Residence / Team',
    fr: 'Résidence / Équipe de Destination',
    ar: 'الإقامة الجامعية المستقبلة / فريق الصيانة'
  },
  'Confirm Dispatch': {
    en: 'Confirm Dispatch',
    fr: "Confirmer l'Envoi",
    ar: 'تأكيد الصرف والنقل'
  },
  'Total Items': {
    en: 'Total Items',
    fr: 'Articles Totaux',
    ar: 'إجمالي المواد'
  },
  'Low Stock Flags': {
    en: 'Low Stock Flags',
    fr: 'Alertes Seuil',
    ar: 'تنبيهات النواقص'
  },
  'Bedding & Linens': {
    en: 'Bedding & Linens',
    fr: 'Draps & Couvertures',
    ar: 'الأفرشة والأغطية'
  },
  'Repair Spares': {
    en: 'Repair Spares',
    fr: 'Pièces Détachées',
    ar: 'قطع الغيار والصيانة'
  },
  'No transfer logs found.': {
    en: 'No transfer logs found.',
    fr: 'Aucun log de transfert trouvé.',
    ar: 'لم يتم العثور على سجلات نقل.'
  },
  'This action cannot be undone.': {
    en: 'This action cannot be undone.',
    fr: 'Cette action ne peut pas être annulée.',
    ar: 'لا يمكن التراجع عن هذا الإجراء.'
  }
};

export default function HousingPage() {
  const lang = localStorage.getItem('lang') || 'en';
  const isAr = lang === 'ar';

  const t = (en, arOverride) => {
    if (HOUSING_DICT[en]) {
      return HOUSING_DICT[en][lang] || HOUSING_DICT[en].en || en;
    }
    if (lang === 'ar' && arOverride) {
      return arOverride;
    }
    return en;
  };

  const [inventory, setInventory] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [activeTab, setActiveTab] = useState('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Modals state
  const [showItemModal, setShowItemModal] = useState(false);
  const [itemForm, setItemForm] = useState({ name: '', category: 'Linen & Bedding', quantity: '', unit: 'pcs', min_alert_threshold: '10', supplier: '', location: '' });
  const [editingId, setEditingId] = useState(null);

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferForm, setTransferForm] = useState({ item_id: '', transfer_type: 'transfer', quantity: '', destination_residence: '' });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  // Floating Toast Notifications
  const [toast, setToast] = useState(null);

  const triggerToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, transRes] = await Promise.all([
        api.get('/housing/inventory'),
        api.get('/housing/transfers')
      ]);
      setInventory(invRes.data);
      setTransfers(transRes.data);
    } catch (err) {
      console.error(err);
      triggerToast('Error loading data from server', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleItemSubmit = async (e) => {
    e.preventDefault();
    if (!itemForm.name || !itemForm.category) {
      triggerToast('Please fill in Name and Category', 'error');
      return;
    }
    try {
      if (editingId) {
        await api.put(`/housing/inventory/${editingId}`, itemForm);
        triggerToast(lang === 'ar' ? 'تم تعديل بيانات التجهيز بنجاح' : lang === 'fr' ? 'Article modifié avec succès' : 'Supply item modified successfully');
      } else {
        await api.post('/housing/inventory', itemForm);
        triggerToast(lang === 'ar' ? 'تمت إضافة التجهيز الجديد للمخزن' : lang === 'fr' ? 'Nouvel article ajouté au stock' : 'New supply item added successfully');
      }
      setShowItemModal(false);
      setItemForm({ name: '', category: 'Linen & Bedding', quantity: '', unit: 'pcs', min_alert_threshold: '10', supplier: '', location: '' });
      setEditingId(null);
      fetchData();
    } catch (err) {
      console.error(err);
      triggerToast('Failed to save supply item', 'error');
    }
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    if (!transferForm.item_id || !transferForm.quantity || !transferForm.destination_residence) {
      triggerToast('Please complete all dispatch details', 'error');
      return;
    }
    try {
      await api.post('/housing/transfers', transferForm);
      triggerToast(lang === 'ar' ? 'تم تسجيل الصرف وتحديث المخزون بنجاح' : lang === 'fr' ? 'Transfert enregistré et stock mis à jour' : 'Transfer logged and stock updated successfully');
      setShowTransferModal(false);
      setTransferForm({ item_id: '', transfer_type: 'transfer', quantity: '', destination_residence: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.error || 'Failed to dispatch housing asset';
      triggerToast(errMsg, 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    try {
      await api.delete(`/housing/inventory/${deletingItem.id}`);
      triggerToast(lang === 'ar' ? 'تم حذف التجهيز نهائياً من السجلات' : lang === 'fr' ? 'Article supprimé définitivement' : 'Supply item permanently deleted');
      setShowDeleteModal(false);
      setDeletingItem(null);
      fetchData();
    } catch (err) {
      console.error(err);
      triggerToast('Failed to delete item', 'error');
    }
  };

  const openEditModal = (item) => {
    setItemForm({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      min_alert_threshold: item.min_alert_threshold,
      supplier: item.supplier || '',
      location: item.location || ''
    });
    setEditingId(item.id);
    setShowItemModal(true);
  };

  const filteredInventory = inventory.filter(item => {
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.supplier && item.supplier.toLowerCase().includes(q)) ||
      (item.location && item.location.toLowerCase().includes(q))
    );
  });

  // Analytics Metrics
  const totalItemsCount = inventory.length;
  const lowStockCount = inventory.filter(i => parseFloat(i.quantity) <= parseFloat(i.min_alert_threshold)).length;
  const linenCount = inventory.filter(i => i.category === 'Linen & Bedding').length;
  const sparesCount = inventory.filter(i => i.category === 'Plumbing Parts' || i.category === 'Electrical Parts' || i.category === 'General Hardware').length;

  const lowStockItems = inventory.filter(i => parseFloat(i.quantity) <= parseFloat(i.min_alert_threshold));

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} style={{ animation: 'fadeIn 0.25s ease-out' }}>
      
      {/* ── TOP HEADER PANEL ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1a1a14', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: "'Cairo', sans-serif" }}>
            <Warehouse size={28} style={{ color: '#d45c3c' }} />
            {t('Housing & Maintenance Stock')}
          </h1>
          <p style={{ fontSize: '13px', color: '#6b6456', marginTop: '4px', fontFamily: "'Cairo', sans-serif", textAlign: isAr ? 'right' : 'left' }}>
            {t('Track room assets, warm bedding, and plumbing/electrical spare parts for residencies.')}
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', flexDirection: isAr ? 'row-reverse' : 'row' }}>
          <button 
            onClick={() => setShowTransferModal(true)}
            style={{
              padding: '10px 18px', background: '#1f2410', color: '#ffffff',
              border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '700',
              display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(31,36,16,0.25)', transition: 'all 0.15s',
              flexDirection: isAr ? 'row-reverse' : 'row',
              fontFamily: "'Cairo', sans-serif"
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            <ArrowDownRight size={16} />
            {t('Log Transfer / Dispatch')}
          </button>
          
          <button 
            onClick={() => {
              setEditingId(null);
              setItemForm({ name: '', category: 'Linen & Bedding', quantity: '', unit: 'pcs', min_alert_threshold: '10', supplier: '', location: '' });
              setShowItemModal(true);
            }}
            style={{
              padding: '10px 18px', background: '#ffffff', color: '#1a1a14',
              border: '1px solid #e8e2d6', borderRadius: '10px', fontSize: '13px', fontWeight: '700',
              display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)', transition: 'all 0.15s',
              flexDirection: isAr ? 'row-reverse' : 'row',
              fontFamily: "'Cairo', sans-serif"
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            <Plus size={16} style={{ color: '#d45c3c' }} />
            {t('Add Supply Item')}
          </button>
        </div>
      </div>

      {/* ── ANALYTICS CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        
        {/* Total Items */}
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '18px 24px', border: '1px solid #e8e2d6', display: 'flex', alignItems: 'center', gap: '16px', flexDirection: isAr ? 'row-reverse' : 'row' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(212,92,60,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d45c3c' }}>
            <Warehouse size={20} />
          </div>
          <div style={{ textAlign: isAr ? 'right' : 'left' }}>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#1a1a14' }}>{totalItemsCount}</div>
            <div style={{ fontSize: '12px', color: '#8a7f72', fontFamily: "'Cairo', sans-serif" }}>{t('Total Items', 'إجمالي المواد')}</div>
          </div>
        </div>

        {/* Low Stock Warning */}
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '18px 24px', border: '1px solid #e8e2d6', display: 'flex', alignItems: 'center', gap: '16px', flexDirection: isAr ? 'row-reverse' : 'row' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: lowStockCount > 0 ? 'rgba(212,92,60,0.1)' : 'rgba(92,101,31,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: lowStockCount > 0 ? '#d45c3c' : '#5c651f' }}>
            <AlertTriangle size={20} />
          </div>
          <div style={{ textAlign: isAr ? 'right' : 'left' }}>
            <div style={{ fontSize: '24px', fontWeight: '800', color: lowStockCount > 0 ? '#d45c3c' : '#5c651f' }}>{lowStockCount}</div>
            <div style={{ fontSize: '12px', color: '#8a7f72', fontFamily: "'Cairo', sans-serif" }}>{t('Low Stock Flags', 'تنبيهات النواقص')}</div>
          </div>
        </div>

        {/* Bedding & Linens */}
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '18px 24px', border: '1px solid #e8e2d6', display: 'flex', alignItems: 'center', gap: '16px', flexDirection: isAr ? 'row-reverse' : 'row' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(212,92,60,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d45c3c' }}>
            <Bed size={20} />
          </div>
          <div style={{ textAlign: isAr ? 'right' : 'left' }}>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#1a1a14' }}>{linenCount}</div>
            <div style={{ fontSize: '12px', color: '#8a7f72', fontFamily: "'Cairo', sans-serif" }}>{t('Bedding & Linens', 'الأفرشة والأغطية')}</div>
          </div>
        </div>

        {/* Spares & Fittings */}
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '18px 24px', border: '1px solid #e8e2d6', display: 'flex', alignItems: 'center', gap: '16px', flexDirection: isAr ? 'row-reverse' : 'row' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(212,92,60,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d45c3c' }}>
            <Hammer size={20} />
          </div>
          <div style={{ textAlign: isAr ? 'right' : 'left' }}>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#1a1a14' }}>{sparesCount}</div>
            <div style={{ fontSize: '12px', color: '#8a7f72', fontFamily: "'Cairo', sans-serif" }}>{t('Repair Spares', 'قطع الغيار والصيانة')}</div>
          </div>
        </div>

      </div>

      {/* ── 🚨 HOUSING WARDROBE ALERTS BOX ── */}
      <div style={{ 
        background: '#ffffff', borderRadius: '16px', padding: '20px 24px', 
        border: '1px solid #e8e2d6', marginBottom: '28px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', flexDirection: isAr ? 'row-reverse' : 'row' }}>
          <AlertTriangle size={20} style={{ color: '#d45c3c' }} />
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1a1a14', fontFamily: "'Cairo', sans-serif" }}>
            {t('Housing Inventory Warnings')}
          </h3>
        </div>

        {lowStockItems.length > 0 ? (
          <div style={{ background: '#fdf5f2', borderLeft: isAr ? 'none' : '4px solid #d45c3c', borderRight: isAr ? '4px solid #d45c3c' : 'none', padding: '14px 18px', borderRadius: '8px' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#d45c3c', marginBottom: '6px', textAlign: isAr ? 'right' : 'left', fontFamily: "'Cairo', sans-serif" }}>
              {t('Immediate Action: Items below minimum threshold. Reorder soon!')}
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', flexDirection: isAr ? 'row-reverse' : 'row' }}>
              {lowStockItems.map(item => (
                <div key={item.id} style={{
                  padding: '4px 10px', background: '#ffffff', border: '1px solid #f2cfc2',
                  borderRadius: '6px', fontSize: '12px', fontWeight: '600', color: '#d45c3c',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  fontFamily: "'Cairo', sans-serif",
                  flexDirection: isAr ? 'row-reverse' : 'row'
                }}>
                  <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#d45c3c' }} />
                  {item.name} ({item.quantity} {item.unit})
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ background: '#f5f7f2', borderLeft: isAr ? 'none' : '4px solid #5c651f', borderRight: isAr ? '4px solid #5c651f' : 'none', padding: '14px 18px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', flexDirection: isAr ? 'row-reverse' : 'row' }}>
            <ShieldCheck size={18} style={{ color: '#5c651f' }} />
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#5c651f', fontFamily: "'Cairo', sans-serif" }}>
              {t('All housing and maintenance assets are fully stocked.')}
            </div>
          </div>
        )}
      </div>

      {/* ── MAIN LAYOUT PANELS ── */}
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e8e2d6', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
        
        {/* SUB-TABS SELECTOR */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #f5f1ea', paddingBottom: '16px', marginBottom: '20px', flexDirection: isAr ? 'row-reverse' : 'row' }}>
          <button 
            onClick={() => setActiveTab('inventory')}
            style={{
              padding: '8px 16px', borderRadius: '8px', border: 'none',
              background: activeTab === 'inventory' ? '#1a1a14' : 'transparent',
              color: activeTab === 'inventory' ? '#ffffff' : '#6b6456',
              fontWeight: '700', fontSize: '13px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.15s',
              fontFamily: "'Cairo', sans-serif",
              flexDirection: isAr ? 'row-reverse' : 'row'
            }}
          >
            <Warehouse size={15} />
            {t('Active Supply Inventory')}
          </button>
          
          <button 
            onClick={() => setActiveTab('transfers')}
            style={{
              padding: '8px 16px', borderRadius: '8px', border: 'none',
              background: activeTab === 'transfers' ? '#1a1a14' : 'transparent',
              color: activeTab === 'transfers' ? '#ffffff' : '#6b6456',
              fontWeight: '700', fontSize: '13px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.15s',
              fontFamily: "'Cairo', sans-serif",
              flexDirection: isAr ? 'row-reverse' : 'row'
            }}
          >
            <ClipboardList size={15} />
            {t('Transfer & Dispatch Logs')}
          </button>
        </div>

        {/* ── TAB 1: SUPPLY INVENTORY GRID ── */}
        {activeTab === 'inventory' && (
          <div>
            {/* Search filter bar */}
            <div style={{ position: 'relative', marginBottom: '20px', display: 'flex', justifyContent: isAr ? 'flex-end' : 'flex-start' }}>
              <Search size={16} style={{ 
                position: 'absolute', top: '50%', transform: 'translateY(-50%)', 
                left: isAr ? 'auto' : '16px', right: isAr ? '16px' : 'auto',
                color: '#8a7f72' 
              }} />
              <input 
                type="text" 
                placeholder={t('Search items by name, category, or supplier...')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', maxWidth: '380px', padding: '10px 16px 10px 42px',
                  paddingLeft: isAr ? '16px' : '42px', paddingRight: isAr ? '42px' : '16px',
                  background: '#fafaf7', border: '1px solid #e8e2d6',
                  borderRadius: '10px', fontSize: '13px', color: '#1a1a14',
                  textAlign: isAr ? 'right' : 'left',
                  fontFamily: "'Cairo', sans-serif"
                }}
              />
            </div>

            {/* Inventory table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isAr ? 'right' : 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #fafaf7' }}>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: '#8a7f72', letterSpacing: '0.5px', fontFamily: "'Cairo', sans-serif" }}>{t('ITEM NAME')}</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: '#8a7f72', letterSpacing: '0.5px', fontFamily: "'Cairo', sans-serif" }}>{t('CATEGORY')}</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: '#8a7f72', letterSpacing: '0.5px', fontFamily: "'Cairo', sans-serif" }}>{t('STOCK QUANTITY')}</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: '#8a7f72', letterSpacing: '0.5px', fontFamily: "'Cairo', sans-serif" }}>{t('ALERT LIMIT')}</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: '#8a7f72', letterSpacing: '0.5px', fontFamily: "'Cairo', sans-serif" }}>{t('SUPPLIER')}</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: '#8a7f72', letterSpacing: '0.5px', fontFamily: "'Cairo', sans-serif" }}>{t('LOCATION')}</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: '#8a7f72', letterSpacing: '0.5px', fontFamily: "'Cairo', sans-serif" }}>{t('SAFETY STATUS')}</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: '#8a7f72', letterSpacing: '0.5px', textAlign: 'center', fontFamily: "'Cairo', sans-serif" }}>{t('ACTIONS')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ padding: '40px 16px', textAlign: 'center', color: '#8a7f72', fontSize: '13px' }}>
                        {loading ? '↻ Loading supply records...' : 'No room supplies or spare parts found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredInventory.map(item => {
                      const isLow = parseFloat(item.quantity) <= parseFloat(item.min_alert_threshold);
                      return (
                        <tr key={item.id} style={{ borderBottom: '1px solid #f5f1ea', transition: 'background 0.1s' }} onMouseEnter={e => e.currentTarget.style.background = '#fafaf7'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '700', color: '#1a1a14' }}>{item.name}</td>
                          <td style={{ padding: '14px 16px', fontSize: '12px', color: '#6b6456', fontWeight: '600', fontFamily: "'Cairo', sans-serif" }}>
                            {t(item.category)}
                          </td>
                          <td style={{ padding: '14px 16px', fontSize: '13px', color: '#1a1a14', fontWeight: '700' }}>
                            {parseFloat(item.quantity)} <span style={{ fontSize: '11px', color: '#8a7f72', fontWeight: '500' }}>{item.unit}</span>
                          </td>
                          <td style={{ padding: '14px 16px', fontSize: '13px', color: '#8a7f72', fontWeight: '600' }}>
                            {parseFloat(item.min_alert_threshold)} <span style={{ fontSize: '11px' }}>{item.unit}</span>
                          </td>
                          <td style={{ padding: '14px 16px', fontSize: '12px', color: '#8a7f72' }}>{item.supplier || '—'}</td>
                          <td style={{ padding: '14px 16px', fontSize: '12px', color: '#8a7f72' }}>{item.location || '—'}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{
                              padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700',
                              background: isLow ? '#fdf5f2' : '#f5f7f2',
                              color: isLow ? '#d45c3c' : '#5c651f',
                              border: `1px solid ${isLow ? '#f2cfc2' : '#d2dbcb'}`,
                              display: 'inline-block', fontFamily: "'Cairo', sans-serif"
                            }}>
                              {isLow ? t('LOW STOCK') : t('WELL STOCKED')}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button 
                                onClick={() => openEditModal(item)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b6456', padding: '4px', borderRadius: '6px' }}
                              >
                                <Edit2 size={14} />
                              </button>
                              <button 
                                onClick={() => { setDeletingItem(item); setShowDeleteModal(true); }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d45c3c', padding: '4px', borderRadius: '6px' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 2: TRANSFER & TECH DISPATCH LOGS ── */}
        {activeTab === 'transfers' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isAr ? 'right' : 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #fafaf7' }}>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: '#8a7f72', letterSpacing: '0.5px', fontFamily: "'Cairo', sans-serif" }}>{t('TRANSFERRED AT')}</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: '#8a7f72', letterSpacing: '0.5px', fontFamily: "'Cairo', sans-serif" }}>{t('PERFORMED BY')}</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: '#8a7f72', letterSpacing: '0.5px', fontFamily: "'Cairo', sans-serif" }}>{t('DISPATCH TYPE')}</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: '#8a7f72', letterSpacing: '0.5px', fontFamily: "'Cairo', sans-serif" }}>{t('ITEM DISPATCHED')}</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: '#8a7f72', letterSpacing: '0.5px', fontFamily: "'Cairo', sans-serif" }}>{t('QTY DISPATCHED')}</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: '#8a7f72', letterSpacing: '0.5px', fontFamily: "'Cairo', sans-serif" }}>{t('DESTINATION')}</th>
                </tr>
              </thead>
              <tbody>
                {transfers.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '40px 16px', textAlign: 'center', color: '#8a7f72', fontSize: '13px' }}>
                      {t('No transfer logs found.')}
                    </td>
                  </tr>
                ) : (
                  transfers.map(log => {
                    const isTransfer = log.transfer_type === 'transfer';
                    return (
                      <tr key={log.id} style={{ borderBottom: '1px solid #f5f1ea' }}>
                        <td style={{ padding: '14px 16px', fontSize: '12px', color: '#8a7f72' }}>
                          {new Date(log.transferred_at).toLocaleString(lang === 'ar' ? 'ar-DZ' : 'fr-FR')}
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600', color: '#1a1a14' }}>
                          {log.user_name || 'Admin'}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700',
                            background: isTransfer ? 'rgba(92,101,31,0.1)' : 'rgba(212,92,60,0.1)',
                            color: isTransfer ? '#5c651f' : '#d45c3c',
                            fontFamily: "'Cairo', sans-serif"
                          }}>
                            {isTransfer ? t('Linen Transfer') : t('Maintenance Use')}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '700', color: '#1a1a14' }}>
                          {log.item_name}
                          <div style={{ fontSize: '10px', color: '#8a7f72', fontWeight: '500', marginTop: '2px', fontFamily: "'Cairo', sans-serif" }}>
                            {t(log.item_category)}
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '800', color: '#d45c3c' }}>
                          -{parseFloat(log.quantity)} <span style={{ fontSize: '11px', color: '#8a7f72', fontWeight: '500' }}>{log.item_unit}</span>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '12px', fontWeight: '600', color: '#1a1a14' }}>
                          {log.destination_residence}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* ── MODAL: ADD / EDIT SUPPLY ITEM ── */}
      {showItemModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(26,26,20,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '480px',
            border: '1px solid #e8e2d6', padding: '24px', boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
            textAlign: isAr ? 'right' : 'left'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f5f1ea', paddingBottom: '14px', marginBottom: '20px', flexDirection: isAr ? 'row-reverse' : 'row' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1a1a14', fontFamily: "'Cairo', sans-serif" }}>
                {editingId ? t('Edit Supply Item') : t('Add Supply Item')}
              </h3>
              <button onClick={() => setShowItemModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8a7f72' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleItemSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#6b6456', marginBottom: '6px', fontFamily: "'Cairo', sans-serif" }}>
                  {t('ITEM NAME')}
                </label>
                <input 
                  type="text" 
                  value={itemForm.name}
                  onChange={e => setItemForm({ ...itemForm, name: e.target.value })}
                  placeholder="e.g. Warm Woolen Blankets, Brass Pipes 1/2..."
                  style={{
                    width: '100%', padding: '10px 14px', border: '1px solid #e8e2d6',
                    borderRadius: '8px', fontSize: '13px', background: '#fafaf7', color: '#1a1a14',
                    textAlign: isAr ? 'right' : 'left',
                    fontFamily: "'Cairo', sans-serif"
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#6b6456', marginBottom: '6px', fontFamily: "'Cairo', sans-serif" }}>
                    {t('CATEGORY')}
                  </label>
                  <select 
                    value={itemForm.category}
                    onChange={e => setItemForm({ ...itemForm, category: e.target.value })}
                    style={{
                      width: '100%', padding: '10px 14px', border: '1px solid #e8e2d6',
                      borderRadius: '8px', fontSize: '13px', background: '#fafaf7', color: '#1a1a14',
                      fontFamily: "'Cairo', sans-serif"
                    }}
                  >
                    <option value="Linen & Bedding">{t('Linen & Bedding')}</option>
                    <option value="Plumbing Parts">{t('Plumbing Parts')}</option>
                    <option value="Electrical Parts">{t('Electrical Parts')}</option>
                    <option value="General Hardware">{t('General Hardware')}</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#6b6456', marginBottom: '6px', fontFamily: "'Cairo', sans-serif" }}>
                    Unit
                  </label>
                  <input 
                    type="text" 
                    value={itemForm.unit}
                    onChange={e => setItemForm({ ...itemForm, unit: e.target.value })}
                    placeholder="pcs, meters, units..."
                    style={{
                      width: '100%', padding: '10px 14px', border: '1px solid #e8e2d6',
                      borderRadius: '8px', fontSize: '13px', background: '#fafaf7', color: '#1a1a14',
                      textAlign: isAr ? 'right' : 'left',
                      fontFamily: "'Cairo', sans-serif"
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#6b6456', marginBottom: '6px', fontFamily: "'Cairo', sans-serif" }}>
                    {t('STOCK QUANTITY')}
                  </label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={itemForm.quantity}
                    onChange={e => setItemForm({ ...itemForm, quantity: e.target.value })}
                    placeholder="0.00"
                    style={{
                      width: '100%', padding: '10px 14px', border: '1px solid #e8e2d6',
                      borderRadius: '8px', fontSize: '13px', background: '#fafaf7', color: '#1a1a14',
                      textAlign: isAr ? 'right' : 'left',
                      fontFamily: "'Cairo', sans-serif"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#6b6456', marginBottom: '6px', fontFamily: "'Cairo', sans-serif" }}>
                    {t('ALERT LIMIT')}
                  </label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={itemForm.min_alert_threshold}
                    onChange={e => setItemForm({ ...itemForm, min_alert_threshold: e.target.value })}
                    placeholder="10.00"
                    style={{
                      width: '100%', padding: '10px 14px', border: '1px solid #e8e2d6',
                      borderRadius: '8px', fontSize: '13px', background: '#fafaf7', color: '#1a1a14',
                      textAlign: isAr ? 'right' : 'left',
                      fontFamily: "'Cairo', sans-serif"
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#6b6456', marginBottom: '6px', fontFamily: "'Cairo', sans-serif" }}>
                    {t('SUPPLIER')}
                  </label>
                  <input 
                    type="text" 
                    value={itemForm.supplier}
                    onChange={e => setItemForm({ ...itemForm, supplier: e.target.value })}
                    placeholder="e.g. Central DOU Warehouse"
                    style={{
                      width: '100%', padding: '10px 14px', border: '1px solid #e8e2d6',
                      borderRadius: '8px', fontSize: '13px', background: '#fafaf7', color: '#1a1a14',
                      textAlign: isAr ? 'right' : 'left',
                      fontFamily: "'Cairo', sans-serif"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#6b6456', marginBottom: '6px', fontFamily: "'Cairo', sans-serif" }}>
                    {t('LOCATION')}
                  </label>
                  <input 
                    type="text" 
                    value={itemForm.location}
                    onChange={e => setItemForm({ ...itemForm, location: e.target.value })}
                    placeholder="e.g. Central Depot B"
                    style={{
                      width: '100%', padding: '10px 14px', border: '1px solid #e8e2d6',
                      borderRadius: '8px', fontSize: '13px', background: '#fafaf7', color: '#1a1a14',
                      textAlign: isAr ? 'right' : 'left',
                      fontFamily: "'Cairo', sans-serif"
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px', flexDirection: isAr ? 'row-reverse' : 'row' }}>
                <button 
                  type="button" 
                  onClick={() => setShowItemModal(false)}
                  style={{
                    padding: '8px 16px', background: 'none', border: '1px solid #e8e2d6',
                    borderRadius: '8px', fontSize: '12px', color: '#6b6456', cursor: 'pointer',
                    fontFamily: "'Cairo', sans-serif"
                  }}
                >
                  {t('Cancel')}
                </button>
                <button 
                  type="submit"
                  style={{
                    padding: '8px 20px', background: '#d45c3c', color: '#ffffff',
                    border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                    fontFamily: "'Cairo', sans-serif"
                  }}
                >
                  {t('Save Item')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: LOG TRANSFER / DISPATCH ── */}
      {showTransferModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(26,26,20,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '440px',
            border: '1px solid #e8e2d6', padding: '24px', boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
            textAlign: isAr ? 'right' : 'left'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f5f1ea', paddingBottom: '14px', marginBottom: '20px', flexDirection: isAr ? 'row-reverse' : 'row' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1a1a14', fontFamily: "'Cairo', sans-serif" }}>
                {t('Log Asset Transfer')}
              </h3>
              <button onClick={() => setShowTransferModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8a7f72' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#6b6456', marginBottom: '6px', fontFamily: "'Cairo', sans-serif" }}>
                  {t('Select Supply Item')}
                </label>
                <select 
                  value={transferForm.item_id}
                  onChange={e => setItemForm && setTransferForm({ ...transferForm, item_id: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 14px', border: '1px solid #e8e2d6',
                    borderRadius: '8px', fontSize: '13px', background: '#fafaf7', color: '#1a1a14',
                    fontFamily: "'Cairo', sans-serif"
                  }}
                >
                  <option value="">{t('Choose item...')}</option>
                  {inventory.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({parseFloat(item.quantity)} {item.unit} available)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#6b6456', marginBottom: '6px', fontFamily: "'Cairo', sans-serif" }}>
                  {t('DISPATCH TYPE')}
                </label>
                <select 
                  value={transferForm.transfer_type}
                  onChange={e => setTransferForm({ ...transferForm, transfer_type: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 14px', border: '1px solid #e8e2d6',
                    borderRadius: '8px', fontSize: '13px', background: '#fafaf7', color: '#1a1a14',
                    fontFamily: "'Cairo', sans-serif"
                  }}
                >
                  <option value="transfer">{t('Linen Transfer')}</option>
                  <option value="maintenance_use">{t('Maintenance Use')}</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#6b6456', marginBottom: '6px', fontFamily: "'Cairo', sans-serif" }}>
                  {t('Quantity to Dispatch')}
                </label>
                <input 
                  type="number" 
                  step="0.01"
                  value={transferForm.quantity}
                  onChange={e => setTransferForm({ ...transferForm, quantity: e.target.value })}
                  placeholder="0.00"
                  style={{
                    width: '100%', padding: '10px 14px', border: '1px solid #e8e2d6',
                    borderRadius: '8px', fontSize: '13px', background: '#fafaf7', color: '#1a1a14',
                    textAlign: isAr ? 'right' : 'left',
                    fontFamily: "'Cairo', sans-serif"
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#6b6456', marginBottom: '6px', fontFamily: "'Cairo', sans-serif" }}>
                  {t('Destination Residence / Team')}
                </label>
                <input 
                  type="text" 
                  value={transferForm.destination_residence}
                  onChange={e => setTransferForm({ ...transferForm, destination_residence: e.target.value })}
                  placeholder="e.g. Hassan Khira dining / Technicians Team A"
                  style={{
                    width: '100%', padding: '10px 14px', border: '1px solid #e8e2d6',
                    borderRadius: '8px', fontSize: '13px', background: '#fafaf7', color: '#1a1a14',
                    textAlign: isAr ? 'right' : 'left',
                    fontFamily: "'Cairo', sans-serif"
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px', flexDirection: isAr ? 'row-reverse' : 'row' }}>
                <button 
                  type="button" 
                  onClick={() => setShowTransferModal(false)}
                  style={{
                    padding: '8px 16px', background: 'none', border: '1px solid #e8e2d6',
                    borderRadius: '8px', fontSize: '12px', color: '#6b6456', cursor: 'pointer',
                    fontFamily: "'Cairo', sans-serif"
                  }}
                >
                  {t('Cancel')}
                </button>
                <button 
                  type="submit"
                  style={{
                    padding: '8px 20px', background: '#1f2410', color: '#ffffff',
                    border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                    fontFamily: "'Cairo', sans-serif"
                  }}
                >
                  {t('Confirm Dispatch')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: CONFIRM DELETE ITEM ── */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(26,26,20,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          animation: 'fadeIn 0.15s ease-out'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '380px',
            border: '1px solid #e8e2d6', padding: '24px', boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
            textAlign: isAr ? 'right' : 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', flexDirection: isAr ? 'row-reverse' : 'row' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#fdf5f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d45c3c', flexShrink: 0 }}>
                <AlertTriangle size={18} />
              </div>
              <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#1a1a14', fontFamily: "'Cairo', sans-serif" }}>
                {t('Delete Item?')}
              </h3>
            </div>
            
            <p style={{ fontSize: '13px', color: '#6b6456', lineHeight: '1.5', fontFamily: "'Cairo', sans-serif" }}>
              {t('Are you sure you want to permanently delete')} <strong>{deletingItem?.name}</strong>? {t('This action cannot be undone.')}
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px', flexDirection: isAr ? 'row-reverse' : 'row' }}>
              <button 
                onClick={() => setShowDeleteModal(false)}
                style={{
                  padding: '8px 14px', background: 'none', border: '1px solid #e8e2d6',
                  borderRadius: '8px', fontSize: '12px', color: '#6b6456', cursor: 'pointer',
                  fontFamily: "'Cairo', sans-serif"
                }}
              >
                {t('Cancel')}
              </button>
              <button 
                onClick={handleDeleteConfirm}
                style={{
                  padding: '8px 18px', background: '#d45c3c', color: '#ffffff',
                  border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                  fontFamily: "'Cairo', sans-serif"
                }}
              >
                {t('Confirm Delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PREMIUM SUCCESS TOAST NOTIFICATION ── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', right: isAr ? 'auto' : '24px', left: isAr ? '24px' : 'auto',
          background: toast.type === 'error' ? '#fdf5f2' : '#f5f7f2',
          border: `1px solid ${toast.type === 'error' ? '#f2cfc2' : '#d2dbcb'}`,
          borderRadius: '12px', padding: '14px 20px',
          boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
          zIndex: 2000, display: 'flex', alignItems: 'center', gap: '12px',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          flexDirection: isAr ? 'row-reverse' : 'row'
        }}>
          <div style={{
            width: '24px', height: '24px', borderRadius: '50%',
            background: toast.type === 'error' ? '#d45c3c' : '#5c651f',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', flexShrink: 0
          }}>
            {toast.type === 'error' ? <Info size={13} /> : <Check size={13} />}
          </div>
          <span style={{ fontSize: '13px', fontWeight: '700', color: toast.type === 'error' ? '#d45c3c' : '#1f2410', fontFamily: "'Cairo', sans-serif" }}>
            {toast.message}
          </span>
        </div>
      )}

    </div>
  );
}
