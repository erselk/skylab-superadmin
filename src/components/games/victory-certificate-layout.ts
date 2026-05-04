/**
 * Genişlik sabit; yükseklik A4 yatay (~679px) altında — sadece kart kısalır, içerik modalda eski ölçülerde.
 * İçerik ölçüleri `VictoryCertificateModal` ile aynı kalmalı (PDF = ekran).
 */
export const CERTIFICATE_LAYOUT_PX = {
  width: 960,
  height: 520,
  rightColumnWidth: 300,
} as const;
