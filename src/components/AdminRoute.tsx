import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";

/** Route guard: redirects non-admin users to /home, unauthenticated to /admin/login */
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, ready } = useAuth();

  if (!ready) {
    return (
      <div className="h-dvh bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }
  if (!user) return <Navigate to="/admin/login" replace />;
  if (!user.isAdmin) return <Navigate to="/home" replace />;
  return <>{children}</>;
};

export default AdminRoute;
