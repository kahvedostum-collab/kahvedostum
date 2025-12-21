import axios from '@/services/axiosClient';

/**
 * POST /api/receipts/init - Fiş işleme başlatma
 *
 * Fiş yükleme işlemini başlatır ve SignalR bağlantısı için gerekli bilgileri döner.
 *
 * @param {number} cafeId - Kafe ID'si
 * @param {number} lat - Kullanıcı enlem koordinatı
 * @param {number} lng - Kullanıcı boylam koordinatı
 * @returns {Promise<{receiptId: number, channelKey: string, uploadUrl: string, bucket: string, objectKey: string}>}
 */
export const initReceipt = async (cafeId, lat, lng) => {
  const response = await axios.post('/receipts/init', {
    cafeId,
    lat,
    lng,
  });
  return response.data.data;
};

/**
 * POST /api/receipts/:id/complete - Fiş işleme tamamlama
 *
 * Dosya yükleme tamamlandıktan sonra OCR işlemini başlatır.
 *
 * @param {number} receiptId - Fiş ID'si
 * @param {string} bucket - S3 bucket adı
 * @param {string} objectKey - S3 object key
 * @returns {Promise} API yanıtı
 */
export const completeReceipt = async (receiptId, bucket, objectKey) => {
  const response = await axios.post(`/receipts/${receiptId}/complete`, {
    bucket,
    objectKey,
  });
  return response.data;
};

/**
 * PUT to uploadUrl - Dosyayı S3'e yükle
 *
 * Presigned URL'e dosya yükler (axios client kullanmaz, direkt fetch)
 *
 * @param {string} uploadUrl - S3 presigned upload URL
 * @param {File|Blob} file - Yüklenecek dosya
 * @returns {Promise<Response>}
 */
export const uploadReceiptFile = async (uploadUrl, file) => {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type || 'image/jpeg',
    },
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
  }

  return response;
};

/**
 * POST /api/receipts/scan - Fiş tarama ve kafe aktivasyonu (Eski akış)
 *
 * @deprecated Yeni SignalR tabanlı akış için initReceipt, uploadReceiptFile, completeReceipt kullanın
 */
export const scanReceipt = async ({
  taxNumber,
  address,
  total,
  receiptDate,
  receiptNo,
  rawText,
  brand,
}) => {
  const payload = {
    taxNumber,
    address,
    total,
    receiptDate,
  };

  if (receiptNo) payload.receiptNo = receiptNo;
  if (rawText) payload.rawText = rawText;
  if (brand) payload.brand = brand;

  const response = await axios.post('/receipts/scan', payload);
  return response.data;
};

export default {
  initReceipt,
  completeReceipt,
  uploadReceiptFile,
  scanReceipt,
};
