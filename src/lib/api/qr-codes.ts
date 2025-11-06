const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.yildizskylab.com';

export const qrCodesApi = {
  /**
   * QR kod oluşturur (logo olmadan)
   * @param url QR kod içine eklenecek URL
   * @param width QR kod genişliği (piksel)
   * @param height QR kod yüksekliği (piksel)
   * @returns PNG formatında QR kod blob'u
   */
  async generateQRCode(url: string, width: number, height: number): Promise<Blob> {
    const response = await fetch(
      `${API_BASE_URL}/api/qrCodes/generateQRCode?url=${encodeURIComponent(url)}&width=${width}&height=${height}`,
      {
        method: 'GET',
        credentials: 'include',
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`QR kod oluşturma başarısız: ${response.status} - ${errorText}`);
    }
    
    return response.blob();
  },

  /**
   * Logo ile QR kod oluşturur
   * @param url QR kod içine eklenecek URL
   * @param width QR kod genişliği (piksel)
   * @param height QR kod yüksekliği (piksel)
   * @param logoSize Logo boyutu (piksel, varsayılan: 50)
   * @returns PNG formatında QR kod blob'u
   */
  async generateQRCodeWithLogo(url: string, width: number, height: number, logoSize: number = 50): Promise<Blob> {
    const response = await fetch(
      `${API_BASE_URL}/api/qrCodes/generateQRCodeWithLogo?url=${encodeURIComponent(url)}&width=${width}&height=${height}&logoSize=${logoSize}`,
      {
        method: 'GET',
        credentials: 'include',
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`QR kod oluşturma başarısız: ${response.status} - ${errorText}`);
    }
    
    return response.blob();
  },
};

