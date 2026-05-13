import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, MailCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import puzzleLogo from "@/assets/logo.jpeg";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const { signup, user, ready } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && user) navigate(user.isAdmin ? "/admin" : "/home", { replace: true });
  }, [ready, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    const res = await signup(username, email, password);
    setSubmitting(false);
    if (!res.ok) {
      toast.error(res.error || "Signup failed");
      return;
    }
    if (res.needsConfirmation) {
      setSentTo(email);
      toast.success("Confirmation email sent!");
    } else {
      toast.success("Account created!");
      navigate("/home");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="auth-header relative flex flex-col items-center justify-center pt-12 pb-16 px-6 rounded-b-[2rem]">
        <button onClick={() => navigate("/")} className="absolute top-6 left-6 text-primary-foreground">
          <ArrowLeft size={24} />
        </button>
        <motion.img
          src={puzzleLogo}
          alt="MDCAT Smart Prep"
          className="h-28 w-auto max-w-[80%] object-contain"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20, duration: 0.2 }}
        />
      </div>

      <motion.div
        className="flex-1 -mt-6 bg-background rounded-t-[2rem] px-6 pt-10 pb-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.15, delay: 0.05 }}
      >
        {sentTo ? (
          <div className="text-center max-w-sm mx-auto">
            <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <MailCheck className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-extrabold mb-2">Check your inbox</h1>
            <p className="text-muted-foreground mb-6">
              We sent a confirmation link to <span className="font-semibold text-foreground">{sentTo}</span>.
              Click the link in the email to activate your account, then log in.
            </p>
            <Link to="/login" className="btn-primary inline-block px-6">Go to Log in</Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-extrabold text-center mb-8">Create Account</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} className="input-field w-full" required />
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="input-field w-full" required />
              <input type="password" placeholder="Password (min 6 chars)" value={password} onChange={e => setPassword(e.target.value)} className="input-field w-full" minLength={6} required />
              <button type="submit" disabled={submitting} className="btn-primary w-full mt-4 disabled:opacity-60">
                {submitting ? "Creating…" : "Create"}
              </button>
            </form>
            <p className="text-center text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-bold">Log in</Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Signup;
