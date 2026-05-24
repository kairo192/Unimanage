import { useState, useEffect } from 'react';
import api from '../api/axios';

// ── Full translation dictionary ──────────────────────────────────────────────
const T = {
  ar: {
    dir: 'rtl',
    universityName: 'جامعة البليدة 2',
    universitySubtitle: 'Université Lounici Ali — Blida 2',
    heroTitle: 'نظام إدارة الخدمات الجامعية',
    heroFrench: 'Système Intelligent de Gestion Universitaire',
    heroEnglish: 'Intelligent University Management System',
    features: [
      { text: 'إدارة إقامة الطلبة', sub: 'Gestion des résidences étudiantes', icon: '🏠' },
      { text: 'تتبع طلبات الصيانة', sub: 'Suivi des tickets de maintenance', icon: '🔧' },
      { text: 'استيراد وتصدير ملفات Excel', sub: 'Automatisation Excel & rapports', icon: '📊' },
      { text: 'تحليلات ذكاء اصطناعي', sub: 'Analyses IA en temps réel', icon: '🤖' },
    ],
    copyright: '© 2026 UniManage AI — البليدة 2',
    loginTitle: 'تسجيل الدخول',
    loginSub: 'Connexion au système d\'administration',
    emailLabel: 'البريد الإلكتروني · Email',
    emailPlaceholder: 'nom@university.dz',
    passLabel: 'كلمة المرور · Mot de passe',
    passPlaceholder: '',
    btnLoading: 'جاري التحقق...',
    btnSignIn: 'دخول · Sign In · Connexion',
    restricted: 'هذا النظام مخصص للموظفين والإداريين فقط',
    restrictedSub: 'Accès réservé au personnel administratif',
    errorDefault: 'بيانات الدخول غير صحيحة',
    inactivityWarning: 'تم تسجيل خروجك تلقائياً بسبب عدم النشاط لحماية جلستك.',
  },
  fr: {
    dir: 'ltr',
    universityName: 'Université Lounici Ali',
    universitySubtitle: 'جامعة البليدة 2 — Blida 2, Algérie',
    heroTitle: 'Système Intelligent de Gestion Universitaire',
    heroFrench: 'نظام إدارة الخدمات الجامعية',
    heroEnglish: 'Intelligent University Management System',
    features: [
      { text: 'Gestion des résidences étudiantes', sub: 'إدارة إقامة الطلبة', icon: '🏠' },
      { text: 'Suivi des tickets de maintenance', sub: 'تتبع طلبات الصيانة', icon: '🔧' },
      { text: 'Automatisation Excel & rapports', sub: 'استيراد وتصدير ملفات Excel', icon: '📊' },
      { text: 'Analyses IA en temps réel', sub: 'تحليلات ذكاء اصطناعي', icon: '🤖' },
    ],
    copyright: '© 2026 UniManage AI — Blida 2',
    loginTitle: 'Connexion',
    loginSub: 'Accès au système d\'administration universitaire',
    emailLabel: 'Adresse e-mail · البريد الإلكتروني',
    emailPlaceholder: 'nom@university.dz',
    passLabel: 'Mot de passe · كلمة المرور',
    passPlaceholder: '',
    btnLoading: 'Vérification en cours...',
    btnSignIn: 'Connexion · Sign In · دخول',
    restricted: 'Accès réservé au personnel administratif',
    restrictedSub: 'هذا النظام مخصص للموظفين والإداريين فقط',
    errorDefault: 'Identifiants incorrects. Veuillez réessayer.',
    inactivityWarning: 'Vous avez été déconnecté automatiquement en raison d\'une inactivité pour sécuriser votre session.',
  },
  en: {
    dir: 'ltr',
    universityName: 'Lounici Ali University',
    universitySubtitle: 'جامعة البليدة 2 — Blida 2, Algeria',
    heroTitle: 'Intelligent University Management System',
    heroFrench: 'Système Intelligent de Gestion Universitaire',
    heroEnglish: 'نظام إدارة الخدمات الجامعية',
    features: [
      { text: 'Student Residence Management', sub: 'Gestion des résidences étudiantes', icon: '🏠' },
      { text: 'Maintenance Ticket Tracking', sub: 'Suivi des tickets de maintenance', icon: '🔧' },
      { text: 'Excel Import & Export', sub: 'Automatisation Excel & rapports', icon: '📊' },
      { text: 'AI-Powered Analytics', sub: 'Analyses IA en temps réel', icon: '🤖' },
    ],
    copyright: '© 2026 UniManage AI — Blida 2',
    loginTitle: 'Sign In',
    loginSub: 'Access the university administration portal',
    emailLabel: 'Email Address · البريد الإلكتروني',
    emailPlaceholder: 'name@university.dz',
    passLabel: 'Password · كلمة المرور',
    passPlaceholder: '',
    btnLoading: 'Verifying...',
    btnSignIn: 'Sign In · Connexion · دخول',
    restricted: 'This system is restricted to authorized staff only',
    restrictedSub: 'Accès réservé au personnel administratif',
    errorDefault: 'Invalid credentials. Please try again.',
    inactivityWarning: 'You have been automatically signed out due to inactivity to protect your session.',
  },
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState('ar');
  const [inactivityAlert, setInactivityAlert] = useState(false);

  const t = T[lang] || T.ar;

  useEffect(() => {
    const saved = localStorage.getItem('lang');
    if (saved) setLang(saved);
    const reason = localStorage.getItem('logout_reason');
    if (reason === 'inactivity') {
      setInactivityAlert(true);
      localStorage.removeItem('logout_reason');
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      localStorage.setItem('lang', lang);
      window.location.href = '/dashboard';
    } catch (err) {
      if (!err.response) {
        const base = api.defaults.baseURL || 'API';
        setError(lang === 'fr'
          ? `Impossible de joindre le serveur (${base}). Démarrez le backend ou vérifiez le port.`
          : lang === 'ar'
            ? `تعذر الاتصال بالخادم (${base}). شغّل الخادم الخلفي أو تحقق من المنفذ.`
            : `Cannot reach API (${base}). Start the backend and check axios base URL / port match.`);
      } else {
        setError(err.response?.data?.error || t.errorDefault);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: 'linear-gradient(135deg, #0c1e0e 0%, #19381b 35%, #0e2819 65%, #1b110a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Cairo', 'Segoe UI', system-ui, sans-serif",
    }}>

      {/* ── Background watermark logo ── */}
      <img
        src="/logo.png"
        alt=""
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: '820px',
          height: '820px',
          objectFit: 'contain',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0.07,
          filter: 'blur(10px) grayscale(20%)',
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 0,
        }}
      />

      {/* Radial glows */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        background: 'radial-gradient(ellipse 65% 55% at 28% 50%, rgba(100,160,60,0.10) 0%, transparent 65%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        background: 'radial-gradient(ellipse 45% 55% at 78% 50%, rgba(212,92,60,0.06) 0%, transparent 60%)',
      }} />

      {/* ── Main card ── */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        width: 'calc(100% - 64px)',
        maxWidth: '1080px',
        margin: '0 auto',
        display: 'flex',
        gap: '0',
        borderRadius: '22px',
        overflow: 'hidden',
        boxShadow: '0 40px 100px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.06)',
        minHeight: '600px',
        direction: t.dir,
      }}>

        {/* ══════════════════════════════════════════
            LEFT — Hero panel
        ══════════════════════════════════════════ */}
        <div style={{
          flex: '1.1',
          background: 'rgba(15, 30, 15, 0.65)',
          backdropFilter: 'blur(20px)',
          padding: '52px 48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRight: t.dir === 'rtl' ? 'none' : '1px solid rgba(255,255,255,0.07)',
          borderLeft: t.dir === 'rtl' ? '1px solid rgba(255,255,255,0.07)' : 'none',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Inner watermark */}
          <img src="/logo.png" alt="" aria-hidden style={{
            position: 'absolute',
            width: '400px', height: '400px',
            bottom: '-60px',
            right: t.dir === 'rtl' ? '-80px' : 'auto',
            left: t.dir === 'ltr' ? '-80px' : 'auto',
            objectFit: 'contain',
            opacity: 0.04,
            filter: 'blur(4px)',
            pointerEvents: 'none',
          }} />

          {/* Top branding */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '48px', direction: t.dir }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '14px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', flexShrink: 0,
              }}>
                <img src="/logo.png" alt="Logo" style={{ width: '46px', height: '46px', objectFit: 'contain' }} />
              </div>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.95)', fontWeight: '700', fontSize: '15px', lineHeight: '1.2' }}>
                  {t.universityName}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginTop: '2px', letterSpacing: '0.5px' }}>
                  {t.universitySubtitle}
                </div>
              </div>
            </div>

            {/* Main title block */}
            <div style={{ marginBottom: '36px', direction: t.dir }}>
              <h1 style={{
                color: '#ffffff',
                fontSize: '30px',
                fontWeight: '800',
                lineHeight: '1.25',
                marginBottom: '10px',
                letterSpacing: t.dir === 'rtl' ? '-0.3px' : '0',
                textAlign: t.dir === 'rtl' ? 'right' : 'left',
              }}>
                {t.heroTitle}
              </h1>
              <p style={{ color: 'rgba(180,210,140,0.85)', fontSize: '15px', fontWeight: '500', marginBottom: '6px' }}>
                {t.heroFrench}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12.5px', letterSpacing: '0.3px' }}>
                {t.heroEnglish}
              </p>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', marginBottom: '32px' }} />

            {/* Feature bullets */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', direction: t.dir }}>
              {t.features.map((item) => (
                <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: 'rgba(100,160,60,0.15)',
                    border: '1px solid rgba(100,160,60,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '16px', flexShrink: 0,
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: '600' }}>
                      {item.text}
                    </div>
                    <div style={{ color: 'rgba(180,210,140,0.6)', fontSize: '12px', marginTop: '1px' }}>
                      {item.sub}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer row */}
          <div style={{ marginTop: '40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', direction: 'ltr' }}>
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px' }}>
              {t.copyright}
            </span>

            {/* ── Language switcher ── */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {[
                { code: 'ar', label: 'AR' },
                { code: 'fr', label: 'FR' },
                { code: 'en', label: 'EN' },
              ].map(({ code, label }) => {
                const isActive = lang === code;
                return (
                  <button
                    key={code}
                    onClick={() => {
                      setLang(code);
                      localStorage.setItem('lang', code);
                    }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '5px',
                      fontSize: '10px',
                      fontWeight: '700',
                      letterSpacing: '0.5px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.18s',
                      background: isActive ? 'rgba(100,160,60,0.35)' : 'rgba(255,255,255,0.06)',
                      color: isActive ? '#b4e06a' : 'rgba(255,255,255,0.3)',
                      outline: isActive ? '1px solid rgba(100,160,60,0.5)' : '1px solid transparent',
                      transform: isActive ? 'scale(1.08)' : 'scale(1)',
                    }}
                    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}}
                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; }}}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            RIGHT — Login panel
        ══════════════════════════════════════════ */}
        <div style={{
          width: '420px',
          flexShrink: 0,
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(28px)',
          padding: '52px 44px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          direction: t.dir,
        }}>
          {/* Logo + title */}
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '18px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.14)',
              margin: '0 auto 18px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            }}>
              <img src="/logo.png" alt="Logo" style={{ width: '62px', height: '62px', objectFit: 'contain' }} />
            </div>
            <h2 style={{ color: '#ffffff', fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>
              {t.loginTitle}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12.5px' }}>
              {t.loginSub}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {inactivityAlert && (
              <div style={{
                padding: '12px 14px', borderRadius: '10px',
                background: 'rgba(212,142,60,0.15)',
                border: '1px solid rgba(212,142,60,0.3)',
                color: '#ffe0b3', fontSize: '12.5px',
                textAlign: t.dir === 'rtl' ? 'right' : 'left',
              }}>
                ⚠ {t.inactivityWarning}
              </div>
            )}
            {error && (
              <div style={{
                padding: '12px 14px', borderRadius: '10px',
                background: 'rgba(200,60,40,0.15)',
                border: '1px solid rgba(200,60,40,0.3)',
                color: '#ff9980', fontSize: '12.5px',
                textAlign: t.dir === 'rtl' ? 'right' : 'left',
              }}>
                ⚠ {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label style={{
                display: 'block', color: 'rgba(255,255,255,0.5)',
                fontSize: '11px', fontWeight: '600',
                textTransform: 'uppercase', letterSpacing: '0.8px',
                marginBottom: '8px',
                textAlign: t.dir === 'rtl' ? 'right' : 'left',
              }}>
                {t.emailLabel}
              </label>
              <input
                type="email" required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#ffffff', fontSize: '14px',
                  outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
                  textAlign: t.dir === 'rtl' ? 'right' : 'left',
                  direction: 'ltr', /* email always LTR */
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(100,160,60,0.7)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{
                display: 'block', color: 'rgba(255,255,255,0.5)',
                fontSize: '11px', fontWeight: '600',
                textTransform: 'uppercase', letterSpacing: '0.8px',
                marginBottom: '8px',
                textAlign: t.dir === 'rtl' ? 'right' : 'left',
              }}>
                {t.passLabel}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'} required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={t.passPlaceholder}
                  style={{
                    width: '100%', padding: '12px 44px 12px 14px', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#ffffff', fontSize: '14px',
                    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
                    direction: 'ltr',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(100,160,60,0.7)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  style={{
                    position: 'absolute', top: '50%', right: t.dir === 'rtl' ? 'auto' : '12px',
                    left: t.dir === 'rtl' ? '12px' : 'auto',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'rgba(255,255,255,0.35)', padding: '4px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '6px', width: '100%', padding: '13px',
                borderRadius: '10px', border: 'none',
                background: loading
                  ? 'rgba(80,130,40,0.4)'
                  : 'linear-gradient(135deg, #4a8a1e 0%, #6aaa2e 50%, #5c9e22 100%)',
                color: '#ffffff', fontSize: '14px', fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(80,160,40,0.35)',
                transition: 'all 0.2s', letterSpacing: '0.2px',
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(80,160,40,0.45)'; }}}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = loading ? 'none' : '0 4px 20px rgba(80,160,40,0.35)'; }}
            >
              {loading ? t.btnLoading : t.btnSignIn}
            </button>
          </form>

          {/* Restricted notice */}
          <div style={{ marginTop: '32px', textAlign: 'center' }}>
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', marginBottom: '20px' }} />
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', lineHeight: '1.8' }}>
              {t.restricted}<br />
              <span style={{ color: 'rgba(255,255,255,0.12)' }}>{t.restrictedSub}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom color bar */}
      <div style={{
        position: 'absolute', bottom: '0', left: '0', right: '0',
        height: '3px',
        background: 'linear-gradient(90deg, #4a8a1e, #8bc34a, #d45c3c, #f6b371, #4a8a1e)',
        zIndex: 2, opacity: 0.7,
      }} />
    </div>
  );
}
