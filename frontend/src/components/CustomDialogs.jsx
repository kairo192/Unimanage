import { useEffect } from 'react';
import { AlertTriangle, Info, CheckCircle2, MapPin } from 'lucide-react';

const TOAST_TONES = {
  info: { bg: '#1a1a14', icon: Info },
  success: { bg: '#5c651f', icon: CheckCircle2 },
  warning: { bg: '#b8631c', icon: AlertTriangle },
};

/** Lightweight auto-dismiss notice — no full-screen refresh */
export function Toast({ message, variant = 'info', onClose }) {
  const tone = TOAST_TONES[variant] || TOAST_TONES.info;
  const Icon = tone.icon;

  useEffect(() => {
    const id = window.setTimeout(onClose, 3800);
    return () => window.clearTimeout(id);
  }, [onClose]);

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '28px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10001,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 20px',
        borderRadius: '12px',
        background: tone.bg,
        color: '#fff',
        boxShadow: '0 12px 40px rgba(0,0,0,0.22)',
        maxWidth: 'min(420px, calc(100vw - 32px))',
        animation: 'toastIn 0.28s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      <Icon size={20} style={{ flexShrink: 0, opacity: 0.95 }} />
      <span style={{ fontSize: '14px', fontWeight: '600', lineHeight: 1.45 }}>{message}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss"
        style={{
          marginLeft: '4px',
          background: 'rgba(255,255,255,0.15)',
          border: 'none',
          color: '#fff',
          width: '28px',
          height: '28px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>
  );
}

export function ConfirmDialog({
  title = 'Confirm action',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'warning',
  onConfirm,
  onCancel,
}) {
  const confirmBg = tone === 'primary' ? '#5c651f' : tone === 'neutral' ? '#1a1a14' : '#d45c3c';
  const iconBg = tone === 'primary' ? '#e3ebd0' : tone === 'neutral' ? '#f5f1ea' : '#fce4db';
  const iconColor = tone === 'primary' ? '#5c651f' : tone === 'neutral' ? '#5a5248' : '#d45c3c';
  const Icon = tone === 'primary' ? MapPin : AlertTriangle;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '20px'
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '400px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)', overflow: 'hidden',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        <div style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: iconBg, color: iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1a1a14', marginBottom: '8px', marginTop: '2px' }}>{title}</h3>
            <p style={{ fontSize: '13px', color: '#6b6456', lineHeight: '1.5' }}>{message}</p>
          </div>
        </div>
        <div style={{ padding: '16px 24px', background: '#f9f7f3', borderTop: '1px solid #e8e2d6', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" onClick={onCancel} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e8e2d6', background: '#fff', color: '#6b6456', fontWeight: '600', cursor: 'pointer' }}>{cancelLabel}</button>
          <button type="button" onClick={onConfirm} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: confirmBg, color: '#fff', fontWeight: '700', cursor: 'pointer' }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

export function AlertDialog({ message, onClose, title = 'Notice' }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '20px'
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '360px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)', overflow: 'hidden',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        <div style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#e3ebd0', color: '#5c651f', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Info size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1a1a14', marginBottom: '8px', marginTop: '2px' }}>{title}</h3>
            <p style={{ fontSize: '13px', color: '#6b6456', lineHeight: '1.5' }}>{message}</p>
          </div>
        </div>
        <div style={{ padding: '16px 24px', background: '#f9f7f3', borderTop: '1px solid #e8e2d6', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} style={{ padding: '8px 24px', borderRadius: '8px', border: 'none', background: '#5c651f', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>OK</button>
        </div>
      </div>
    </div>
  );
}
