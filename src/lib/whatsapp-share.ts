const APP_PUBLIC_URL = 'https://habitshare-production.up.railway.app';

const ensureAbsoluteAppUrlInText = (input: string) => {
  const trimmed = input.trim();
  const hasAnyUrl = /https?:\/\/\S+/i.test(trimmed);
  return hasAnyUrl ? trimmed : `${trimmed}\n\n${APP_PUBLIC_URL}`;
};

export const openWhatsAppShare = (text: string) => {
  if (typeof window === 'undefined') return;

  const safeText = ensureAbsoluteAppUrlInText(text);
  const encoded = encodeURIComponent(safeText);
  const deepLinkUrl = `whatsapp://send?text=${encoded}`;
  const waMeUrl = `https://wa.me/?text=${encoded}`;
  const apiUrl = `https://api.whatsapp.com/send?text=${encoded}`;

  const ua = navigator.userAgent || '';
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);
  const isMobile = isIOS || isAndroid;

  if (isIOS) {
    // iPhone Safari is more reliable with direct wa.me compared to custom deep links.
    window.location.assign(waMeUrl);
    return;
  }

  if (isAndroid) {
    window.location.href = deepLinkUrl;
    window.setTimeout(() => {
      window.location.href = waMeUrl;
    }, 700);
    return;
  }

  const desktopUrl = isMobile ? apiUrl : waMeUrl;
  window.open(desktopUrl, '_blank', 'noopener,noreferrer');
};
