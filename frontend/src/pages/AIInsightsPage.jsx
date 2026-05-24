import { useState, useEffect } from 'react';
import api from '../api/axios';
import { BrainCircuit, RefreshCw, Loader2, AlertCircle, CheckCircle2, AlertTriangle, Sparkles, Printer, Send, Camera, GitCompare, Search, Layers } from 'lucide-react';

const T = {
  fullAnalysis: { en: 'Full Analysis', ar: 'تحليل كامل', fr: 'Analyse complète' },
  deepDive: { en: 'Deep-Dive', ar: 'تحليل متعمق', fr: 'Analyse approfondie' },
  askAi: { en: 'Ask AI', ar: 'اسأل الذكاء الاصطناعي', fr: 'Demander à l\'IA' },
  compare: { en: 'Compare', ar: 'مقارنة', fr: 'Comparer' },
  snapshots: { en: 'Snapshots', ar: 'لقطات', fr: 'Instantanés' },
  title: { en: 'AI Operations Analyst', ar: 'محلل العمليات بالذكاء الاصطناعي', fr: 'Analyste des opérations IA' },
  subtitle: { en: 'Real-time analysis from your database', ar: 'تحليل فوري من قاعدة بياناتك', fr: 'Analyse en temps réel depuis votre base de données' },
  dataDriven: { en: 'Data-driven analysis', ar: 'تحليل معتمد على البيانات', fr: 'Analyse basée sur les données' },
  updated: { en: 'Updated', ar: 'آخر تحديث', fr: 'Mis à jour' },
  pdfReport: { en: 'PDF Report', ar: 'تقرير PDF', fr: 'Rapport PDF' },
  refresh: { en: 'Refresh Data', ar: 'تحديث البيانات', fr: 'Actualiser les données' },
  refreshing: { en: 'Refreshing...', ar: 'جاري التحديث...', fr: 'Actualisation...' },
  studentsHoused: { en: 'Students Housed', ar: 'الطلاب المسكنون', fr: 'Étudiants logés' },
  totalRooms: { en: 'Total Rooms', ar: 'إجمالي الغرف', fr: 'Total des chambres' },
  full: { en: 'full', ar: 'ممتلئ', fr: 'plein' },
  activeTickets: { en: 'Active Tickets', ar: 'التذاكر النشطة', fr: 'Tickets actifs' },
  pending: { en: 'pending', ar: 'معلقة', fr: 'en attente' },
  expiredFood: { en: 'Expired Food', ar: 'أطعمة منتهية الصلاحية', fr: 'Aliments périmés' },
  expiringSoon: { en: 'expiring soon', ar: 'تنتهي قريباً', fr: 'expire bientôt' },
  openItIssues: { en: 'Open IT Issues', ar: 'مشاكل تقنية مفتوحة', fr: 'Problèmes IT ouverts' },
  services: { en: 'services', ar: 'خدمات', fr: 'services' },
  lowStockItems: { en: 'Low Stock Items', ar: 'عناصر المخزون المنخفض', fr: 'Articles en stock faible' },
  tracked: { en: 'tracked', ar: 'مُتابَع', fr: 'suivis' },
  residenceCapacity: { en: 'Residence Capacity', ar: 'سعة الإقامة', fr: 'Capacité de la résidence' },
  departmentHealth: { en: 'Department Health', ar: 'صحة الأقسام', fr: 'Santé des départements' },
  students: { en: 'Students', ar: 'الطلاب', fr: 'Étudiants' },
  rooms: { en: 'Rooms', ar: 'الغرف', fr: 'Chambres' },
  occupancy: { en: 'Occupancy', ar: 'الإشغال', fr: 'Occupation' },
  expiredFoodLabel: { en: 'Expired Food', ar: 'أطعمة منتهية', fr: 'Aliments périmés' },
  openItIssuesLabel: { en: 'Open IT Issues', ar: 'مشاكل تقنية', fr: 'Problèmes IT' },
  executiveSummary: { en: 'Executive Summary', ar: 'ملخص تنفيذي', fr: 'Résumé exécutif' },
  basedOn: { en: 'Based on', ar: 'بناءً على', fr: 'Basé sur' },
  stockItems: { en: 'stock items', ar: 'عناصر مخزون', fr: 'articles en stock' },
  itDevices: { en: 'IT devices', ar: 'أجهزة تقنية', fr: 'appareils IT' },
  problems: { en: 'Problems', ar: 'المشاكل', fr: 'Problèmes' },
  risks: { en: 'Risks', ar: 'المخاطر', fr: 'Risques' },
  recommendations: { en: 'Recommendations', ar: 'التوصيات', fr: 'Recommandations' },
  noneIdentified: { en: 'None identified', ar: 'لم يتم تحديد أي منها', fr: 'Aucun identifié' },
  deepDiveDesc: { en: 'Select a department to get a focused AI analysis of that area alone. Uses the same live data as the full report.', ar: 'اختر قسمًا للحصول على تحليل مركز بالذكاء الاصطناعي لتلك المنطقة فقط. يستخدم نفس البيانات الحية للتقرير الكامل.', fr: 'Sélectionnez un département pour obtenir une analyse IA ciblée de ce seul secteur. Utilise les mêmes données en direct que le rapport complet.' },
  analyze: { en: 'Analyze', ar: 'تحليل', fr: 'Analyser' },
  analyzing: { en: 'Analyzing...', ar: 'جاري التحليل...', fr: 'Analyse en cours...' },
  deepDiveResults: { en: 'Deep-Dive Results', ar: 'نتائج التحليل المتعمق', fr: 'Résultats de l\'analyse approfondie' },
  rawDataAvailable: { en: 'Raw data available. Enable AI API for generated analysis.', ar: 'البيانات الأولية متاحة. قم بتمكين واجهة برمجة تطبيقات الذكاء الاصطناعي للتحليل.', fr: 'Données brutes disponibles. Activez l\'API IA pour une analyse générée.' },
  findings: { en: 'Findings', ar: 'النتائج', fr: 'Résultats' },
  askAiDesc: { en: 'Ask any question about the residence data. The AI searches across all departments and answers from live database numbers.', ar: 'اسأل أي سؤال حول بيانات الإقامة. يبحث الذكاء الاصطناعي في جميع الأقسام ويجيب من أرقام قاعدة البيانات الحية.', fr: 'Posez n\'importe quelle question sur les données de la résidence. L\'IA recherche dans tous les départements et répond à partir des chiffres de la base de données en direct.' },
  askPlaceholder: { en: 'Ask anything about the residence data...', ar: 'اسأل أي شيء عن بيانات الإقامة...', fr: 'Posez une question sur les données de la résidence...' },
  ask: { en: 'Ask', ar: 'اسأل', fr: 'Demander' },
  yourQuestion: { en: 'Your Question', ar: 'سؤالك', fr: 'Votre question' },
  aiAnswer: { en: 'AI Answer · Based on live data', ar: 'إجابة الذكاء الاصطناعي · بناءً على البيانات الحية', fr: 'Réponse IA · Basée sur les données en direct' },
  answeredBy: { en: 'Answered by:', ar: 'الإجابة بواسطة:', fr: 'Répondu par:' },
  searching: { en: 'Searching across all system data...', ar: 'جاري البحث في جميع بيانات النظام...', fr: 'Recherche dans toutes les données système...' },
  compareDesc: { en: 'Compare two departments side-by-side to find correlations, tensions, or shared patterns. Useful for understanding cross-team impact.', ar: 'قارن بين قسمين جنبًا إلى جنب للعثور على الارتباطات أو التوترات أو الأنماط المشتركة. مفيد لفهم التأثير عبر الفرق.', fr: 'Comparez deux départements côte à côte pour trouver des corrélations, des tensions ou des modèles partagés. Utile pour comprendre l\'impact interservices.' },
  vs: { en: 'vs', ar: 'مقابل', fr: 'vs' },
  compareLabel: { en: 'Compare', ar: 'مقارنة', fr: 'Comparer' },
  comparing: { en: 'Comparing...', ar: 'جاري المقارنة...', fr: 'Comparaison en cours...' },
  crossDeptCorrelations: { en: 'Cross-Department Correlations', ar: 'الارتباطات عبر الأقسام', fr: 'Corrélations interservices' },
  jointRecommendations: { en: 'Joint Recommendations', ar: 'توصيات مشتركة', fr: 'Recommandations conjointes' },
  crossModuleAvailable: { en: 'Cross-module analysis available with AI API configured.', ar: 'التحليل عبر الوحدات متاح عند تكوين واجهة برمجة تطبيقات الذكاء الاصطناعي.', fr: 'Analyse intermodules disponible avec l\'API IA configurée.' },
  snapshotsDesc: { en: 'Snapshots save the current state of all departments so you can compare changes over time. Take one now, then take another later to see what changed.', ar: 'تحفظ اللقطات الحالة الحالية لجميع الأقسام حتى تتمكن من مقارنة التغييرات بمرور الوقت. التقط لقطة الآن، ثم التقط أخرى لاحقًا لترى ما تغير.', fr: 'Les instantanés sauvegardent l\'état actuel de tous les départements afin que vous puissiez comparer les changements dans le temps. Prenez-en un maintenant, puis un autre plus tard pour voir ce qui a changé.' },
  takeSnapshot: { en: 'Take Snapshot', ar: 'التقاط لقطة', fr: 'Prendre un instantané' },
  saving: { en: 'Saving...', ar: 'جاري الحفظ...', fr: 'Enregistrement...' },
  compareWithPrevious: { en: 'Compare with Previous', ar: 'مقارنة مع السابق', fr: 'Comparer avec le précédent' },
  changes: { en: 'Changes:', ar: 'التغييرات:', fr: 'Changements:' },
  earlier: { en: 'earlier', ar: 'سابق', fr: 'précédent' },
  now: { en: 'now', ar: 'الآن', fr: 'maintenant' },
  noSignificantChanges: { en: 'No significant changes between these snapshots.', ar: 'لا توجد تغييرات كبيرة بين هذه اللقطات.', fr: 'Aucun changement significatif entre ces instantanés.' },
  aiTrendAnalysis: { en: 'AI Trend Analysis', ar: 'تحليل الاتجاهات بالذكاء الاصطناعي', fr: 'Analyse des tendances IA' },
  recommendedActions: { en: 'Recommended Actions', ar: 'الإجراءات الموصى بها', fr: 'Actions recommandées' },
  loadingAnalyzing: { en: 'AI is analyzing your system data...', ar: 'الذكاء الاصطناعي يحلل بيانات نظامك...', fr: 'L\'IA analyse les données de votre système...' },
  loadingQuerying: { en: 'Querying 8 data sources across all departments', ar: 'جاري الاستعلام من 8 مصادر بيانات عبر جميع الأقسام', fr: 'Interrogation de 8 sources de données dans tous les départements' },
  errGenerate: { en: 'Failed to generate insights. The AI provider may be busy — please try again.', ar: 'فشل في إنشاء التحليلات. قد يكون مزود الذكاء الاصطناعي مشغولاً - يرجى المحاولة مرة أخرى.', fr: 'Échec de la génération d\'analyses. Le fournisseur d\'IA est peut-être occupé — veuillez réessayer.' },
  errDeepDive: { en: 'Failed to analyze this module.', ar: 'فشل في تحليل هذه الوحدة.', fr: 'Échec de l\'analyse de ce module.' },
  errQuery: { en: 'Failed to get an answer.', ar: 'فشل في الحصول على إجابة.', fr: 'Échec de l\'obtention d\'une réponse.' },
  errCompare: { en: 'Failed to compare modules.', ar: 'فشل في مقارنة الوحدات.', fr: 'Échec de la comparaison des modules.' },
  errSnapshot: { en: 'Failed to save snapshot.', ar: 'فشل في حفظ اللقطة.', fr: 'Échec de la sauvegarde de l\'instantané.' },
  errCompareSnap: { en: 'Failed to compare snapshots.', ar: 'فشل في مقارنة اللقطات.', fr: 'Échec de la comparaison des instantanés.' },
  snapshotSaved: { en: 'Snapshot saved successfully!', ar: 'تم حفظ اللقطة بنجاح!', fr: 'Instantané sauvegardé avec succès!' },
  snapshotFailed: { en: 'Failed to save snapshot.', ar: 'فشل في حفظ اللقطة.', fr: 'Échec de la sauvegarde de l\'instantané.' },
  reportTitle: { en: 'Residency Operations & Analysis Report', ar: 'تقرير عمليات وتحليلات الإقامة', fr: 'Rapport des opérations et analyses de la résidence' },
  housedStudents: { en: 'Housed Students', ar: 'الطلاب المسكنون', fr: 'Étudiants logés' },
  occupancyRate: { en: 'Occupancy Rate', ar: 'معدل الإشغال', fr: "Taux d'occupation" },
  identifiedProblems: { en: 'Identified Problems', ar: 'المشاكل المحددة', fr: 'Problèmes identifiés' },
  noCriticalProblems: { en: 'No critical problems identified.', ar: 'لم يتم تحديد مشاكل حرجة.', fr: 'Aucun problème critique identifié.' },
  potentialRisks: { en: 'Potential Risks', ar: 'المخاطر المحتملة', fr: 'Risques potentiels' },
  noHighRisks: { en: 'No high risks identified.', ar: 'لم يتم تحديد مخاطر عالية.', fr: 'Aucun risque élevé identifié.' },
  strategicRecommendations: { en: 'Strategic Recommendations', ar: 'التوصيات الاستراتيجية', fr: 'Recommandations stratégiques' },
  noRecommendations: { en: 'No recommendations.', ar: 'لا توجد توصيات.', fr: 'Aucune recommandation.' },
  generatedBy: { en: 'Report generated by UniManage AI Platform.', ar: 'التقرير من generated بواسطة منصة UniManage AI.', fr: 'Rapport généré par la plateforme UniManage AI.' },
  directorApproval: { en: 'Director Approval Signature', ar: 'توقيع اعتماد المدير', fr: 'Signature d\'approbation du directeur' },
};

const MODULE_LABELS = {
  residence: { en: 'Residence & Rooms', ar: 'الإقامة والغرف', fr: 'Résidence et chambres' },
  maintenance: { en: 'Maintenance Tickets', ar: 'تذاكر الصيانة', fr: 'Tickets de maintenance' },
  catering: { en: 'Catering & Food Stock', ar: 'الإطعام ومخزون الطعام', fr: 'Catering et stock alimentaire' },
  housing: { en: 'Housing Supplies', ar: 'مستلزمات الإيواء', fr: 'Fournitures de logement' },
  it: { en: 'IT Infrastructure', ar: 'البنية التحتية لتقنية المعلومات', fr: 'Infrastructure IT' },
  activity: { en: 'Staff Activity', ar: 'نشاط الموظفين', fr: 'Activité du personnel' },
};

const MODULES = ['residence', 'maintenance', 'catering', 'housing', 'it', 'activity'];

function InsightCard({ icon, title, items, bg, headerBg, borderColor, dotColor, isAr }) {
  return (
    <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e8e2d6', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
      <div style={{ padding: '13px 16px', background: headerBg, borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', gap: '8px' }}>{icon}<span style={{ fontSize: '13px', fontWeight: '700', color: '#1a1a14', fontFamily: isAr ? "'Cairo', sans-serif" : '' }}>{title}</span></div>
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {items?.length ? items.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: dotColor, marginTop: '7px', flexShrink: 0 }} />
            <span style={{ fontSize: '13px', color: '#5a5248', lineHeight: '1.55', fontFamily: isAr ? "'Cairo', sans-serif" : '' }}>{item}</span>
          </div>
        )) : <span style={{ fontSize: '13px', color: '#c4bfb5', fontFamily: isAr ? "'Cairo', sans-serif" : '' }}>None identified</span>}
      </div>
    </div>
  );
}

function StatBar({ label, value, max, color, unit, isAr }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <span style={{ fontSize: '12px', fontWeight: '600', color: '#5a5248', minWidth: '110px', fontFamily: isAr ? "'Cairo', sans-serif" : '' }}>{label}</span>
      <div style={{ flex: 1, height: '8px', borderRadius: '4px', background: '#f0ede8', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: '4px', background: color, transition: 'width 0.5s' }} />
      </div>
      <span style={{ fontSize: '12px', fontWeight: '700', color: '#1a1a14', minWidth: '60px', textAlign: isAr ? 'left' : 'right' }}>{value}{unit || ''}</span>
    </div>
  );
}

function KpiCard({ value, label, sub, color, isAr }) {
  return (
    <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e8e2d6', padding: '16px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <div style={{ fontSize: '26px', fontWeight: '800', color: color || '#d45c3c', marginBottom: '2px' }}>{value}</div>
      <div style={{ fontSize: '12px', color: '#6b6456', fontWeight: '600', fontFamily: isAr ? "'Cairo', sans-serif" : '' }}>{label}</div>
      {sub && <div style={{ fontSize: '11px', color: '#c4bfb5', marginTop: '2px', fontFamily: isAr ? "'Cairo', sans-serif" : '' }}>{sub}</div>}
    </div>
  );
}

export default function AIInsightsPage() {
  const curLang = localStorage.getItem('lang') || 'en';
  const isAr = curLang === 'ar';
  const t = (key) => T[key]?.[curLang] || T[key]?.en || key;
  const ml = (key) => MODULE_LABELS[key]?.[curLang] || MODULE_LABELS[key]?.en || key;

  const TABS = [
    { key: 'insights', label: t('fullAnalysis'), icon: BrainCircuit },
    { key: 'deepdive', label: t('deepDive'), icon: Search },
    { key: 'query', label: t('askAi'), icon: Send },
    { key: 'compare', label: t('compare'), icon: GitCompare },
    { key: 'snapshots', label: t('snapshots'), icon: Camera },
  ];

  const [activeTab, setActiveTab] = useState('insights');
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState('');
  const [lastGenerated, setLastGenerated] = useState(null);

  const [diveModule, setDiveModule] = useState('residence');
  const [diveResult, setDiveResult] = useState(null);
  const [diveLoading, setDiveLoading] = useState(false);
  const [diveError, setDiveError] = useState('');

  const [queryInput, setQueryInput] = useState('');
  const [queryResult, setQueryResult] = useState(null);
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryError, setQueryError] = useState('');

  const [compareA, setCompareA] = useState('maintenance');
  const [compareB, setCompareB] = useState('it');
  const [compareResult, setCompareResult] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareError, setCompareError] = useState('');

  const [snapshotStatus, setSnapshotStatus] = useState('');
  const [snapshotLoading, setSnapshotLoading] = useState(false);
  const [compareSnapResult, setCompareSnapResult] = useState(null);
  const [compareSnapLoading, setCompareSnapLoading] = useState(false);

  useEffect(() => { generateInsights(); }, []);

  const generateInsights = async () => {
    setInsightsLoading(true); setInsightsError('');
    try {
      const res = await api.post('/ai/insights');
      setInsights(res.data);
      setLastGenerated(new Date());
    } catch {
      setInsightsError(t('errGenerate'));
    } finally {
      setInsightsLoading(false);
    }
  };

  const runDeepDive = async () => {
    setDiveLoading(true); setDiveResult(null); setDiveError('');
    try {
      const res = await api.get(`/ai/insights/${diveModule}`);
      setDiveResult(res.data);
    } catch { setDiveError(t('errDeepDive')); } finally { setDiveLoading(false); }
  };

  const runQuery = async () => {
    if (!queryInput.trim()) return;
    setQueryLoading(true); setQueryResult(null); setQueryError('');
    try {
      const res = await api.post('/ai/query', { question: queryInput.trim() });
      setQueryResult(res.data);
    } catch { setQueryError(t('errQuery')); } finally { setQueryLoading(false); }
  };

  const runCompare = async () => {
    setCompareLoading(true); setCompareResult(null); setCompareError('');
    try {
      const res = await api.get(`/ai/compare/modules?a=${compareA}&b=${compareB}`);
      setCompareResult(res.data);
    } catch { setCompareError(t('errCompare')); } finally { setCompareLoading(false); }
  };

  const takeSnapshot = async () => {
    setSnapshotLoading(true); setSnapshotStatus('');
    try { await api.post('/ai/snapshot'); setSnapshotStatus(t('snapshotSaved')); }
    catch { setSnapshotStatus(t('snapshotFailed')); } finally { setSnapshotLoading(false); }
  };

  const runCompareSnapshots = async () => {
    setCompareSnapLoading(true); setCompareSnapResult(null);
    try {
      const res = await api.get('/ai/compare');
      setCompareSnapResult(res.data);
    } catch { setCompareSnapResult({ error: t('errCompareSnap') }); } finally { setCompareSnapLoading(false); }
  };

  const handlePrintReport = () => {
    if (!insights) return;
    const printWindow = window.open('', '_blank');
    const stats = insights._meta?.stats || {};
    const locale = curLang === 'ar' ? 'ar-DZ' : curLang === 'fr' ? 'fr-FR' : 'en-US';
    const dateStr = new Date().toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
    const rtl = isAr ? 'rtl' : 'ltr';
    printWindow.document.write(`<!DOCTYPE html><html dir="${rtl}"><head><title>UniManage AI - ${t('reportTitle')}</title>
      <style>@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
      body{font-family:${isAr ? "'Cairo'" : "'Inter'"},sans-serif;color:#1a1a14;background:#fff;margin:0;padding:40px;}
      .header{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #e8e2d6;padding-bottom:20px;margin-bottom:30px;}
      .title-area h1{font-size:20px;font-weight:800;margin:0;color:#1a1e0f;}
      .doc-meta{text-align:${isAr ? 'left' : 'right'};font-size:12px;color:#8a7f72;line-height:1.5;}
      .report-title{text-align:center;font-size:24px;font-weight:800;color:#1a1e0f;margin-bottom:30px;}
      .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:15px;margin-bottom:35px;}
      .kpi-card{border:1px solid #e8e2d6;border-radius:12px;padding:16px;background:#fafaf7;text-align:center;}
      .kpi-val{font-size:24px;font-weight:800;color:#d45c3c;margin-bottom:4px;}
      .kpi-label{font-size:12px;color:#6b6456;font-weight:600;}
      .summary-box{background:#fafaf7;border-${isAr ? 'right' : 'left'}:4px solid #f6b371;border-radius:8px;padding:20px;margin-bottom:35px;line-height:1.6;font-size:14px;}
      .summary-box h3{margin:0 0 8px 0;font-size:12px;color:#b8631c;}
      .insight-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:40px;}
      .insight-card{border:1px solid #e8e2d6;border-radius:12px;overflow:hidden;}
      .insight-header{padding:12px 16px;font-weight:700;font-size:13px;border-bottom:1px solid #e8e2d6;}
      .insight-body{padding:16px;}
      .insight-item{display:flex;gap:8px;margin-bottom:10px;font-size:13px;line-height:1.5;color:#5a5248;}
      .insight-item::before{content:"\\2022";color:#d45c3c;font-weight:bold;}
      .footer-sign{margin-top:80px;display:flex;justify-content:space-between;font-size:12px;color:#8a7f72;}
      .sign-line{border-top:1px solid #c4bfb5;width:180px;margin-top:40px;text-align:center;padding-top:8px;}
      @media print{body{padding:0;}}
      </style></head><body>
      <div class="header"><div class="title-area"><h1>UniManage AI</h1><p>${t('reportTitle')}</p></div>
      <div class="doc-meta"><strong>${t('updated')}:</strong> ${dateStr}<br/><strong>Model:</strong> ${insights._meta?.model?.split('/')?.pop() || 'standard'}</div></div>
      <div class="report-title">${t('reportTitle')}</div>
      <div class="grid">
        <div class="kpi-card"><div class="kpi-val">${stats.students||0}</div><div class="kpi-label">${t('housedStudents')}</div></div>
        <div class="kpi-card"><div class="kpi-val">${stats.rooms||0}</div><div class="kpi-label">${t('totalRooms')}</div></div>
        <div class="kpi-card"><div class="kpi-val">${stats.occupancyRate||0}%</div><div class="kpi-label">${t('occupancyRate')}</div></div>
        <div class="kpi-card"><div class="kpi-val">${stats.activeTickets||0}</div><div class="kpi-label">${t('activeTickets')}</div></div>
      </div>
      <div class="summary-box"><h3>${t('executiveSummary')}</h3>${insights.summary}</div>
      <div class="insight-grid">
        <div class="insight-card" style="border-top:3px solid #d45c3c;"><div class="insight-header" style="background:#fdf7f5;color:#3d1610;">${t('identifiedProblems')}</div>
          <div class="insight-body">${insights.problems?.map(p => `<div class="insight-item">${p}</div>`).join('')||t('noCriticalProblems')}</div></div>
        <div class="insight-card" style="border-top:3px solid #e07e27;"><div class="insight-header" style="background:#fffdf5;color:#5e3110;">${t('potentialRisks')}</div>
          <div class="insight-body">${insights.risks?.map(r => `<div class="insight-item">${r}</div>`).join('')||t('noHighRisks')}</div></div>
      </div>
      <div class="insight-card" style="border-top:3px solid #8ea45c;margin-bottom:40px;"><div class="insight-header" style="background:#f6faf0;color:#3a4012;">${t('strategicRecommendations')}</div>
        <div class="insight-body" style="display:grid;grid-template-columns:1fr 1fr;gap:15px;">${insights.recommendations?.map(r => `<div class="insight-item">${r}</div>`).join('')||t('noRecommendations')}</div></div>
      <div class="footer-sign"><div>${t('generatedBy')}<br/>&copy; ${new Date().getFullYear()} Universite Lounici Ali de Blida 2.</div><div><div class="sign-line">${t('directorApproval')}</div></div></div>
      <script>window.onload=function(){setTimeout(function(){window.print()},500)}</script>
    </body></html>`);
    printWindow.document.close();
  };

  const s = insights?._meta?.stats;

  const btnBase = { display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 20px', borderRadius: '10px', border: 'none', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s', fontFamily: isAr ? "'Cairo', sans-serif" : '' };
  const btnPrimary = { ...btnBase, background: '#1a1e0f', color: '#ffffff' };
  const btnSecondary = { ...btnBase, background: '#fafaf7', color: '#1a1e0f', border: '1px solid #e8e2d6' };

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1000px', fontFamily: isAr ? "'Cairo', sans-serif" : '' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#1a1a14', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: isAr ? "'Cairo', sans-serif" : '' }}>
            <span style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fce4db', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <BrainCircuit size={18} style={{ color: '#d45c3c' }} />
            </span>
            {t('title')}
          </h1>
          <p style={{ color: '#8a7f72', fontSize: '13px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontFamily: isAr ? "'Cairo', sans-serif" : '' }}>
            <span>{t('subtitle')}</span>
            {insights && <span style={{ color: '#c4bfb5' }}>·</span>}
            {insights?._meta?.model && (
              <span style={{ padding: '2px 8px', borderRadius: '5px', fontSize: '11px', fontWeight: '700',
                background: insights._meta.model === 'smart-fallback' ? '#fef0df' : '#e3ebd0',
                color: insights._meta.model === 'smart-fallback' ? '#b8631c' : '#5c651f' }}>
                {insights._meta.model === 'smart-fallback' ? t('dataDriven') : insights._meta.model.split('/').pop()}
              </span>
            )}
            {lastGenerated && <span style={{ color: '#c4bfb5', fontSize: '11px' }}>{t('updated')} {lastGenerated.toLocaleTimeString(curLang === 'ar' ? 'ar-DZ' : curLang === 'fr' ? 'fr-FR' : 'en-US')}</span>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {insights && !insightsLoading && activeTab === 'insights' && (
            <button onClick={handlePrintReport} style={btnSecondary}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#d45c3c'; e.currentTarget.style.color = '#d45c3c'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8e2d6'; e.currentTarget.style.color = '#1a1e0f'; }}>
              <Printer size={15} /> {t('pdfReport')}
            </button>
          )}
          <button onClick={generateInsights} disabled={insightsLoading}
            style={{...btnPrimary, opacity: insightsLoading ? 0.5 : 1}}
            onMouseEnter={e => { if (!insightsLoading) e.currentTarget.style.background = '#d45c3c'; }}
            onMouseLeave={e => { if (!insightsLoading) e.currentTarget.style.background = '#1a1e0f'; }}>
            {insightsLoading ? <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> : <RefreshCw size={15} />}
            {insightsLoading ? t('refreshing') : t('refresh')}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid #e8e2d6', margin: 0 }}>
        {TABS.map(tab => {
          const active = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px', padding: '11px 18px',
                border: 'none', background: 'transparent', fontSize: '13px',
                fontWeight: active ? '700' : '500', color: active ? '#1a1e0f' : '#8a7f72',
                borderBottom: active ? '2px solid #1a1e0f' : '2px solid transparent',
                cursor: 'pointer', marginBottom: '-1px', transition: 'all 0.15s',
                fontFamily: isAr ? "'Cairo', sans-serif" : '',
              }}>
              <Icon size={15} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* ─── TAB: Full Analysis ─── */}
      {activeTab === 'insights' && (
        <>
          {insightsError && (
            <div style={{ padding: '14px 18px', borderRadius: '12px', background: '#fce4db', border: '1px solid #f8c7b4', color: '#b84a2e', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: isAr ? "'Cairo', sans-serif" : '' }}>
              <AlertCircle size={18} /> {insightsError}
            </div>
          )}
          {insightsLoading && !insights && (
            <div style={{ background: '#ffffff', borderRadius: '18px', border: '1px solid #e8e2d6', padding: '80px 32px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: '#fce4db', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={32} style={{ color: '#d45c3c', animation: 'spin 0.8s linear infinite' }} />
              </div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a14', marginBottom: '6px', fontFamily: isAr ? "'Cairo', sans-serif" : '' }}>{t('loadingAnalyzing')}</div>
              <div style={{ fontSize: '13px', color: '#8a7f72', fontFamily: isAr ? "'Cairo', sans-serif" : '' }}>{t('loadingQuerying')}</div>
            </div>
          )}
          {insights && !insightsLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {s && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                  <KpiCard value={s.students} label={t('studentsHoused')} color="#d45c3c" isAr={isAr} />
                  <KpiCard value={s.rooms} label={t('totalRooms')} sub={`${s.occupancyRate}% ${t('full')}`} color={s.occupancyRate > 85 ? '#d45c3c' : '#8ea45c'} isAr={isAr} />
                  <KpiCard value={s.activeTickets} label={t('activeTickets')} sub={s.ticketStatusBreakdown?.find(t => t.status === 'pending')?.count ? `${s.ticketStatusBreakdown.find(t => t.status === 'pending').count} ${t('pending')}` : ''} color={s.activeTickets > 10 ? '#d45c3c' : '#8ea45c'} isAr={isAr} />
                  <KpiCard value={s.catering?.expired || 0} label={t('expiredFood')} sub={`${s.catering?.expiringWithin7Days || 0} ${t('expiringSoon')}`} color={s.catering?.expired > 0 ? '#d45c3c' : '#8ea45c'} isAr={isAr} />
                  <KpiCard value={s.it?.openIssues || 0} label={t('openItIssues')} sub={`${s.it?.services || 0} ${t('services')}`} color={s.it?.openIssues > 5 ? '#d45c3c' : '#8ea45c'} isAr={isAr} />
                  <KpiCard value={s.housing?.lowStock || 0} label={t('lowStockItems')} sub={`${s.housing?.totalItems || 0} ${t('tracked')}`} color={s.housing?.lowStock > 0 ? '#e07e27' : '#8ea45c'} isAr={isAr} />
                </div>
              )}
              {s && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e8e2d6', padding: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#8a7f72', marginBottom: '12px', fontFamily: isAr ? "'Cairo', sans-serif" : '' }}>{t('residenceCapacity')}</div>
                    <StatBar label={t('students')} value={s.students} max={Math.max(s.students, 1)} color="#d45c3c" isAr={isAr} />
                    <div style={{ height: '8px' }} />
                    <StatBar label={t('rooms')} value={s.rooms} max={Math.max(s.rooms, 1)} color="#8ea45c" isAr={isAr} />
                    <div style={{ height: '8px' }} />
                    <StatBar label={t('occupancy')} value={s.occupancyRate} max={100} color={s.occupancyRate > 85 ? '#d45c3c' : '#8ea45c'} unit="%" isAr={isAr} />
                  </div>
                  <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e8e2d6', padding: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#8a7f72', marginBottom: '12px', fontFamily: isAr ? "'Cairo', sans-serif" : '' }}>{t('departmentHealth')}</div>
                    <StatBar label={t('activeTickets')} value={s.activeTickets} max={Math.max(s.activeTickets, 1)} color="#e07e27" isAr={isAr} />
                    <div style={{ height: '8px' }} />
                    <StatBar label={t('expiredFoodLabel')} value={s.catering?.expired || 0} max={Math.max(s.catering?.expired || 0, 1)} color="#d45c3c" isAr={isAr} />
                    <div style={{ height: '8px' }} />
                    <StatBar label={t('openItIssuesLabel')} value={s.it?.openIssues || 0} max={Math.max(s.it?.openIssues || 0, 1)} color="#3a6b8f" isAr={isAr} />
                  </div>
                </div>
              )}
              <div style={{ background: 'linear-gradient(135deg, #1a1e0f 0%, #2a3018 100%)', borderRadius: '16px', padding: '24px 28px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', position: 'relative', zIndex: 1, flexDirection: isAr ? 'row-reverse' : 'row' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(212,92,60,0.2)', border: '1px solid rgba(212,92,60,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <Sparkles size={16} style={{ color: '#f6b371' }} />
                  </div>
                  <div>
                    <div style={{ color: 'rgba(180,210,140,0.7)', fontSize: '11px', fontWeight: '700', marginBottom: '6px', fontFamily: isAr ? "'Cairo', sans-serif" : '' }}>
                      {t('executiveSummary')} · {t('basedOn')} {s?.students||0} {t('students')}, {s?.rooms||0} {t('rooms')}, {s?.catering?.totalItems || 0} {t('stockItems')}, {s?.it?.devices || 0} {t('itDevices')}
                    </div>
                    <p style={{ fontSize: '14px', lineHeight: '1.65', fontWeight: '400', margin: 0, color: '#ffffff', fontFamily: isAr ? "'Cairo', sans-serif" : '' }}>{insights.summary}</p>
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                <InsightCard icon={<AlertCircle size={16} style={{ color: '#d45c3c' }} />} title={t('problems')} items={insights.problems} headerBg="#fdf7f5" borderColor="#f8c7b4" dotColor="#d45c3c" isAr={isAr} />
                <InsightCard icon={<AlertTriangle size={16} style={{ color: '#e07e27' }} />} title={t('risks')} items={insights.risks} headerBg="#fffdf5" borderColor="#fddeba" dotColor="#e07e27" isAr={isAr} />
                <InsightCard icon={<CheckCircle2 size={16} style={{ color: '#5c651f' }} />} title={t('recommendations')} items={insights.recommendations} headerBg="#f6faf0" borderColor="#c7d6a2" dotColor="#8ea45c" isAr={isAr} />
              </div>
            </div>
          )}
        </>
      )}

      {/* ─── TAB: Deep-Dive ─── */}
      {activeTab === 'deepdive' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '12px', color: '#8a7f72', lineHeight: '1.5', fontFamily: isAr ? "'Cairo', sans-serif" : '' }}>
            {t('deepDiveDesc')}
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select value={diveModule} onChange={e => setDiveModule(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #e8e2d6', fontSize: '13px', fontWeight: '600', color: '#1a1a14', background: '#ffffff', outline: 'none', cursor: 'pointer', minWidth: '180px', fontFamily: isAr ? "'Cairo', sans-serif" : '' }}>
              {MODULES.map(m => <option key={m} value={m}>{ml(m)}</option>)}
            </select>
            <button onClick={runDeepDive} disabled={diveLoading}
              style={{...btnPrimary, opacity: diveLoading ? 0.5 : 1}}
              onMouseEnter={e => { if (!diveLoading) e.currentTarget.style.background = '#d45c3c'; }}
              onMouseLeave={e => { if (!diveLoading) e.currentTarget.style.background = '#1a1e0f'; }}>
              {diveLoading ? <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Search size={15} />}
              {diveLoading ? t('analyzing') : `${t('analyze')} ${ml(diveModule)}`}
            </button>
          </div>
          {diveError && <div style={{ padding: '12px 16px', borderRadius: '10px', background: '#fce4db', border: '1px solid #f8c7b4', color: '#b84a2e', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: isAr ? "'Cairo', sans-serif" : '' }}><AlertCircle size={16} /> {diveError}</div>}
          {diveResult && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: '#fafaf7', borderRadius: '12px', border: '1px solid #e8e2d6', padding: '20px', borderLeft: isAr ? 'none' : '4px solid #8ea45c', borderRight: isAr ? '4px solid #8ea45c' : 'none' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#5c651f', marginBottom: '6px', fontFamily: isAr ? "'Cairo', sans-serif" : '' }}>{ml(diveModule)} · {t('deepDiveResults')}</div>
                <p style={{ fontSize: '14px', color: '#5a5248', lineHeight: '1.6', margin: 0, fontFamily: isAr ? "'Cairo', sans-serif" : '' }}>{diveResult.analysis?.summary || t('rawDataAvailable')}</p>
              </div>
              {diveResult.analysis?.findings && diveResult.analysis?.recommendations && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <InsightCard icon={<AlertCircle size={15} style={{ color: '#d45c3c' }} />} title={t('findings')} items={diveResult.analysis.findings} headerBg="#fdf7f5" borderColor="#f8c7b4" dotColor="#d45c3c" isAr={isAr} />
                  <InsightCard icon={<CheckCircle2 size={15} style={{ color: '#5c651f' }} />} title={t('recommendations')} items={diveResult.analysis.recommendations} headerBg="#f6faf0" borderColor="#c7d6a2" dotColor="#8ea45c" isAr={isAr} />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB: Ask AI ─── */}
      {activeTab === 'query' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '12px', color: '#8a7f72', lineHeight: '1.5', fontFamily: isAr ? "'Cairo', sans-serif" : '' }}>
            {t('askAiDesc')}
            <br/>{t('askPlaceholder')}
          </div>
          <div style={{ display: 'flex', gap: '10px', flexDirection: isAr ? 'row-reverse' : 'row' }}>
            <input value={queryInput} onChange={e => setQueryInput(e.target.value)}
              placeholder={t('askPlaceholder')}
              onKeyDown={e => { if (e.key === 'Enter' && !queryLoading) runQuery(); }}
              style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid #e8e2d6', fontSize: '13px', color: '#1a1a14', outline: 'none', background: '#ffffff', fontFamily: isAr ? "'Cairo', sans-serif" : '' }} />
            <button onClick={runQuery} disabled={queryLoading || !queryInput.trim()}
              style={{...btnPrimary, opacity: (queryLoading || !queryInput.trim()) ? 0.5 : 1}}
              onMouseEnter={e => { if (!queryLoading) e.currentTarget.style.background = '#d45c3c'; }}
              onMouseLeave={e => { if (!queryLoading) e.currentTarget.style.background = '#1a1e0f'; }}>
              {queryLoading ? <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Send size={15} />}
              {t('ask')}
            </button>
          </div>
          {queryError && <div style={{ padding: '12px 16px', borderRadius: '10px', background: '#fce4db', border: '1px solid #f8c7b4', color: '#b84a2e', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: isAr ? "'Cairo', sans-serif" : '' }}><AlertCircle size={16} /> {queryError}</div>}
          {queryLoading && (
            <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e8e2d6', padding: '32px', textAlign: 'center' }}>
              <Loader2 size={24} style={{ color: '#d45c3c', animation: 'spin 0.8s linear infinite' }} />
              <div style={{ fontSize: '13px', color: '#8a7f72', marginTop: '10px', fontFamily: isAr ? "'Cairo', sans-serif" : '' }}>{t('searching')}</div>
            </div>
          )}
          {queryResult && !queryLoading && (
            <div style={{ background: '#fafaf7', borderRadius: '14px', border: '1px solid #e8e2d6', padding: '24px', borderLeft: isAr ? 'none' : '4px solid #f6b371', borderRight: isAr ? '4px solid #f6b371' : 'none' }}>
              <div style={{ fontSize: '10px', fontWeight: '700', color: '#b8631c', marginBottom: '8px', fontFamily: isAr ? "'Cairo', sans-serif" : '' }}>{t('yourQuestion')}</div>
              <p style={{ fontSize: '14px', color: '#1a1a14', fontWeight: '600', margin: '0 0 20px 0', fontFamily: isAr ? "'Cairo', sans-serif" : '' }}>{queryResult.question}</p>
              <div style={{ fontSize: '10px', fontWeight: '700', color: '#b8631c', marginBottom: '8px', fontFamily: isAr ? "'Cairo', sans-serif" : '' }}>{t('aiAnswer')}</div>
              <p style={{ fontSize: '14px', color: '#5a5248', lineHeight: '1.7', margin: 0, whiteSpace: 'pre-wrap', fontFamily: isAr ? "'Cairo', sans-serif" : '' }}>{queryResult.answer}</p>
              {queryResult._meta?.model && <div style={{ marginTop: '14px', fontSize: '11px', color: '#c4bfb5', fontFamily: isAr ? "'Cairo', sans-serif" : '' }}>{t('answeredBy')} {queryResult._meta.model}</div>}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB: Compare ─── */}
      {activeTab === 'compare' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '12px', color: '#8a7f72', lineHeight: '1.5', fontFamily: isAr ? "'Cairo', sans-serif" : '' }}>
            {t('compareDesc')}
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', flexDirection: isAr ? 'row-reverse' : 'row' }}>
            <select value={compareA} onChange={e => setCompareA(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #e8e2d6', fontSize: '13px', fontWeight: '600', color: '#1a1a14', background: '#ffffff', outline: 'none', cursor: 'pointer', minWidth: '160px', fontFamily: isAr ? "'Cairo', sans-serif" : '' }}>
              {MODULES.filter(m => m !== compareB).map(m => <option key={m} value={m}>{ml(m)}</option>)}
            </select>
            <span style={{ color: '#c4bfb5', fontWeight: '700', fontSize: '13px' }}>{t('vs')}</span>
            <select value={compareB} onChange={e => setCompareB(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #e8e2d6', fontSize: '13px', fontWeight: '600', color: '#1a1a14', background: '#ffffff', outline: 'none', cursor: 'pointer', minWidth: '160px', fontFamily: isAr ? "'Cairo', sans-serif" : '' }}>
              {MODULES.filter(m => m !== compareA).map(m => <option key={m} value={m}>{ml(m)}</option>)}
            </select>
            <button onClick={runCompare} disabled={compareLoading}
              style={{...btnPrimary, opacity: compareLoading ? 0.5 : 1}}
              onMouseEnter={e => { if (!compareLoading) e.currentTarget.style.background = '#d45c3c'; }}
              onMouseLeave={e => { if (!compareLoading) e.currentTarget.style.background = '#1a1e0f'; }}>
              {compareLoading ? <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> : <GitCompare size={15} />}
              {compareLoading ? t('comparing') : t('compareLabel')}
            </button>
          </div>
          {compareError && <div style={{ padding: '12px 16px', borderRadius: '10px', background: '#fce4db', border: '1px solid #f8c7b4', color: '#b84a2e', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: isAr ? "'Cairo', sans-serif" : '' }}><AlertCircle size={16} /> {compareError}</div>}
          {compareResult && !compareLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: '#fafaf7', borderRadius: '12px', border: '1px solid #e8e2d6', padding: '20px', borderLeft: isAr ? 'none' : '4px solid #8ea45c', borderRight: isAr ? '4px solid #8ea45c' : 'none' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#5c651f', marginBottom: '6px', fontFamily: isAr ? "'Cairo', sans-serif" : '' }}>{ml(compareA)} {t('vs')} {ml(compareB)}</div>
                <p style={{ fontSize: '14px', color: '#5a5248', lineHeight: '1.6', margin: 0, fontFamily: isAr ? "'Cairo', sans-serif" : '' }}>{compareResult.comparison?.summary || t('crossModuleAvailable')}</p>
              </div>
              {compareResult.comparison?.correlations && (
                <InsightCard icon={<GitCompare size={15} style={{ color: '#3a6b8f' }} />} title={t('crossDeptCorrelations')} items={compareResult.comparison.correlations} headerBg="#f0f5fa" borderColor="#c4d8e8" dotColor="#3a6b8f" isAr={isAr} />
              )}
              {compareResult.comparison?.recommendations && (
                <InsightCard icon={<CheckCircle2 size={15} style={{ color: '#5c651f' }} />} title={t('jointRecommendations')} items={compareResult.comparison.recommendations} headerBg="#f6faf0" borderColor="#c7d6a2" dotColor="#8ea45c" isAr={isAr} />
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB: Snapshots ─── */}
      {activeTab === 'snapshots' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '12px', color: '#8a7f72', lineHeight: '1.5', fontFamily: isAr ? "'Cairo', sans-serif" : '' }}>
            {t('snapshotsDesc')}
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button onClick={takeSnapshot} disabled={snapshotLoading} style={{...btnSecondary, opacity: snapshotLoading ? 0.5 : 1}}>
              {snapshotLoading ? <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Camera size={15} />}
              {snapshotLoading ? t('saving') : t('takeSnapshot')}
            </button>
            <button onClick={runCompareSnapshots} disabled={compareSnapLoading} style={{...btnSecondary, opacity: compareSnapLoading ? 0.5 : 1}}>
              {compareSnapLoading ? <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Layers size={15} />}
              {compareSnapLoading ? t('comparing') : t('compareWithPrevious')}
            </button>
          </div>
          {snapshotStatus && (
            <div style={{ padding: '12px 16px', borderRadius: '10px', background: snapshotStatus.includes('success') ? '#e3ebd0' : '#fce4db', border: `1px solid ${snapshotStatus.includes('success') ? '#c7d6a2' : '#f8c7b4'}`, color: snapshotStatus.includes('success') ? '#3a4012' : '#b84a2e', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: isAr ? "'Cairo', sans-serif" : '' }}>
              {snapshotStatus.includes('success') ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />} {snapshotStatus}
            </div>
          )}
          {compareSnapResult && !compareSnapLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {compareSnapResult.current ? (
                <>
                  <div style={{ background: '#fafaf7', borderRadius: '12px', border: '1px solid #e8e2d6', padding: '20px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#5c651f', marginBottom: '12px', fontFamily: isAr ? "'Cairo', sans-serif" : '' }}>
                      {t('changes')} {compareSnapResult.previousDate || t('earlier')} → {compareSnapResult.snapshotDate || t('now')}
                    </div>
                    {compareSnapResult.changes?.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {compareSnapResult.changes.map((c, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '8px', background: '#ffffff', border: '1px solid #e8e2d6', fontSize: '13px', color: '#5a5248', fontFamily: isAr ? "'Cairo', sans-serif" : '' }}>
                            <span style={{ fontWeight: '700', color: c.change === 'increase' ? '#d45c3c' : '#8ea45c', minWidth: '60px' }}>
                              {c.change === 'increase' ? '↑ +' : '↓ '}{c.absolute}
                            </span>
                            <span style={{ fontWeight: '600', minWidth: '130px' }}>{c.field}</span>
                            <span style={{ color: '#c4bfb5' }}>{c.from} → {c.to}</span>
                          </div>
                        ))}
                      </div>
                    ) : <p style={{ color: '#8a7f72', fontSize: '13px', margin: 0, fontFamily: isAr ? "'Cairo', sans-serif" : '' }}>{t('noSignificantChanges')}</p>}
                  </div>
                  {compareSnapResult.analysis && (
                    <>
                      <div style={{ background: '#fafaf7', borderRadius: '12px', border: '1px solid #e8e2d6', padding: '20px', borderLeft: isAr ? 'none' : '4px solid #f6b371', borderRight: isAr ? '4px solid #f6b371' : 'none' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#b8631c', marginBottom: '6px', fontFamily: isAr ? "'Cairo', sans-serif" : '' }}>{t('aiTrendAnalysis')}</div>
                        <p style={{ fontSize: '14px', color: '#5a5248', lineHeight: '1.6', margin: 0, fontFamily: isAr ? "'Cairo', sans-serif" : '' }}>{compareSnapResult.analysis.summary}</p>
                      </div>
                      {compareSnapResult.analysis.actionItems && (
                        <InsightCard icon={<CheckCircle2 size={15} style={{ color: '#5c651f' }} />} title={t('recommendedActions')} items={compareSnapResult.analysis.actionItems} headerBg="#f6faf0" borderColor="#c7d6a2" dotColor="#8ea45c" isAr={isAr} />
                      )}
                    </>
                  )}
                </>
              ) : (
                compareSnapResult.message && (
                  <div style={{ padding: '20px', borderRadius: '12px', background: '#fef0df', border: '1px solid #fddeba', color: '#5e3110', fontSize: '13px', fontFamily: isAr ? "'Cairo', sans-serif" : '' }}>{compareSnapResult.message}</div>
                )
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
