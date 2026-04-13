export const openWhatsAppShare = (text: string) => {
  if (typeof window === 'undefined') return;

  const encoded = encodeURIComponent(text);
  const appUrl = `whatsapp://send?text=${encoded}`;
  const webUrl = `https://api.whatsapp.com/send?text=${encoded}`;
  const isMobile = /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (isMobile) {
    // Try app deep link first, then fallback to universal web URL.
    window.location.href = appUrl;
    window.setTimeout(() => {
      window.location.href = webUrl;
    }, 800);
    return;
  }

  window.open(webUrl, '_blank', 'noopener,noreferrer');
};
