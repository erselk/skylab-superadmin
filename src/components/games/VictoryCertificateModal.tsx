'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Great_Vibes, Playfair_Display } from 'next/font/google';
import { HiOutlineXMark } from 'react-icons/hi2';

import { Button } from '@/components/ui/Button';
import { useBodyScrollLock } from '@/lib/ui/use-body-scroll-lock';
import { ErselsGameAreaMark } from '@/components/games/ErselsGameAreaMark';
import { CERTIFICATE_LAYOUT_PX } from '@/components/games/victory-certificate-layout';
import { downloadCertificateDomAsPdf } from '@/components/games/victory-certificate-to-pdf';
import type { VictoryCertificatePayload } from '@/components/games/victory-certificate-types';

export type { VictoryCertificatePayload } from '@/components/games/victory-certificate-types';

const playfair = Playfair_Display({
  subsets: ['latin', 'latin-ext'],
  weight: ['600', '700'],
});

const signatureScript = Great_Vibes({
  subsets: ['latin', 'latin-ext'],
  weight: '400',
});

const W = CERTIFICATE_LAYOUT_PX.width;
const H = CERTIFICATE_LAYOUT_PX.height;
const RW = CERTIFICATE_LAYOUT_PX.rightColumnWidth;

type Props = VictoryCertificatePayload & {
  onClose: () => void;
};

function CertificateSeal() {
  return (
    <div className="flex flex-col items-center">
      <div
        className="relative flex h-[104px] w-[104px] shrink-0 items-center justify-center"
        aria-hidden
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle at 35% 30%, #ffffff 0%, #f4f1ea 48%, #e2d9cc 100%)',
            boxShadow:
              '0 2px 6px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -3px 10px rgba(30,58,79,0.07)',
          }}
        />
        <div className="absolute inset-[3px] rounded-full border-2 border-[rgba(184,134,11,0.5)]" />
        <div className="absolute inset-[8px] rounded-full border border-[rgba(255,255,255,0.65)]" />
        <div
          className="relative flex h-[78px] w-[78px] items-center justify-center overflow-hidden rounded-full bg-[#1e3a4f]"
          style={{
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(255,255,255,0.25)',
          }}
        >
          <ErselsGameAreaMark className="h-full min-h-0 w-full min-w-0" />
        </div>
      </div>
      <p className="mt-2.5 font-sans text-[12px] font-semibold tracking-normal text-[#52525b]">
        Ersel&apos;s Game Area
      </p>
    </div>
  );
}

export function VictoryCertificateModal({
  gameTitle,
  recipientName,
  certId,
  issuedAt,
  isSample,
  onClose,
}: Props) {
  const certRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const pdfBusyRef = useRef(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  useBodyScrollLock(true);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      closeBtnRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, []);

  const handleDownloadPdf = useCallback(async () => {
    if (typeof window === 'undefined' || pdfBusyRef.current) return;
    const el = certRef.current;
    if (!el) {
      setPdfError('Sertifika alanı bulunamadı.');
      return;
    }
    pdfBusyRef.current = true;
    setPdfLoading(true);
    setPdfError(null);
    try {
      const safe = certId.replace(/[^\w.-]+/g, '-').slice(0, 64) || 'certificate';
      await downloadCertificateDomAsPdf(el, `ersels-game-area-certificate-${safe}.pdf`);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'PDF oluşturulamadı. Tarayıcı veya güvenlik kısıtı olabilir.';
      setPdfError(msg);
    } finally {
      pdfBusyRef.current = false;
      setPdfLoading(false);
    }
  }, [certId]);

  const dateStr = issuedAt.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(0,0,0,0.6)] p-4 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal
      aria-labelledby="cert-title"
      aria-describedby="cert-modal-desc"
    >
      <p id="cert-modal-desc" className="sr-only">
        Başarı sertifikası önizlemesi. PDF indirebilir veya Escape ile kapatabilirsiniz.
      </p>

      <div className="absolute inset-0 z-[1] cursor-pointer" aria-hidden onClick={onClose} />

      <div className="relative z-[2] w-full max-w-[min(100%,1024px)] overflow-visible">
        <button
          ref={closeBtnRef}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-0 right-0 z-[80] flex h-12 w-12 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-[#1e293b] text-[#edecec] shadow-lg transition-colors hover:bg-[#0f172a]"
          aria-label="Kapat"
        >
          <HiOutlineXMark className="h-6 w-6" />
        </button>

        <div
          className="rounded-md border border-[#c9c4bc] bg-[#ece8e0] p-3 pt-4 shadow-2xl sm:p-4 sm:pt-5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative w-full overflow-x-auto overflow-y-hidden">
            <div
              ref={certRef}
              data-certificate-print-root
              className="relative mx-auto flex shrink-0 flex-col overflow-hidden rounded-sm border border-[rgba(30,58,79,0.25)] bg-[#fcfaf6]"
              style={{ width: W, height: H }}
            >
              {isSample && (
                <div className="absolute top-3 right-3 z-10 rotate-[8deg] rounded border border-dashed border-[#d97706] bg-[#fffbeb] px-2.5 py-1 text-[10px] font-bold tracking-normal text-[#78350f]">
                  Sample
                </div>
              )}
              <div
                className="h-[6px] w-full shrink-0"
                style={{
                  background: 'linear-gradient(to right, #27a68e, #1e5c52, #1e3a4f)',
                }}
                aria-hidden
              />

              <div className="relative flex min-h-0 min-w-0 flex-1 flex-row items-stretch overflow-hidden">
                <div
                  className="flex min-h-0 min-w-0 shrink-0 flex-col justify-between gap-6 border-r border-[#d1ccc4] py-8 pr-8 pl-10 font-sans"
                  style={{ width: W - RW }}
                >
                  <div className="min-w-0 break-words">
                    <p className="text-[12px] font-semibold tracking-normal text-[#52525b]">
                      Ersel&apos;s Game Area
                    </p>
                    <h2
                      id="cert-title"
                      className={`${playfair.className} mt-2 text-[34px] leading-[1.1] font-bold tracking-tight text-[#1e3a4f]`}
                    >
                      Certificate of achievement
                    </h2>
                    <p className="mt-2 text-[17px] leading-snug font-semibold tracking-normal text-[#3f3f46]">
                      Issued in recognition of demonstrated proficiency
                    </p>
                    <div className="mt-5 h-1 w-28 max-w-full rounded-full bg-[#45b59e]" />

                    <div className="mt-6 space-y-4 text-left">
                      <p className="text-[17px] leading-snug text-[#3f3f46]">
                        This certificate confirms that
                      </p>
                      <p
                        className={`${playfair.className} text-[32px] leading-tight font-bold tracking-normal text-[#27a68e]`}
                      >
                        {recipientName}
                      </p>
                      <p className="text-[17px] leading-relaxed text-[#3f3f46]">
                        The person named above has completed the prescribed activity and satisfied
                        the conditions for{' '}
                        <span className="font-semibold text-[#1a1a1a]">«{gameTitle}»</span>. That
                        result is recognised under Ersel&apos;s Game Area and recorded here as a
                        qualifying completion for this award.
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-end justify-between gap-6 border-t border-[#e2e6ea] pt-5 text-[12px] text-[#71717a]">
                    <div>
                      <p className="font-semibold tracking-normal text-[#71717a]">Date printed</p>
                      <time
                        className="mt-1.5 block text-[15px] font-semibold text-[#1a1a1a]"
                        dateTime={issuedAt.toISOString()}
                      >
                        {dateStr}
                      </time>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold tracking-normal text-[#71717a]">Reference No.</p>
                      <span className="mt-1.5 block font-mono text-[12px] font-medium tracking-tight text-[#1a1a1a]">
                        {certId}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className="flex shrink-0 flex-col items-center justify-center gap-8 px-7 py-9 font-sans"
                  style={{
                    width: RW,
                    background: 'linear-gradient(to bottom, #faf8f4, #f3efe8)',
                  }}
                >
                  <CertificateSeal />

                  <div className="flex w-full flex-col items-center text-center">
                    <span
                      data-certificate-signature
                      className={`${signatureScript.className} inline-block max-w-[15rem] text-[68px] leading-none text-[#1a1a1a]`}
                      style={{ transform: 'rotate(-1.25deg) translateY(8px)' }}
                    >
                      <span className="inline">Yu</span>
                      <span className="-ml-[0.035em] inline">k</span>
                    </span>
                    <p className="mt-4 text-[15px] font-semibold tracking-normal text-[#1a1a1a]">
                      Yusuf Ersel Kara
                    </p>
                    <p className="mt-1.5 text-[12px] font-medium tracking-normal text-[#1a1a1a]">
                      Creator, Ersel&apos;s Game Area
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="h-px w-full shrink-0"
                style={{
                  background:
                    'linear-gradient(to right, transparent, rgba(184,134,11,0.35), transparent)',
                }}
                aria-hidden
              />
            </div>
          </div>

          <div className="mt-4 flex flex-col items-center gap-2 sm:mt-5">
            <Button
              type="button"
              variant="secondary"
              disabled={pdfLoading}
              onClick={() => void handleDownloadPdf()}
            >
              {pdfLoading ? 'Hazırlanıyor…' : 'PDF indir'}
            </Button>
            {pdfError ? (
              <p role="alert" className="max-w-md px-2 text-center text-sm text-[#dc2626]">
                {pdfError}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
