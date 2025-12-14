import { useState } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import {
  Lock,
  Smartphone,
  Monitor,
  AlertTriangle,
  Trash2,
  Eye,
  EyeOff,
  LogOut,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shacdn/card";
import { Button } from "@/components/shacdn/button";
import { Input } from "@/components/shacdn/input";
import { Label } from "@/components/shacdn/label";
import { Badge } from "@/components/shacdn/badge";
import { Separator } from "@/components/shacdn/separator";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shacdn/dialog";
import { formatRelativeTime } from "@/utils/locale";

const ProfileSecurity = ({ sessions }) => {
  const { t } = useTranslation();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordChange = (field, value) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    // Handle password change - will be connected to API later
    console.log("Password change submitted");
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleEndSession = (sessionId) => {
    // Handle session termination - will be connected to API later
    console.log("End session:", sessionId);
  };

  const handleDeleteAccount = () => {
    // Handle account deletion - will be connected to API later
    console.log("Delete account");
    setDeleteDialogOpen(false);
  };

  const getDeviceIcon = (device) => {
    if (
      device.toLowerCase().includes("iphone") ||
      device.toLowerCase().includes("android")
    ) {
      return Smartphone;
    }
    return Monitor;
  };

  return (
    <div className="space-y-6">
      {/* Password Change Card */}
      <Card className="border-2 border-amber-200 dark:border-amber-900/50 bg-white/95 dark:bg-zinc-900/95">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <CardTitle className="text-amber-700 dark:text-amber-400">
                {t("profile.security.changePassword")}
              </CardTitle>
              <CardDescription className="dark:text-amber-500/70">
                {t("profile.security.changePasswordDesc")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {/* Current Password */}
            <div className="space-y-2">
              <Label className="text-amber-700 dark:text-amber-400">
                {t("profile.security.currentPassword")}
              </Label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    handlePasswordChange("currentPassword", e.target.value)
                  }
                  className="border-amber-200 dark:border-amber-800 dark:bg-zinc-800 dark:text-white dark:placeholder:text-amber-500/50 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label className="text-amber-700 dark:text-amber-400">
                {t("profile.security.newPassword")}
              </Label>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    handlePasswordChange("newPassword", e.target.value)
                  }
                  className="border-amber-200 dark:border-amber-800 dark:bg-zinc-800 dark:text-white dark:placeholder:text-amber-500/50 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label className="text-amber-700 dark:text-amber-400">
                {t("profile.security.confirmPassword")}
              </Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    handlePasswordChange("confirmPassword", e.target.value)
                  }
                  className="border-amber-200 dark:border-amber-800 dark:bg-zinc-800 dark:text-white dark:placeholder:text-amber-500/50 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            >
              {t("profile.security.updatePassword")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card className="border-2 border-amber-200 dark:border-amber-900/50 bg-white/95 dark:bg-zinc-900/95">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-amber-700 dark:text-amber-400">
                  {t("profile.security.twoFactor")}
                </CardTitle>
                <CardDescription className="dark:text-amber-500/70">
                  {t("profile.security.twoFactorDesc")}
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={setTwoFactorEnabled}
              className="data-[state=checked]:bg-amber-500"
            />
          </div>
        </CardHeader>
        {twoFactorEnabled && (
          <CardContent>
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 text-center">
              <p className="text-amber-700 dark:text-amber-400 text-sm mb-2">
                {t("profile.security.twoFactorSetup")}
              </p>
              {/* Placeholder for QR code */}
              <div className="h-32 w-32 mx-auto bg-white dark:bg-zinc-800 rounded-lg flex items-center justify-center border-2 border-dashed border-amber-300 dark:border-amber-700">
                <span className="text-amber-400 text-xs">QR Code</span>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Active Sessions */}
      <Card className="border-2 border-amber-200 dark:border-amber-900/50 bg-white/95 dark:bg-zinc-900/95">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Monitor className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <CardTitle className="text-amber-700 dark:text-amber-400">
                {t("profile.security.activeSessions")}
              </CardTitle>
              <CardDescription className="dark:text-amber-500/70">
                {t("profile.security.activeSessionsDesc")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {sessions.map((session) => {
            const DeviceIcon = getDeviceIcon(session.device);
            return (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20"
              >
                <div className="flex items-center gap-4">
                  <DeviceIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-amber-900 dark:text-amber-200">
                        {session.device}
                      </span>
                      {session.current && (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          {t("profile.security.currentSession")}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-amber-600 dark:text-amber-500">
                      {session.location} •{" "}
                      {formatRelativeTime(session.lastActive, t)}
                    </p>
                  </div>
                </div>
                {!session.current && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEndSession(session.id)}
                    className="text-amber-600 hover:text-amber-800 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/30"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {t("profile.security.endSession")}
                  </Button>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-2 border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <CardTitle className="text-red-700 dark:text-red-400">
                {t("profile.security.dangerZone")}
              </CardTitle>
              <CardDescription className="text-red-500/70 dark:text-red-500/70">
                {t("profile.security.dangerZoneDesc")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Alert
            variant="destructive"
            className="bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800"
          >
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="text-red-700 dark:text-red-400">
              {t("profile.security.deleteAccount")}
            </AlertTitle>
            <AlertDescription className="text-red-600 dark:text-red-500">
              {t("profile.security.deleteWarning")}
            </AlertDescription>
          </Alert>

          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                className="mt-4 bg-red-500 hover:bg-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t("profile.security.deleteAccount")}
              </Button>
            </DialogTrigger>
            <DialogContent
              showCloseButton={false}
              className="sm:max-w-md max-w-[95vw] p-0 overflow-hidden bg-white dark:bg-zinc-900 border-red-200 dark:border-red-900/50"
            >
              {/* Gradient Header */}
              <div className="relative bg-gradient-to-r from-red-500 via-rose-500 to-red-600 px-6 py-4">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2230%22%20height%3D%2230%22%20viewBox%3D%220%200%2030%2030%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M0%2010h10v10H0z%22%20fill%3D%22%23fff%22%20fill-opacity%3D%22.05%22%2F%3E%3C%2Fsvg%3E')] opacity-50" />
                <DialogHeader className="relative">
                  <DialogTitle className="text-white flex items-center gap-3 text-lg font-semibold">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    {t("profile.security.deleteAccount")}
                  </DialogTitle>
                  <DialogDescription className="text-red-100 mt-1">
                    {t("profile.security.deleteConfirmTitle")}
                  </DialogDescription>
                </DialogHeader>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Warning Box */}
                <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/50 mb-6">
                  <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {t("profile.security.deleteConfirmDesc")}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col-reverse sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteDialogOpen(false)}
                    className="flex-1 h-11 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    className="flex-1 h-11 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white shadow-lg shadow-red-500/30"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t("profile.security.confirmDelete")}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};

ProfileSecurity.propTypes = {
  sessions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      device: PropTypes.string.isRequired,
      location: PropTypes.string.isRequired,
      lastActive: PropTypes.string.isRequired,
      current: PropTypes.bool,
    })
  ).isRequired,
};

export default ProfileSecurity;
