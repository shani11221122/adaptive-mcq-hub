import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import AdminRoute from "@/components/AdminRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import { usePresenceHeartbeat } from "@/hooks/use-presence-heartbeat";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import QuizSelect from "./pages/QuizSelect";
import QuizPlay from "./pages/QuizPlay";
import Result from "./pages/Result";
import AdminLogin from "./pages/AdminLogin";
import NotFound from "./pages/NotFound";

// Lazy-load admin (Recharts + heavy panel) so user bundle stays small.
const Admin = lazy(() => import("./pages/Admin"));
const MockTest = lazy(() => import("./pages/MockTest"));
const ViewAnswers = lazy(() => import("./pages/ViewAnswers"));
const History = lazy(() => import("./pages/History"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Settings = lazy(() => import("./pages/Settings"));
const Rules = lazy(() => import("./pages/Rules"));

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div className="h-dvh bg-background flex items-center justify-center">
    <p className="text-sm text-muted-foreground">Loading…</p>
  </div>
);

const Lazy = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<RouteFallback />}>{children}</Suspense>
);

const AppRoutes = () => {
  usePresenceHeartbeat();
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/home" element={<Home />} />
      <Route path="/quiz" element={<QuizSelect />} />
      <Route path="/quiz/:subjectId" element={<QuizPlay />} />
      <Route path="/result" element={<Result />} />
      <Route path="/result/answers" element={<Lazy><ViewAnswers /></Lazy>} />
      <Route path="/history" element={<Lazy><History /></Lazy>} />
      <Route path="/dashboard" element={<Lazy><Dashboard /></Lazy>} />
      <Route path="/settings" element={<Lazy><Settings /></Lazy>} />
      <Route path="/rules" element={<Lazy><Rules /></Lazy>} />
      <Route path="/mock-test" element={<Lazy><MockTest /></Lazy>} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <Lazy><Admin /></Lazy>
          </AdminRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
