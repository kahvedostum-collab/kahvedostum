import { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/shacdn/dialog";
import { QrCode, Camera, X, Loader2, CheckCircle2, ScanLine } from "lucide-react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const QRScanner = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setIsScanning(true);
      setIsSuccess(false);

      // Scanner'i biraz geciktirerek baslat (DOM hazir olsun)
      const timer = setTimeout(() => {
        if (!scannerRef.current) {
          scannerRef.current = new Html5QrcodeScanner(
            "qr-reader",
            {
              fps: 10,
              qrbox: { width: 220, height: 220 },
              aspectRatio: 1,
              showTorchButtonIfSupported: true,
              showZoomSliderIfSupported: true,
            },
            false
          );

          scannerRef.current.render(
            (decodedText) => {
              setIsSuccess(true);
              setIsScanning(false);
              toast.success(t("qrScanner.success") || "QR okundu!");
              console.log("QR Data:", decodedText);

              // Kisa bir gecikme sonra kapat
              setTimeout(() => {
                scannerRef.current?.clear();
                scannerRef.current = null;
                setIsOpen(false);
              }, 1000);
            },
            (error) => {
              // Scan error - ignore (continuous scanning)
            }
          );
          // html5-qrcode now controls the UI (permission request or camera)
          setIsCameraReady(true);
        }
      }, 200);

      return () => clearTimeout(timer);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [isOpen, t]);

  const handleClose = (open) => {
    if (!open && scannerRef.current) {
      scannerRef.current.clear().catch(() => {});
      scannerRef.current = null;
    }
    setIsOpen(open);
    setIsScanning(false);
    setIsSuccess(false);
    setIsCameraReady(false);
  };

  return (
    <>
      {/* Floating Action Button with Pulse Animation */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 group"
        aria-label={t("qrScanner.scanQR") || "QR Kod Okut"}
      >
        {/* Pulse rings */}
        <span className="absolute inset-0 rounded-full bg-amber-500/30 animate-ping" />
        <span className="absolute inset-0 rounded-full bg-amber-500/20 animate-pulse" />

        {/* Button */}
        <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white shadow-lg shadow-amber-500/30 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-amber-500/40">
          <QrCode className="h-6 w-6 transition-transform group-hover:rotate-12" />
        </span>
      </button>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent showCloseButton={false} className="sm:max-w-md p-0 overflow-hidden bg-white dark:bg-zinc-900 border-amber-200 dark:border-amber-800">
          {/* Gradient Header */}
          <div className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-6 py-4">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2230%22%20height%3D%2230%22%20viewBox%3D%220%200%2030%2030%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M0%2010h10v10H0z%22%20fill%3D%22%23fff%22%20fill-opacity%3D%22.05%22%2F%3E%3C%2Fsvg%3E')] opacity-50" />

            <DialogHeader className="relative">
              <DialogTitle className="text-white flex items-center gap-3 text-lg font-semibold">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <QrCode className="h-5 w-5" />
                </div>
                {t("qrScanner.title") || "QR Kod Okut"}
              </DialogTitle>
            </DialogHeader>

            {/* Close button */}
            <button
              onClick={() => handleClose(false)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-white/80 hover:text-white hover:bg-white/20 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Status Message */}
            <div className="flex items-center justify-center gap-2 mb-4">
              {isSuccess ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500 animate-bounce" />
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    {t("qrScanner.success") || "QR Kod Basariyla Okundu!"}
                  </p>
                </>
              ) : (
                <>
                  <Camera className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    {t("qrScanner.instruction") || "Kameranizi QR koda dogrultun"}
                  </p>
                </>
              )}
            </div>

            {/* Scanner Container with Custom Styling */}
            <div className="relative rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
              {/* Corner Markers */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-amber-500 rounded-tl-lg z-10" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-amber-500 rounded-tr-lg z-10" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-amber-500 rounded-bl-lg z-10" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-amber-500 rounded-br-lg z-10" />

              {/* Animated Scan Line */}
              {isScanning && !isSuccess && (
                <div className="absolute inset-x-4 top-0 h-full z-10 pointer-events-none overflow-hidden">
                  <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-amber-500 to-transparent animate-scan-line" />
                </div>
              )}

              {/* Loading Overlay - only show before html5-qrcode takes control */}
              {!isCameraReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 z-5">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
                    <span className="text-xs text-amber-700 dark:text-amber-300">
                      {t("qrScanner.loading") || "Kamera yukleniyor..."}
                    </span>
                  </div>
                </div>
              )}

              {/* QR Reader Container */}
              <div
                id="qr-reader"
                className="w-full [&>div]:!border-none [&_video]:rounded-xl [&_#qr-shaded-region]:!border-amber-500/30 [&_button]:!bg-amber-500 [&_button]:!text-white [&_button]:!rounded-lg [&_button]:!px-4 [&_button]:!py-2 [&_button]:hover:!bg-amber-600 [&_select]:!bg-white [&_select]:dark:!bg-zinc-800 [&_select]:!border-amber-300 [&_select]:dark:!border-amber-700 [&_select]:!rounded-lg [&_select]:!text-amber-900 [&_select]:dark:!text-amber-100 [&_#html5-qrcode-anchor-scan-type-change]:!text-amber-600 [&_#html5-qrcode-anchor-scan-type-change]:dark:!text-amber-400 [&_#html5-qrcode-anchor-scan-type-change]:!underline-offset-4"
              />
            </div>

            {/* Help Text */}
            <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <ScanLine className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                <p className="font-medium">{t("qrScanner.helpTitle") || "Ipuclari:"}</p>
                <ul className="list-disc list-inside space-y-0.5 text-amber-600 dark:text-amber-400">
                  <li>{t("qrScanner.helpTip1") || "QR kodu cevreye iyi aydinlatilmis sekilde tutun"}</li>
                  <li>{t("qrScanner.helpTip2") || "Kamerayi sabit tutun"}</li>
                  <li>{t("qrScanner.helpTip3") || "QR kodun tamamen gorunur oldugundan emin olun"}</li>
                </ul>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Custom CSS for scan line animation and html5-qrcode styling */}
      <style jsx global>{`
        @keyframes scan-line {
          0% { transform: translateY(0); }
          50% { transform: translateY(280px); }
          100% { transform: translateY(0); }
        }
        .animate-scan-line {
          animation: scan-line 2s ease-in-out infinite;
        }

        /* ===== HTML5-QRCODE MODERN STYLING ===== */

        /* Main container */
        #qr-reader {
          border: none !important;
          padding: 12px !important;
        }

        /* Hide default loading/status text */
        #qr-reader__status_span {
          display: none !important;
        }

        /* Dashboard section container */
        #qr-reader__dashboard_section {
          padding: 0 !important;
          margin-top: 12px !important;
        }

        /* Camera selection row - Container styling */
        #qr-reader__dashboard_section_csr {
          background: linear-gradient(to bottom, #fef3c7, #fde68a) !important;
          border: 1px solid #fbbf24 !important;
          border-radius: 16px !important;
          padding: 16px !important;
          margin-top: 16px !important;
          margin-bottom: 12px !important;
          position: relative !important;
        }

        #qr-reader__dashboard_section_csr::before {
          content: "📷 Kamera Seç" !important;
          display: block !important;
          font-size: 12px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.5px !important;
          color: #92400e !important;
          margin-bottom: 10px !important;
        }

        .dark #qr-reader__dashboard_section_csr {
          background: linear-gradient(to bottom, #292524, #1c1917) !important;
          border-color: #b45309 !important;
        }

        .dark #qr-reader__dashboard_section_csr::before {
          color: #fcd34d !important;
        }

        /* File selection row - Container styling */
        #qr-reader__dashboard_section_fsr {
          background: linear-gradient(to bottom, #fef3c7, #fde68a) !important;
          border: 1px solid #fbbf24 !important;
          border-radius: 16px !important;
          padding: 16px !important;
          margin-bottom: 12px !important;
        }

        #qr-reader__dashboard_section_fsr::before {
          content: "🖼️ Resim Dosyası" !important;
          display: block !important;
          font-size: 12px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.5px !important;
          color: #92400e !important;
          margin-bottom: 10px !important;
        }

        .dark #qr-reader__dashboard_section_fsr {
          background: linear-gradient(to bottom, #292524, #1c1917) !important;
          border-color: #b45309 !important;
        }

        .dark #qr-reader__dashboard_section_fsr::before {
          color: #fcd34d !important;
        }

        /* Camera selection dropdown - Modern styling */
        #qr-reader__camera_selection {
          width: 100% !important;
          padding: 14px 16px !important;
          margin: 0 !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          border: 2px solid #d97706 !important;
          border-radius: 12px !important;
          background: #fff !important;
          color: #92400e !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
          appearance: none !important;
          -webkit-appearance: none !important;
          -moz-appearance: none !important;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23d97706' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") !important;
          background-repeat: no-repeat !important;
          background-position: right 12px center !important;
          background-size: 20px !important;
          padding-right: 44px !important;
          box-shadow: 0 2px 8px rgba(217, 119, 6, 0.15) !important;
        }

        #qr-reader__camera_selection:hover {
          border-color: #b45309 !important;
          box-shadow: 0 4px 12px rgba(217, 119, 6, 0.25) !important;
          transform: translateY(-1px) !important;
        }

        #qr-reader__camera_selection:focus {
          outline: none !important;
          border-color: #b45309 !important;
          box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.2), 0 4px 12px rgba(217, 119, 6, 0.2) !important;
        }

        /* Dark mode camera dropdown */
        .dark #qr-reader__camera_selection {
          background: #1c1917 !important;
          border-color: #d97706 !important;
          color: #fcd34d !important;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23fbbf24' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") !important;
          box-shadow: 0 2px 8px rgba(217, 119, 6, 0.2) !important;
        }

        .dark #qr-reader__camera_selection:hover {
          border-color: #f59e0b !important;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3) !important;
        }

        .dark #qr-reader__camera_selection:focus {
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.2), 0 4px 12px rgba(245, 158, 11, 0.2) !important;
        }

        /* Camera selection option styling */
        #qr-reader__camera_selection option {
          padding: 12px !important;
          background: #fff !important;
          color: #92400e !important;
        }

        .dark #qr-reader__camera_selection option {
          background: #1c1917 !important;
          color: #fcd34d !important;
        }

        /* Scan type switch link (Camera/File toggle) */
        #html5-qrcode-anchor-scan-type-change {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 8px !important;
          width: 100% !important;
          padding: 12px 20px !important;
          margin: 12px 0 !important;
          font-size: 14px !important;
          font-weight: 600 !important;
          text-decoration: none !important;
          color: #fff !important;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
          border-radius: 12px !important;
          transition: all 0.3s ease !important;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3) !important;
        }

        #html5-qrcode-anchor-scan-type-change:hover {
          background: linear-gradient(135deg, #d97706 0%, #b45309 100%) !important;
          box-shadow: 0 6px 16px rgba(217, 119, 6, 0.4) !important;
          transform: translateY(-1px) !important;
        }

        .dark #html5-qrcode-anchor-scan-type-change {
          background: linear-gradient(135deg, #b45309 0%, #92400e 100%) !important;
          box-shadow: 0 4px 12px rgba(180, 83, 9, 0.4) !important;
        }

        .dark #html5-qrcode-anchor-scan-type-change:hover {
          background: linear-gradient(135deg, #d97706 0%, #b45309 100%) !important;
        }

        /* File input styling */
        #qr-reader input[type="file"] {
          width: 100% !important;
          padding: 16px !important;
          margin: 8px 0 !important;
          font-size: 14px !important;
          border: 2px dashed #fbbf24 !important;
          border-radius: 12px !important;
          background: linear-gradient(to bottom, #fffbeb, #fef3c7) !important;
          color: #92400e !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
        }

        #qr-reader input[type="file"]:hover {
          border-color: #f59e0b !important;
          background: linear-gradient(to bottom, #fef3c7, #fde68a) !important;
        }

        .dark #qr-reader input[type="file"] {
          background: linear-gradient(to bottom, #292524, #1c1917) !important;
          border-color: #b45309 !important;
          color: #fcd34d !important;
        }

        .dark #qr-reader input[type="file"]:hover {
          border-color: #d97706 !important;
          background: linear-gradient(to bottom, #1c1917, #0c0a09) !important;
        }

        /* All buttons in qr-reader */
        #qr-reader button {
          padding: 12px 24px !important;
          font-size: 14px !important;
          font-weight: 600 !important;
          border: none !important;
          border-radius: 12px !important;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
          color: #fff !important;
          cursor: pointer !important;
          transition: all 0.3s ease !important;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3) !important;
        }

        #qr-reader button:hover {
          background: linear-gradient(135deg, #d97706 0%, #b45309 100%) !important;
          box-shadow: 0 6px 16px rgba(217, 119, 6, 0.4) !important;
          transform: translateY(-1px) !important;
        }

        .dark #qr-reader button {
          background: linear-gradient(135deg, #b45309 0%, #92400e 100%) !important;
        }

        /* Permission button specific */
        #qr-reader__camera_permission_button {
          margin: 20px auto !important;
          display: block !important;
          padding: 14px 28px !important;
          font-size: 15px !important;
        }

        /* Text styling */
        #qr-reader span,
        #qr-reader div {
          font-family: inherit !important;
        }

        #qr-reader__header_message {
          font-size: 14px !important;
          color: #92400e !important;
          margin-bottom: 12px !important;
          font-weight: 500 !important;
        }

        .dark #qr-reader__header_message {
          color: #fcd34d !important;
        }

        /* General dark mode text */
        .dark #qr-reader {
          color: #fcd34d !important;
        }

        .dark #qr-reader span,
        .dark #qr-reader div:not([id*="shaded"]) {
          color: #fcd34d !important;
        }

        /* Hide ugly borders */
        #qr-reader > div:first-child {
          border: none !important;
        }

        /* Video element styling */
        #qr-reader video {
          border-radius: 12px !important;
        }

        /* Shaded region (scan box) */
        #qr-shaded-region {
          border-color: rgba(245, 158, 11, 0.5) !important;
        }

        /* Image scan label */
        #qr-reader__filescan_input + span,
        #qr-reader label {
          display: block !important;
          text-align: center !important;
          font-size: 13px !important;
          color: #b45309 !important;
          margin-top: 8px !important;
        }

        .dark #qr-reader__filescan_input + span,
        .dark #qr-reader label {
          color: #fbbf24 !important;
        }

        /* Torch and zoom controls */
        #qr-reader__torch_button,
        #qr-reader__dashboard_section_swaplink {
          margin-top: 8px !important;
        }
      `}</style>
    </>
  );
};

export default QRScanner;
