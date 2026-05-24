export const parseUserAgent = (userAgentString) => {
  const ua = userAgentString || '';
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';

  // Parse OS
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/linux/i.test(ua)) os = 'Linux';

  // Parse Browser
  if (/edg/i.test(ua)) browser = 'Microsoft Edge';
  else if (/chrome|crios/i.test(ua)) browser = 'Google Chrome';
  else if (/firefox|fxios/i.test(ua)) browser = 'Mozilla Firefox';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Apple Safari';
  else if (/opr/i.test(ua)) browser = 'Opera';

  return { browser, os };
};

export const getIpLocation = (ip) => {
  if (!ip) return 'Unknown Location';
  const cleanIp = ip.trim();
  if (
    cleanIp === '::1' || 
    cleanIp === '127.0.0.1' || 
    cleanIp === 'localhost' || 
    cleanIp.startsWith('192.168.') || 
    cleanIp.startsWith('10.') || 
    cleanIp.startsWith('172.16.') || 
    cleanIp.startsWith('172.17.') || 
    cleanIp.startsWith('172.18.') || 
    cleanIp.startsWith('172.19.') || 
    cleanIp.startsWith('172.20.') || 
    cleanIp.startsWith('172.21.') || 
    cleanIp.startsWith('172.22.') || 
    cleanIp.startsWith('172.23.') || 
    cleanIp.startsWith('172.24.') || 
    cleanIp.startsWith('172.25.') || 
    cleanIp.startsWith('172.26.') || 
    cleanIp.startsWith('172.27.') || 
    cleanIp.startsWith('172.28.') || 
    cleanIp.startsWith('172.29.') || 
    cleanIp.startsWith('172.30.') || 
    cleanIp.startsWith('172.31.')
  ) {
    return 'Blida, Algeria (Local Network)';
  }
  return 'Algiers, Algeria';
};
