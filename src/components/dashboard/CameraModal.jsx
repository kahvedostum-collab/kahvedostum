import { useState, useRef, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/shacdn/dialog";
import { Button } from "@/components/shacdn/button";
import { Input } from "@/components/shacdn/input";
import { Label } from "@/components/shacdn/label";
import {
  Camera,
  Send,
  RotateCcw,
  Receipt,
  Loader2,
  X,
  SwitchCamera,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { scanReceipt } from "@/endpoints/receipt/ReceiptAPI";
import { toast } from "react-toastify";

export function CameraModal({ open, onOpenChange }) {
  const { t } = useTranslation();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [resultStatus, setResultStatus] = useState(null); // 'success' | 'error'
  const [facingMode, setFacingMode] = useState("environment");
  const [showReceiptForm, setShowReceiptForm] = useState(false);
  const [confirmed, setConfirmed] = useState(false); // Onay dialogu için
  const [receiptData, setReceiptData] = useState({
    taxNumber: "",
    address: "",
    total: "",
    receiptDate: "",
    receiptNo: "",
    brand: "",
  });

  const startCamera = useCallback(
    async (mode = facingMode) => {
      setLoading(true);
      setError(null);
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: mode,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
        setStream(mediaStream);
        return mediaStream;
      } catch (err) {
        setError(t("camera.errors.cameraPermission"));
        console.error("Camera error:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [t, facingMode]
  );


  const switchCamera = useCallback(async () => {
    // Mevcut stream'i kapat
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    // facingMode'u değiştir
    const newMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newMode);
    // Yeni kamerayı başlat
    await startCamera(newMode);
  }, [stream, facingMode, startCamera]);

  // Start camera only after user confirms
  useEffect(() => {
    let currentStream = null;

    const initializeCamera = async () => {
      if (open && confirmed) {
        const mediaStream = await startCamera();
        currentStream = mediaStream;
      }
    };

    initializeCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [open, confirmed, startCamera]);

  // Attach stream to video element when both are ready
  useEffect(() => {
    if (stream && videoRef.current && !capturedImage) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, capturedImage]);

  const handleClose = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCapturedImage(null);
    setError(null);
    setShowReceiptForm(false);
    setShowResult(false);
    setResultStatus(null);
    setConfirmed(false);
    setReceiptData({
      taxNumber: "",
      address: "",
      total: "",
      receiptDate: "",
      receiptNo: "",
      brand: "",
    });
    onOpenChange(false);
  }, [stream, onOpenChange]);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Video'nun orijinal boyutlarını kullan
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Video'yu olduğu gibi çiz (crop yok)
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL("image/jpeg", 1.0);
        setCapturedImage(imageData);
      }
    }
  }, []);

  const retake = useCallback(() => {
    setCapturedImage(null);
    setShowReceiptForm(false);
  }, []);

  const handleReceiptInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setReceiptData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleContinueToForm = useCallback(async () => {
    if (!capturedImage) return;

    setSubmitting(true);
    setError(null);

    try {
      // Base64'ü Blob'a dönüştür
      const base64Data = capturedImage.split(",")[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "image/jpeg" });

      // FormData oluştur
      const formData = new FormData();
      formData.append("file", blob, "receipt.jpg");

      // Upload endpoint'ine gönder
      const response = await fetch("http://91.241.50.213:8901/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const data = await response.json();

      // Token'ı alert ile göster
      if (data.token) {
        alert(data.token);
      }

      setShowReceiptForm(true);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || t("camera.errors.uploadFailed"));
      toast.error(err.message || t("camera.errors.uploadFailed"));
    } finally {
      setSubmitting(false);
    }
  }, [capturedImage, t]);

  const handleSubmitReceipt = useCallback(async () => {
    // Validasyon
    if (!receiptData.taxNumber || !receiptData.address || !receiptData.total || !receiptData.receiptDate) {
      toast.error(t("camera.receipt.validationError"));
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await scanReceipt({
        taxNumber: receiptData.taxNumber,
        address: receiptData.address,
        total: receiptData.total,
        receiptDate: receiptData.receiptDate,
        receiptNo: receiptData.receiptNo || undefined,
        brand: receiptData.brand || undefined,
        rawText: capturedImage, // Base64 image as raw data
      });

      setResultStatus("success");
      setShowResult(true);
      toast.success(t("camera.receipt.success"));
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error?.message || t("camera.receipt.error");
      setError(errorMessage);
      setResultStatus("error");
      setShowResult(true);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  }, [receiptData, capturedImage, t]);

  return (
    <>
      {/* Confirmation Dialog - shown before camera access */}
      <Dialog open={open && !confirmed} onOpenChange={(isOpen) => !isOpen && handleClose()}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-sm max-w-[95vw] p-0 overflow-hidden bg-white dark:bg-zinc-900 border-amber-200 dark:border-amber-800"
        >
          {/* Gradient Header */}
          <div className="relative bg-linear-to-r from-amber-500 via-orange-500 to-amber-600 px-4 sm:px-6 py-3 sm:py-4">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2230%22%20height%3D%2230%22%20viewBox%3D%220%200%2030%2030%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M0%2010h10v10H0z%22%20fill%3D%22%23fff%22%20fill-opacity%3D%22.05%22%2F%3E%3C%2Fsvg%3E')] opacity-50" />

            <DialogHeader className="relative">
              <DialogTitle className="text-white flex items-center gap-3 text-lg font-semibold">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                {t("camera.confirm.title")}
              </DialogTitle>
              <DialogDescription className="text-amber-100 mt-1">
                {t("camera.confirm.description")}
              </DialogDescription>
            </DialogHeader>

            {/* Close button */}
            <button
              onClick={() => handleClose()}
              className="absolute right-4 top-4 rounded-full p-1.5 text-white/80 hover:text-white hover:bg-white/20 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Confirmation Content */}
          <div className="p-4 sm:p-6 space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <Camera className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  {t("camera.confirm.cameraAccess")}
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                <ShieldCheck className="h-5 w-5 text-zinc-600 dark:text-zinc-400 mt-0.5 shrink-0" />
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {t("camera.confirm.privacyNote")}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => handleClose()}
                variant="outline"
                className="flex-1 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20"
              >
                {t("camera.confirm.decline")}
              </Button>
              <Button
                onClick={() => setConfirmed(true)}
                className="flex-1 gap-2 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30"
              >
                <Camera className="h-4 w-4" />
                {t("camera.confirm.accept")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Camera Dialog - shown after confirmation */}
      <Dialog open={open && confirmed} onOpenChange={(isOpen) => !isOpen && handleClose()}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-md max-w-[95vw] p-0 overflow-hidden bg-white dark:bg-zinc-900 border-amber-200 dark:border-amber-800"
        >
          {/* Gradient Header */}
          <div className="relative bg-linear-to-r from-amber-500 via-orange-500 to-amber-600 px-4 sm:px-6 py-3 sm:py-4">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2230%22%20height%3D%2230%22%20viewBox%3D%220%200%2030%2030%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M0%2010h10v10H0z%22%20fill%3D%22%23fff%22%20fill-opacity%3D%22.05%22%2F%3E%3C%2Fsvg%3E')] opacity-50" />

            <DialogHeader className="relative">
              <DialogTitle className="text-white flex items-center gap-3 text-lg font-semibold">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <Camera className="h-5 w-5" />
                </div>
                {t("camera.title")}
              </DialogTitle>
              <DialogDescription className="text-amber-100 mt-1">
                {t("camera.description")}
              </DialogDescription>
            </DialogHeader>

            {/* Close button */}
            <button
              onClick={() => handleClose()}
              className="absolute right-4 top-4 rounded-full p-1.5 text-white/80 hover:text-white hover:bg-white/20 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
            {error && (
              <div className="rounded-lg bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="relative w-full max-h-[60vh] overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800">
              {/* Corner Markers */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-amber-500 rounded-tl-lg z-10" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-amber-500 rounded-tr-lg z-10" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-amber-500 rounded-bl-lg z-10" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-amber-500 rounded-br-lg z-10" />

              {/* Camera Switch Button */}
              {!capturedImage && stream && !loading && (
                <button
                  onClick={switchCamera}
                  className="absolute top-3 right-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-all hover:bg-black/70 hover:scale-110"
                  aria-label={t("camera.switchCamera")}
                >
                  <SwitchCamera className="h-5 w-5" />
                </button>
              )}

              {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                  <span className="text-xs text-amber-700 dark:text-amber-300">
                    {t("camera.loading")}
                  </span>
                </div>
              )}

              {/* Camera Not Accessible */}
              {!stream && !loading && !capturedImage && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700">
                    <Camera className="h-8 w-8 text-zinc-400 dark:text-zinc-500" />
                  </div>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {t("camera.errors.notAccessible")}
                  </span>
                </div>
              )}

              {!capturedImage ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-contain"
                />
              ) : (
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="h-full w-full object-contain"
                />
              )}

              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Receipt Form - shown after photo capture */}
            {capturedImage && showReceiptForm && (
              <div className="space-y-3 mt-4 p-4 bg-amber-50 dark:bg-zinc-800 rounded-xl border border-amber-200 dark:border-amber-800">
                <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100 flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  {t("camera.receipt.title")}
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="taxNumber" className="text-xs text-amber-800 dark:text-amber-200">
                      {t("camera.receipt.taxNumber")} *
                    </Label>
                    <Input
                      id="taxNumber"
                      name="taxNumber"
                      value={receiptData.taxNumber}
                      onChange={handleReceiptInputChange}
                      placeholder="1234567890"
                      className="h-9 text-sm border-amber-300 dark:border-amber-700"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="total" className="text-xs text-amber-800 dark:text-amber-200">
                      {t("camera.receipt.total")} *
                    </Label>
                    <Input
                      id="total"
                      name="total"
                      value={receiptData.total}
                      onChange={handleReceiptInputChange}
                      placeholder="180.00"
                      className="h-9 text-sm border-amber-300 dark:border-amber-700"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="address" className="text-xs text-amber-800 dark:text-amber-200">
                    {t("camera.receipt.address")} *
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    value={receiptData.address}
                    onChange={handleReceiptInputChange}
                    placeholder={t("camera.receipt.addressPlaceholder")}
                    className="h-9 text-sm border-amber-300 dark:border-amber-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="receiptDate" className="text-xs text-amber-800 dark:text-amber-200">
                      {t("camera.receipt.date")} *
                    </Label>
                    <Input
                      id="receiptDate"
                      name="receiptDate"
                      type="datetime-local"
                      value={receiptData.receiptDate}
                      onChange={handleReceiptInputChange}
                      className="h-9 text-sm border-amber-300 dark:border-amber-700"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="receiptNo" className="text-xs text-amber-800 dark:text-amber-200">
                      {t("camera.receipt.receiptNo")}
                    </Label>
                    <Input
                      id="receiptNo"
                      name="receiptNo"
                      value={receiptData.receiptNo}
                      onChange={handleReceiptInputChange}
                      placeholder="FIS-001"
                      className="h-9 text-sm border-amber-300 dark:border-amber-700"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="brand" className="text-xs text-amber-800 dark:text-amber-200">
                    {t("camera.receipt.brand")}
                  </Label>
                  <Input
                    id="brand"
                    name="brand"
                    value={receiptData.brand}
                    onChange={handleReceiptInputChange}
                    placeholder={t("camera.receipt.brandPlaceholder")}
                    className="h-9 text-sm border-amber-300 dark:border-amber-700"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-center gap-3">
              {!capturedImage ? (
                <Button
                  onClick={capturePhoto}
                  disabled={!stream || loading}
                  size="lg"
                  className="gap-2 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30"
                >
                  <Camera className="h-5 w-5" />
                  {t("camera.capture")}
                </Button>
              ) : !showReceiptForm ? (
                <>
                  <Button
                    onClick={retake}
                    variant="outline"
                    size="lg"
                    disabled={submitting}
                    className="gap-2 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                  >
                    <RotateCcw className="h-5 w-5" />
                    {t("camera.retake")}
                  </Button>
                  <Button
                    onClick={handleContinueToForm}
                    size="lg"
                    disabled={submitting}
                    className="gap-2 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        {t("camera.uploading")}
                      </>
                    ) : (
                      <>
                        <Receipt className="h-5 w-5" />
                        {t("camera.continue")}
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={retake}
                    variant="outline"
                    size="lg"
                    disabled={submitting}
                    className="gap-2 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                  >
                    <RotateCcw className="h-5 w-5" />
                    {t("camera.retake")}
                  </Button>
                  <Button
                    onClick={handleSubmitReceipt}
                    size="lg"
                    disabled={submitting}
                    className="gap-2 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        {t("camera.submitting")}
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        {t("camera.send")}
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Result Dialog */}
      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-sm max-w-[95vw] p-0 overflow-hidden bg-white dark:bg-zinc-900 border-amber-200 dark:border-amber-800"
        >
          {/* Gradient Header */}
          <div className={`relative px-4 sm:px-6 py-3 sm:py-4 ${
            resultStatus === "success"
              ? "bg-linear-to-r from-green-500 via-emerald-500 to-green-600"
              : "bg-linear-to-r from-red-500 via-rose-500 to-red-600"
          }`}>
            <DialogHeader className="relative">
              <DialogTitle className="text-white flex items-center gap-2 sm:gap-3 text-base sm:text-lg font-semibold">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  {resultStatus === "success" ? (
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </div>
                {resultStatus === "success"
                  ? t("camera.receipt.successTitle")
                  : t("camera.receipt.errorTitle")}
              </DialogTitle>
              <DialogDescription className={`mt-1 text-sm ${
                resultStatus === "success" ? "text-green-100" : "text-red-100"
              }`}>
                {resultStatus === "success"
                  ? t("camera.receipt.successDescription")
                  : error || t("camera.receipt.errorDescription")}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
            {capturedImage && resultStatus === "success" && (
              <div className="overflow-hidden rounded-xl sm:rounded-2xl border-2 border-green-200 dark:border-green-800 max-h-[40vh]">
                <img src={capturedImage} alt="Receipt" className="w-full h-full object-contain" />
              </div>
            )}

            {resultStatus === "success" ? (
              <Button
                onClick={() => {
                  setShowResult(false);
                  handleClose();
                }}
                className="w-full bg-linear-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
              >
                {t("camera.receipt.done")}
              </Button>
            ) : (
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowResult(false);
                    handleClose();
                  }}
                  variant="outline"
                  className="flex-1 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300"
                >
                  {t("camera.receipt.cancel")}
                </Button>
                <Button
                  onClick={() => {
                    setShowResult(false);
                    setError(null);
                  }}
                  className="flex-1 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                >
                  {t("camera.receipt.tryAgain")}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

CameraModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
};

export default CameraModal;
