import { useState, useRef, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
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
  RotateCcw,
  Loader2,
  X,
  SwitchCamera,
  Image,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Upload,
  Coffee,
  Clock,
} from "lucide-react";
import { createReceiptConnection, disconnectFromCafe } from "@/services/signalRService";
import { initReceipt, uploadReceiptFile, completeReceipt } from "@/endpoints/receipt/ReceiptAPI";
import { setCafeSession, clearCafeSession } from "@/slice/KDSlice";
import {
  saveCafeSession,
  loadCafeSession,
  clearCafeSession as clearStoredSession,
  isSessionExpired,
  getSessionTimeRemaining,
} from "@/services/cafeStorageService";
import { toast } from "react-toastify";

// Constants
const CAFE_ID = 1;
const DEFAULT_LAT = 41.0082;
const DEFAULT_LNG = 28.9784;

export function CameraModal({ open, onOpenChange, extendMode = false }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Check for existing active session
  const cafeState = useSelector((state) => state.kahvedostumslice?.cafe || {});

  // Step management - added 'activeSession' step for warning dialog
  const [step, setStep] = useState("select"); // 'select' | 'activeSession' | 'camera' | 'preview' | 'processing' | 'error'
  const [inputMethod, setInputMethod] = useState(null); // 'camera' | 'file'
  const [activeSession, setActiveSession] = useState(null); // Stores existing session info

  // Camera states
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState("environment");
  const [cameraLoading, setCameraLoading] = useState(false);

  // Image states
  const [capturedImage, setCapturedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  // Processing states
  const [processingStatus, setProcessingStatus] = useState(null);
  const [error, setError] = useState(null);

  // SignalR connection ref
  const connectionRef = useRef(null);
  const receiptDataRef = useRef(null);

  // Check for active session when modal opens
  useEffect(() => {
    if (open) {
      // extendMode: Skip active session warning, go directly to select
      // User is already in CafeHub and wants to extend time
      if (extendMode) {
        // Store current session for reference but don't show warning
        const currentSession = cafeState.cafeId && cafeState.expiresAt
          ? { cafeId: cafeState.cafeId, channelKey: cafeState.channelKey, expiresAt: cafeState.expiresAt }
          : loadCafeSession();
        setActiveSession(currentSession);
        setStep("select");
        return;
      }

      // Check Redux state first
      if (cafeState.cafeId && cafeState.expiresAt && !isSessionExpired({ expiresAt: cafeState.expiresAt })) {
        setActiveSession({
          cafeId: cafeState.cafeId,
          channelKey: cafeState.channelKey,
          expiresAt: cafeState.expiresAt,
        });
        setStep("activeSession");
        return;
      }

      // Then check localStorage
      const storedSession = loadCafeSession();
      if (storedSession && !isSessionExpired(storedSession)) {
        setActiveSession(storedSession);
        setStep("activeSession");
        return;
      }

      // No active session, show normal select screen
      setStep("select");
      setActiveSession(null);
    }
  }, [open, cafeState, extendMode]);

  // Handle "Return to Cafe" action
  const handleReturnToCafe = useCallback(() => {
    if (activeSession) {
      onOpenChange(false);
      navigate(`/cafe/${activeSession.channelKey}`, {
        state: activeSession,
      });
    }
  }, [activeSession, navigate, onOpenChange]);

  // Handle "Start New Receipt" action
  const handleStartNewReceipt = useCallback(async () => {
    // Clear existing session
    dispatch(clearCafeSession());
    clearStoredSession();
    await disconnectFromCafe();

    // Reset state and go to select
    setActiveSession(null);
    setStep("select");
  }, [dispatch]);

  // Start camera
  const startCamera = useCallback(
    async (mode = facingMode) => {
      setCameraLoading(true);
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
        setCameraLoading(false);
      }
    },
    [t, facingMode]
  );

  // Stop camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Switch camera
  const switchCamera = useCallback(async () => {
    stopCamera();
    const newMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newMode);
    await startCamera(newMode);
  }, [facingMode, startCamera, stopCamera]);

  // Attach stream to video element
  useEffect(() => {
    if (stream && videoRef.current && step === "camera") {
      videoRef.current.srcObject = stream;
    }
  }, [stream, step]);

  // Handle input method selection
  const handleSelectCamera = useCallback(async () => {
    setInputMethod("camera");
    setStep("camera");
    await startCamera();
  }, [startCamera]);

  const handleSelectFile = useCallback(() => {
    setInputMethod("file");
    fileInputRef.current?.click();
  }, []);

  // Handle file selection from gallery
  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError(t("camera.errors.invalidFileType"));
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError(t("camera.errors.fileTooLarge"));
        return;
      }

      setImageFile(file);

      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedImage(event.target.result);
        setStep("preview");
      };
      reader.readAsDataURL(file);
    }
    // Reset file input
    e.target.value = "";
  }, [t]);

  // Capture photo from camera
  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL("image/jpeg", 0.9);
        setCapturedImage(imageData);

        // Convert to blob for upload
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], "receipt.jpg", { type: "image/jpeg" });
              setImageFile(file);
            }
          },
          "image/jpeg",
          0.9
        );

        stopCamera();
        setStep("preview");
      }
    }
  }, [stopCamera]);

  // Retake photo
  const retake = useCallback(async () => {
    setCapturedImage(null);
    setImageFile(null);
    setError(null);
    setProcessingStatus(null);

    if (inputMethod === "camera") {
      setStep("camera");
      await startCamera();
    } else {
      setStep("select");
      setInputMethod(null);
    }
  }, [inputMethod, startCamera]);

  // Handle SignalR status change
  const handleStatusChange = useCallback(
    (msg) => {
      console.log("ReceiptStatusChanged:", msg);

      // Backend status field'ı göndermiyorsa, expiresAt varlığını kontrol et
      const isSuccess = msg.status === "DONE" || msg.expiresAt;
      const isFailed = msg.status === "FAILED" || msg.rejectReason;

      setProcessingStatus(isSuccess ? "DONE" : (isFailed ? "FAILED" : msg.status));

      if (isSuccess) {
        // Success
        toast.success(extendMode ? t("camera.processing.timeExtended") : t("camera.processing.done"));

        // Stop Receipt SignalR connection (not Cafe connection!)
        connectionRef.current?.stop();
        connectionRef.current = null;

        // Prepare session data - Backend'den gelen cafeId varsa onu kullan
        // extendMode'da mevcut channelKey'i kullan
        const channelKey = extendMode && activeSession?.channelKey
          ? activeSession.channelKey
          : receiptDataRef.current?.channelKey;

        // Backend expiresAt göndermezse varsayılan 1 saat hesapla
        const defaultExpiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

        const sessionData = {
          receiptId: msg.receiptId || receiptDataRef.current?.receiptId,
          expiresAt: msg.expiresAt || defaultExpiresAt,
          cafeId: msg.cafeId || (extendMode && activeSession?.cafeId) || CAFE_ID,
          channelKey: channelKey,
        };

        // Save session to localStorage with verification
        const saveResult = saveCafeSession(sessionData);
        console.log("CameraModal: Session save result:", saveResult, sessionData);
        if (!saveResult) {
          console.error("CameraModal: Failed to save session to localStorage");
        }

        // Save session to Redux
        dispatch(setCafeSession(sessionData));

        // Close modal
        onOpenChange(false);

        // extendMode: Don't navigate, user is already in CafeHub
        // Cafe SignalR connection is preserved, only session time is updated
        if (!extendMode) {
          navigate(`/cafe/${channelKey}`, {
            state: sessionData,
          });
        }
      } else if (isFailed) {
        setError(msg.rejectReason || t("camera.processing.failed"));
        setStep("error");
        toast.error(msg.rejectReason || t("camera.processing.failed"));
      }
    },
    [navigate, onOpenChange, t, dispatch, extendMode, activeSession]
  );

  // Start receipt processing
  const startReceiptProcess = useCallback(async () => {
    if (!imageFile) return;

    setStep("processing");
    setProcessingStatus("INIT");
    setError(null);

    try {
      // 1. Init receipt
      console.log("1. Initializing receipt...");
      const initData = await initReceipt(CAFE_ID, DEFAULT_LAT, DEFAULT_LNG);
      const { receiptId, channelKey, uploadUrl, bucket, objectKey } = initData;
      receiptDataRef.current = initData;

      console.log("Receipt initialized:", { receiptId, channelKey });

      // 2. Connect SignalR (token dinamik olarak alınacak)
      console.log("2. Connecting to SignalR...");
      const connection = createReceiptConnection();

      connection.on("ReceiptStatusChanged", handleStatusChange);

      connection.onclose((error) => {
        console.log("SignalR connection closed:", error);
      });

      connection.onreconnecting((error) => {
        console.log("SignalR reconnecting:", error);
      });

      await connection.start();
      console.log("SignalR connected");

      // 3. Join receipt channel
      await connection.invoke("JoinReceipt", channelKey.toString());
      console.log("Joined receipt channel:", channelKey);

      connectionRef.current = connection;

      // 4. Upload file
      setProcessingStatus("UPLOADING");
      console.log("3. Uploading file to:", uploadUrl);
      await uploadReceiptFile(uploadUrl, imageFile);
      console.log("File uploaded successfully");

      // 5. Complete receipt
      setProcessingStatus("PROCESSING");
      console.log("4. Completing receipt...");
      await completeReceipt(receiptId, bucket, objectKey);
      console.log("Receipt complete called, waiting for SignalR response...");

      // Status updates will come from SignalR
    } catch (err) {
      console.error("Receipt processing error:", err);
      setError(err.message || t("camera.errors.processingFailed"));
      setStep("error");
      toast.error(err.message || t("camera.errors.processingFailed"));

      // Cleanup SignalR connection
      if (connectionRef.current) {
        connectionRef.current.stop();
        connectionRef.current = null;
      }
    }
  }, [imageFile, handleStatusChange, t]);

  // Close modal and cleanup
  const handleClose = useCallback(() => {
    stopCamera();
    setCapturedImage(null);
    setImageFile(null);
    setError(null);
    setStep("select");
    setInputMethod(null);
    setProcessingStatus(null);

    if (connectionRef.current) {
      connectionRef.current.stop();
      connectionRef.current = null;
    }

    onOpenChange(false);
  }, [stopCamera, onOpenChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (connectionRef.current) {
        connectionRef.current.stop();
        connectionRef.current = null;
      }
    };
  }, [stopCamera]);

  // Get processing status text
  const getProcessingText = () => {
    switch (processingStatus) {
      case "INIT":
        return t("camera.processing.init");
      case "UPLOADING":
        return t("camera.processing.uploading");
      case "PROCESSING":
        return t("camera.processing.processing");
      default:
        return t("camera.processing.processing");
    }
  };

  // Render active session warning dialog
  const renderActiveSessionWarning = () => {
    if (!activeSession) return null;

    const timeRemaining = getSessionTimeRemaining(activeSession);
    const formatTime = (time) => {
      if (!time || time.expired) return "00:00";
      return `${String(time.minutes).padStart(2, "0")}:${String(time.seconds).padStart(2, "0")}`;
    };

    return (
      <Dialog open={open && step === "activeSession"} onOpenChange={(isOpen) => !isOpen && handleClose()}>
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
                  <Coffee className="h-5 w-5" />
                </div>
                {t("camera.activeSession.title")}
              </DialogTitle>
              <DialogDescription className="text-amber-100 mt-1">
                {t("camera.activeSession.description")}
              </DialogDescription>
            </DialogHeader>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 rounded-full p-1.5 text-white/80 hover:text-white hover:bg-white/20 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 space-y-4">
            {/* Time remaining indicator */}
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="text-sm text-amber-700 dark:text-amber-300">{t("camera.activeSession.timeRemaining")}</p>
                <p className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
                  {formatTime(timeRemaining)}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleReturnToCafe}
                size="lg"
                className="w-full gap-2 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30"
              >
                <Coffee className="h-5 w-5" />
                {t("camera.activeSession.returnToCafe")}
              </Button>
              <Button
                onClick={handleStartNewReceipt}
                variant="outline"
                size="lg"
                className="w-full gap-2 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Camera className="h-5 w-5" />
                {t("camera.activeSession.newReceipt")}
              </Button>
            </div>

            {/* Warning note */}
            <p className="text-xs text-center text-zinc-500 dark:text-zinc-400">
              {t("camera.activeSession.warning")}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Render select method dialog
  const renderSelectMethod = () => (
    <Dialog open={open && step === "select"} onOpenChange={(isOpen) => !isOpen && handleClose()}>
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
              {t("camera.selectMethod.title")}
            </DialogTitle>
            <DialogDescription className="text-amber-100 mt-1">
              {t("camera.selectMethod.description")}
            </DialogDescription>
          </DialogHeader>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-full p-1.5 text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Selection Options */}
        <div className="p-4 sm:p-6 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Take Photo Option */}
            <button
              onClick={handleSelectCamera}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-amber-50 dark:bg-zinc-800 border-2 border-amber-200 dark:border-amber-800 hover:border-amber-400 dark:hover:border-amber-600 transition-all hover:shadow-lg group"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 group-hover:bg-amber-200 dark:group-hover:bg-amber-800/50 transition-colors">
                <Camera className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-amber-900 dark:text-amber-100">
                  {t("camera.selectMethod.takePhoto")}
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  {t("camera.selectMethod.takePhotoDesc")}
                </p>
              </div>
            </button>

            {/* Select from Gallery Option */}
            <button
              onClick={handleSelectFile}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 hover:border-amber-400 dark:hover:border-amber-600 transition-all hover:shadow-lg group"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-700 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30 transition-colors">
                <Image className="h-8 w-8 text-zinc-600 dark:text-zinc-400 group-hover:text-amber-600 dark:group-hover:text-amber-400" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {t("camera.selectMethod.selectPhoto")}
                </p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                  {t("camera.selectMethod.selectPhotoDesc")}
                </p>
              </div>
            </button>
          </div>

          {/* Privacy note */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
            <ShieldCheck className="h-5 w-5 text-zinc-600 dark:text-zinc-400 mt-0.5 shrink-0" />
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              {t("camera.confirm.privacyNote")}
            </p>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
      </DialogContent>
    </Dialog>
  );

  // Render camera dialog
  const renderCamera = () => (
    <Dialog open={open && step === "camera"} onOpenChange={(isOpen) => !isOpen && handleClose()}>
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
            onClick={handleClose}
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

          <div className="relative w-full aspect-4/3 overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800">
            {/* Corner Markers */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-amber-500 rounded-tl-lg z-10" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-amber-500 rounded-tr-lg z-10" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-amber-500 rounded-bl-lg z-10" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-amber-500 rounded-br-lg z-10" />

            {/* Camera Switch Button */}
            {stream && !cameraLoading && (
              <button
                onClick={switchCamera}
                className="absolute top-3 right-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-all hover:bg-black/70 hover:scale-110"
                aria-label={t("camera.switchCamera")}
              >
                <SwitchCamera className="h-5 w-5" />
              </button>
            )}

            {cameraLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                <span className="text-xs text-amber-700 dark:text-amber-300">
                  {t("camera.loading")}
                </span>
              </div>
            )}

            {!stream && !cameraLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700">
                  <Camera className="h-8 w-8 text-zinc-400 dark:text-zinc-500" />
                </div>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {t("camera.errors.notAccessible")}
                </span>
              </div>
            )}

            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />

            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="flex justify-center gap-3">
            <Button
              onClick={() => {
                stopCamera();
                setStep("select");
                setInputMethod(null);
              }}
              variant="outline"
              size="lg"
              className="gap-2 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20"
            >
              <RotateCcw className="h-5 w-5" />
              {t("camera.back")}
            </Button>
            <Button
              onClick={capturePhoto}
              disabled={!stream || cameraLoading}
              size="lg"
              className="gap-2 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30"
            >
              <Camera className="h-5 w-5" />
              {t("camera.capture")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Render preview dialog
  const renderPreview = () => (
    <Dialog open={open && step === "preview"} onOpenChange={(isOpen) => !isOpen && handleClose()}>
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
                <CheckCircle2 className="h-5 w-5" />
              </div>
              {t("camera.preview.title")}
            </DialogTitle>
            <DialogDescription className="text-amber-100 mt-1">
              {t("camera.preview.description")}
            </DialogDescription>
          </DialogHeader>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-full p-1.5 text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          <div className="relative w-full max-h-[50vh] overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800 border-2 border-amber-200 dark:border-amber-800">
            {capturedImage && (
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-full object-contain"
              />
            )}
          </div>

          <div className="flex justify-center gap-3">
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
              onClick={startReceiptProcess}
              size="lg"
              className="gap-2 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30"
            >
              <Upload className="h-5 w-5" />
              {t("camera.submit")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Render processing dialog
  const renderProcessing = () => (
    <Dialog open={open && step === "processing"} onOpenChange={() => {}}>
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
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
              {t("camera.processing.title")}
            </DialogTitle>
            <DialogDescription className="text-amber-100 mt-1">
              {getProcessingText()}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Progress indicators */}
          <div className="space-y-3">
            <ProcessingStep
              label={t("camera.processing.init")}
              status={processingStatus === "INIT" ? "active" : processingStatus ? "done" : "pending"}
            />
            <ProcessingStep
              label={t("camera.processing.uploading")}
              status={
                processingStatus === "UPLOADING"
                  ? "active"
                  : processingStatus === "PROCESSING"
                  ? "done"
                  : "pending"
              }
            />
            <ProcessingStep
              label={t("camera.processing.processing")}
              status={processingStatus === "PROCESSING" ? "active" : "pending"}
            />
          </div>

          {/* Preview image */}
          {capturedImage && (
            <div className="overflow-hidden rounded-xl border-2 border-amber-200 dark:border-amber-800 max-h-[30vh]">
              <img src={capturedImage} alt="Receipt" className="w-full h-full object-contain" />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  // Render error dialog
  const renderError = () => (
    <Dialog open={open && step === "error"} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-sm max-w-[95vw] p-0 overflow-hidden bg-white dark:bg-zinc-900 border-red-200 dark:border-red-800"
      >
        {/* Gradient Header */}
        <div className="relative bg-linear-to-r from-red-500 via-rose-500 to-red-600 px-4 sm:px-6 py-3 sm:py-4">
          <DialogHeader className="relative">
            <DialogTitle className="text-white flex items-center gap-2 sm:gap-3 text-base sm:text-lg font-semibold">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              {t("camera.error.title")}
            </DialogTitle>
            <DialogDescription className="text-red-100 mt-1">
              {error || t("camera.error.description")}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          <div className="flex gap-3">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300"
            >
              {t("camera.error.cancel")}
            </Button>
            <Button
              onClick={retake}
              className="flex-1 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            >
              {t("camera.error.tryAgain")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      {renderActiveSessionWarning()}
      {renderSelectMethod()}
      {renderCamera()}
      {renderPreview()}
      {renderProcessing()}
      {renderError()}
    </>
  );
}

// Processing step component
function ProcessingStep({ label, status }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-6 w-6 items-center justify-center rounded-full ${
          status === "active"
            ? "bg-amber-500"
            : status === "done"
            ? "bg-green-500"
            : "bg-zinc-300 dark:bg-zinc-600"
        }`}
      >
        {status === "active" ? (
          <Loader2 className="h-4 w-4 text-white animate-spin" />
        ) : status === "done" ? (
          <CheckCircle2 className="h-4 w-4 text-white" />
        ) : (
          <div className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-500" />
        )}
      </div>
      <span
        className={`text-sm ${
          status === "active"
            ? "text-amber-700 dark:text-amber-300 font-medium"
            : status === "done"
            ? "text-green-700 dark:text-green-400"
            : "text-zinc-500 dark:text-zinc-400"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

ProcessingStep.propTypes = {
  label: PropTypes.string.isRequired,
  status: PropTypes.oneOf(["pending", "active", "done"]).isRequired,
};

CameraModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  extendMode: PropTypes.bool, // true when extending time from CafeHub (preserves SignalR connection)
};

export default CameraModal;
