import { useState } from "react";
import { UserCog, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { logActivity } from "@/lib/admin-activity";

interface Props {
  changeAdminCredentials: (currentPassword: string, newUsername: string, newPassword: string) => boolean;
}

const AdminCredentialsPanel = ({ changeAdminCredentials }: Props) => {
  const [open, setOpen] = useState(false);
  const [currentPass, setCurrentPass] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);

  const reset = () => {
    setCurrentPass(""); setNewUsername(""); setNewPassword(""); setConfirmPassword("");
  };

  const submit = () => {
    if (!currentPass) { toast.error("Current password is required"); return; }
    if (newPassword && newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }
    if (newPassword && newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    const success = changeAdminCredentials(currentPass, newUsername, newPassword);
    if (success) {
      const parts = [newUsername && "username", newPassword && "password"].filter(Boolean).join(" & ");
      logActivity("admin_credentials_update", `Admin ${parts || "credentials"} updated`);
      toast.success("Credentials updated successfully");
      setOpen(false);
      reset();
    } else {
      toast.error("Current password is incorrect");
    }
  };

  return (
    <div className="border border-border rounded-2xl p-4 bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserCog size={16} className="text-primary" />
          <h3 className="text-sm font-bold text-foreground">Admin Credentials</h3>
        </div>
        <button
          onClick={() => { setOpen(!open); reset(); }}
          className="text-xs text-primary font-semibold"
        >
          {open ? "Cancel" : "Change"}
        </button>
      </div>
      {open ? (
        <div className="mt-3 space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">Current Password</label>
            <div className="relative">
              <input
                type={showPasswords ? "text" : "password"}
                value={currentPass}
                onChange={e => setCurrentPass(e.target.value)}
                placeholder="Enter current password"
                className="w-full h-9 rounded-xl border border-input bg-background px-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground"
              />
              <button type="button" onClick={() => setShowPasswords(!showPasswords)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPasswords ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">New Username (optional)</label>
            <input
              type="text"
              value={newUsername}
              onChange={e => setNewUsername(e.target.value)}
              placeholder="Leave empty to keep current"
              className="w-full h-9 rounded-xl border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">New Password (optional)</label>
            <input
              type={showPasswords ? "text" : "password"}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Leave empty to keep current"
              className="w-full h-9 rounded-xl border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground"
            />
          </div>
          {newPassword && (
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">Confirm New Password</label>
              <input
                type={showPasswords ? "text" : "password"}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full h-9 rounded-xl border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground"
              />
            </div>
          )}
          <button onClick={submit} className="w-full h-10 bg-primary text-primary-foreground rounded-xl text-xs font-bold">
            Update Credentials
          </button>
        </div>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">Change your admin username and password</p>
      )}
    </div>
  );
};

export default AdminCredentialsPanel;
