import axios from '@/services/axiosClient';

/**
 * POST /api/receipts/scan - Fiş tarama ve kafe aktivasyonu
 *
 * Fiş okutma sürecinde kullanılır. Her fiş yalnızca 1 kez kullanılabilir.
 * Vergi numarası veya adres ile kafe eşleştirmesi yapılır.
 *
 * @param {Object} data - Fiş verileri
 * @param {string} data.taxNumber - Fişte yazan kafenin vergi numarası (zorunlu)
 * @param {string} data.address - Fiş üzerindeki adres (zorunlu)
 * @param {string} data.total - Fiş toplam tutarı (zorunlu)
 * @param {string} data.receiptDate - Fişin üzerinde yazan tarih/saat ISO format (zorunlu)
 * @param {string} [data.receiptNo] - Fiş numarası (opsiyonel)
 * @param {string} [data.rawText] - OCR'dan gelen ham fiş metni (opsiyonel)
 * @param {string} [data.brand] - Kafe adı (opsiyonel, bilgi amaçlı)
 * @returns {Promise} API yanıtı - Başarılı ise token döner
 *
 * @example
 * const result = await scanReceipt({
 *   taxNumber: "1234567890",
 *   address: "Etiler Mah. Nispetiye Cad. No:12 Beşiktaş",
 *   total: "180.00",
 *   receiptDate: "2025-12-13T15:00:00"
 * });
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

  // Opsiyonel alanları ekle
  if (receiptNo) payload.receiptNo = receiptNo;
  if (rawText) payload.rawText = rawText;
  if (brand) payload.brand = brand;

  const response = await axios.post('/receipts/scan', payload);
  return response.data;
};

export default { scanReceipt };
