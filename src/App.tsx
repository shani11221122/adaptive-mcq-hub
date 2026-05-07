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
import ViewAnswers from "./pages/ViewAnswers";
import History from "./pages/History";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Rules from "./pages/Rules";
import MockTest from "./pages/MockTest";
import AdminLogin from "./pages/AdminLogin";
import NotFound from "./pages/NotFound";

// Lazy-load admin (Recharts + heavy panel) so user bundle stays small.
const Admin = lazy(() => import("./pages/Admin"));

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div className="h-dvh bg-background flex items-center justify-center">
    <p className="text-sm text-muted-foreground">Loading…</p>
  </div>
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
      <Route path="/result/answers" element={<ViewAnswers />} />
      <Route path="/history" element={<History />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/rules" element={<Rules />} />
      <Route path="/mock-test" element={<MockTest />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <Suspense fallback={<RouteFallback />}>
              <Admin />
            </Suspense>
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
