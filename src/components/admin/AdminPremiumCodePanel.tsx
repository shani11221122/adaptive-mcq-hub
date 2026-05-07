import { useState } from "react";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";
import { getPremiumCode, setPremiumCode } from "@/lib/auth-context";
import { logActivity } from "@/lib/admin-activity";

const AdminPremiumCodePanel = () => {
  const [premiumCode, setPremiumCodeState] = useState(getPremiumCode());
  const [editing, setEditing] = useState(false);

  const save = () => {
    setPremiumCode(premiumCode);
    setEditing(false);
    logActivity("premium_code_update", "Premium unlock code updated");
    toast.success("Code updated");
  };

  return (
    <div className="border border-border rounded-2xl p-4 bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <KeyRound size={16} className="text-primary" />
          <h3 className="text-sm font-bold text-foreground">Premium Unlock Code</h3>
        </div>
        <button onClick={() => setEditing(!editing)} className="text-xs text-primary font-semibold">
          {editing ? "Cancel" : "Edit"}
        </button>
      </div>
      {editing ? (
        <div className="flex gap-2 mt-3">
          <input
            value={premiumCode}
            onChange={e => setPremiumCodeState(e.target.value)}
            className="flex-1 h-9 rounded-xl border border-input bg-background px-3 text-sm font-mono uppercase text-foreground"
          />
          <button onClick={save} className="h-9 px-4 bg-primary text-primary-foreground rounded-xl text-xs font-bold">
            Save
          </button>
        </div>
      ) : (
        <p className="mt-2 text-sm font-mono tracking-wider text-muted-foreground">{premiumCode}</p>
      )}
    </div>
  );
};

export default AdminPremiumCodePanel;
