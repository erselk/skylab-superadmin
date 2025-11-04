import { apiClient } from './client';

export const qrCodesApi = {
  async generateQRCode(url: string, width: number, height: number): Promise<Blob> {
    const response = await fetch(`${apiClient.baseURL}/api/qrCodes/generateQRCode?url=${encodeURIComponent(url)}&width=${width}&height=${height}`, {
      headers: apiClient.getHeaders(),
    });
    if (!response.ok) throw new Error('QR code generation failed');
    return response.blob();
  },

  async generateQRCodeWithLogo(url: string, width: number, height: number, logoSize: number = 50): Promise<Blob> {
    const response = await fetch(`${apiClient.baseURL}/api/qrCodes/generateQRCodeWithLogo?url=${encodeURIComponent(url)}&width=${width}&height=${height}&logoSize=${logoSize}`, {
      headers: apiClient.getHeaders(),
    });
    if (!response.ok) throw new Error('QR code generation failed');
    return response.blob();
  },
};

