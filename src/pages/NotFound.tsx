import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Home as HomeIcon, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.warn("[404] Route not found:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-background px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-3xl font-bold font-display mb-4">
        404
      </div>
      <h1 className="text-lg font-bold font-display text-foreground mb-1">Page not found</h1>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => navigate(-1)}
          className="h-12 px-5 rounded-xl border-2 border-border text-foreground text-sm font-semibold flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <button
          onClick={() => navigate("/home", { replace: true })}
          className="btn-primary px-5 flex items-center gap-2"
        >
          <HomeIcon size={16} /> Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
