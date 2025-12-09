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
import {
  Camera,
  Send,
  RotateCcw,
  MapPin,
  Loader2,
  X,
  SwitchCamera,
} from "lucide-react";

export function CameraModal({ open, onOpenChange }) {
  const { t } = useTranslation();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [facingMode, setFacingMode] = useState("environment");

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

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError(t("camera.errors.locationNotSupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (err) => {
        setError(t("camera.errors.locationPermission"));
        console.error("Location error:", err);
      },
      { enableHighAccuracy: true }
    );
  }, [t]);

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

  // Start camera and get location when modal opens
  useEffect(() => {
    let currentStream = null;

    const initializePermissions = async () => {
      if (open) {
        const mediaStream = await startCamera();
        currentStream = mediaStream;
        getLocation();
      }
    };

    initializePermissions();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [open, startCamera, getLocation]);

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
    setLocation(null);
    onOpenChange(false);
  }, [stream, onOpenChange]);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Video boyutları
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      // 9:16 crop hesapla (merkezden)
      const targetRatio = 9 / 16;
      const videoRatio = videoWidth / videoHeight;

      let cropWidth, cropHeight, cropX, cropY;

      if (videoRatio > targetRatio) {
        // Video daha geniş, yandan kırp
        cropHeight = videoHeight;
        cropWidth = Math.round(videoHeight * targetRatio);
        cropX = Math.round((videoWidth - cropWidth) / 2);
        cropY = 0;
      } else {
        // Video daha uzun, üstten/alttan kırp
        cropWidth = videoWidth;
        cropHeight = Math.round(videoWidth / targetRatio);
        cropX = 0;
        cropY = Math.round((videoHeight - cropHeight) / 2);
      }

      // Hedef çözünürlük: 1080x1920 (Full HD dikey)
      const outputWidth = 1080;
      const outputHeight = 1920;

      canvas.width = outputWidth;
      canvas.height = outputHeight;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Crop alanını 1080x1920'ye scale et
        ctx.drawImage(
          video,
          cropX, cropY, cropWidth, cropHeight,
          0, 0, outputWidth, outputHeight
        );
        const imageData = canvas.toDataURL("image/jpeg", 1.0);
        setCapturedImage(imageData);
      }
    }
  }, []);

  const retake = useCallback(() => {
    setCapturedImage(null);
  }, []);

  const handleSend = useCallback(() => {
    console.log("=== Fotoğraf ve Konum Bilgisi ===");
    console.log("Konum:", location);
    console.log("Fotoğraf (Base64):", capturedImage?.substring(0, 100) + "...");
    setShowResult(true);
  }, [location, capturedImage]);

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
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

            <div className="relative aspect-[9/16] w-full max-h-[60vh] overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800">
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
              ) : (
                <>
                  <Button
                    onClick={retake}
                    variant="outline"
                    size="lg"
                    className="gap-2 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                  >
                    <RotateCcw className="h-5 w-5" />
                    {t("camera.retake")}
                  </Button>
                  <Button
                    onClick={handleSend}
                    size="lg"
                    className="gap-2 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30"
                  >
                    <Send className="h-5 w-5" />
                    {t("camera.send")}
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
          <div className="relative bg-linear-to-r from-amber-500 via-orange-500 to-amber-600 px-4 sm:px-6 py-3 sm:py-4">
            <DialogHeader className="relative">
              <DialogTitle className="text-white flex items-center gap-2 sm:gap-3 text-base sm:text-lg font-semibold">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                {t("camera.success")}
              </DialogTitle>
              <DialogDescription className="text-amber-100 mt-1 text-sm">
                {t("camera.successDescription")}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
            {capturedImage && (
              <div className="overflow-hidden rounded-xl sm:rounded-2xl border-2 border-amber-200 dark:border-amber-800 max-h-[50vh]">
                <img src={capturedImage} alt="Sent" className="w-full h-full object-contain" />
              </div>
            )}

            <Button
              onClick={() => {
                setShowResult(false);
                handleClose();
              }}
              className="w-full bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            >
              Tamam
            </Button>
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
