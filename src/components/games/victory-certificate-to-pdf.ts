import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

import { CERTIFICATE_LAYOUT_PX } from '@/components/games/victory-certificate-layout';

/** Yalnızca html2canvas klonunda; önizlemede aynı kalır (px, negatif = yukarı). */
const PDF_SIGNATURE_TRANSLATE_Y_PX = -14;

/** #RRGGBB → jsPDF setFillColor için [r,g,b] */
function hexRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    Number.parseInt(h.slice(0, 2), 16),
    Number.parseInt(h.slice(2, 4), 16),
    Number.parseInt(h.slice(4, 6), 16),
  ];
}

/**
 * Önizlemedeki sabit boyutlu sertifika DOM’unu A4 yatay PDF’e yazar.
 * Görüntü en-boyu kartın kendi oranındadır; sayfada ortalanır (modal ile aynı piksel düzeni).
 */
export async function downloadCertificateDomAsPdf(
  element: HTMLElement,
  filename: string,
): Promise<void> {
  if (typeof document === 'undefined') {
    throw new Error('PDF yalnızca tarayıcıda oluşturulabilir.');
  }

  await document.fonts.ready;
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });

  const { width: designW, height: designH } = CERTIFICATE_LAYOUT_PX;
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 2;
  const scale = Math.min(3, Math.max(2.25, dpr * 1.25));

  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#fcfaf6',
    logging: false,
    scrollX: 0,
    scrollY: 0,
    width: designW,
    height: designH,
    windowWidth: designW,
    windowHeight: designH,
    onclone: (_clonedDoc, clonedElement) => {
      const sig = clonedElement.querySelector<HTMLElement>('[data-certificate-signature]');
      if (!sig) return;
      sig.style.transform = `rotate(-1.25deg) translateY(${PDF_SIGNATURE_TRANSLATE_Y_PX}px)`;
    },
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pdfW = pdf.internal.pageSize.getWidth();
  const pdfH = pdf.internal.pageSize.getHeight();

  const pageBg = hexRgb('#ece8e0');
  pdf.setFillColor(pageBg[0], pageBg[1], pageBg[2]);
  pdf.rect(0, 0, pdfW, pdfH, 'F');

  const marginMm = 14;
  const maxW = pdfW - marginMm * 2;
  const maxH = pdfH - marginMm * 2;
  const ar = designW / designH;
  let wMm = maxW;
  let hMm = wMm / ar;
  if (hMm > maxH) {
    hMm = maxH;
    wMm = hMm * ar;
  }
  const x = (pdfW - wMm) / 2;
  const y = (pdfH - hMm) / 2;
  pdf.addImage(imgData, 'PNG', x, y, wMm, hMm);
  pdf.save(filename);
}
