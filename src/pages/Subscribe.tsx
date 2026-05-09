import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Crown, Loader2, Smartphone, Wallet, Building2, CreditCard, Copy, ShieldCheck } from "lucide-react";
import confetti from "canvas-confetti";
import PageShell from "@/components/PageShell";
import { useAuth } from "@/lib/auth-context";
import { saveSubscription } from "@/lib/indexeddb";
import { toast } from "sonner";

type Method = "jazzcash" | "easypaisa" | "bank" | "card";
type Step = "method" | "form" | "processing" | "success";

const PLAN_PRICE = 499; // PKR
const PLAN_DAYS = 30;
const PLAN_NAME = "Premium Monthly";

const methods: { id: Method; label: string; desc: string; icon: any; color: string }[] = [
  { id: "jazzcash", label: "JazzCash", desc: "Mobile wallet", icon: Smartphone, color: "from-rose-500/20 to-rose-500/5" },
  { id: "easypaisa", label: "EasyPaisa", desc: "Mobile wallet", icon: Wallet, color: "from-emerald-500/20 to-emerald-500/5" },
  { id: "bank", label: "Bank Transfer", desc: "IBAN / Account", icon: Building2, color: "from-blue-500/20 to-blue-500/5" },
  { id: "card", label: "Credit / Debit Card", desc: "Visa, Master, UnionPay", icon: CreditCard, color: "from-violet-500/20 to-violet-500/5" },
];

const FAKE_BANK = {
  bank: "MDCAT Demo Bank",
  account: "0123-4567-8910-1112",
  iban: "PK36DEMO0000001234567890",
  title: "MDCAT Prep (Pvt) Ltd",
};

function isValidPhonePK(p: string) {
  const digits = p.replace(/\D/g, "");
  return /^03\d{9}$/.test(digits);
}
function luhn(num: string) {
  const s = num.replace(/\s|-/g, "");
  if (!/^\d{12,19}$/.test(s)) return false;
  let sum = 0, alt = false;
  for (let i = s.length - 1; i >= 0; i--) {
    let n = parseInt(s[i], 10);
    if (alt) { n *= 2; if (n > 9) n -= 9; }
    sum += n; alt = !alt;
  }
  return sum % 10 === 0;
}
function formatCard(v: string) {
  return v.replace(/\D/g, "").slice(0, 19).replace(/(.{4})/g, "$1 ").trim();
}
function formatExpiry(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 4);
  if (d.length < 3) return d;
  return d.slice(0, 2) + "/" + d.slice(2);
}

const Subscribe = () => {
  const navigate = useNavigate();
  const { user, ready, activatePremium } = useAuth();

  const [step, setStep] = useState<Step>("method");
  const [method, setMethod] = useState<Method | null>(null);

  // form state
  const [phone, setPhone] = useState("");
  const [txnRef, setTxnRef] = useState("");
  const [cardNum, setCardNum] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");

  useEffect(() => {
    if (ready && !user) navigate("/login", { replace: true });
  }, [ready, user, navigate]);

  useEffect(() => {
    if (step === "success") {
      const end = Date.now() + 1200;
      const tick = () => {
        confetti({ particleCount: 50, spread: 70, startVelocity: 35, origin: { y: 0.6 } });
        if (Date.now() < end) requestAnimationFrame(tick);
      };
      tick();
    }
  }, [step]);

  const formValid = useMemo(() => {
    if (method === "jazzcash" || method === "easypaisa") return isValidPhonePK(phone);
    if (method === "bank") return txnRef.trim().length >= 6;
    if (method === "card") {
      const exp = cardExp.split("/");
      const mm = parseInt(exp[0] || "0", 10);
      const yy = parseInt(exp[1] || "0", 10);
      const validExp = mm >= 1 && mm <= 12 && yy >= 25 && yy <= 60;
      return luhn(cardNum) && validExp && /^\d{3,4}$/.test(cardCvv) && cardName.trim().length >= 2;
    }
    return false;
  }, [method, phone, txnRef, cardNum, cardExp, cardCvv, cardName]);

  const handlePay = async () => {
    if (!formValid || !method || !user) return;
    setStep("processing");
    await new Promise((r) => setTimeout(r, 2200));

    const start = Date.now();
    const expiry = start + PLAN_DAYS * 24 * 60 * 60 * 1000;
    const reference =
      method === "bank" ? txnRef.trim() :
      method === "card" ? "CARD-" + cardNum.replace(/\s/g, "").slice(-4) :
      "WALLET-" + phone.replace(/\D/g, "").slice(-4);

    try {
      await saveSubscription({
        username: user.username,
        isPremium: true,
        plan: PLAN_NAME,
        method,
        reference,
        amount: PLAN_PRICE,
        startDate: start,
        expiryDate: expiry,
        updatedAt: start,
      });
    } catch (e) {
      console.error("saveSubscription failed", e);
    }
    activatePremium(PLAN_NAME);
    setStep("success");
  };

  const copyText = (text: string, label: string) => {
    navigator.clipboard?.writeText(text).then(() => toast.success(`${label} copied`));
  };

  const goBack = () => {
    if (step === "form") { setStep("method"); setMethod(null); return; }
    if (step === "method") { navigate(-1); return; }
  };

  return (
    <PageShell>
      <div className="px-5 pt-12 pb-28 max-w-xl mx-auto">
        {step !== "success" && step !== "processing" && (
          <div className="flex items-center gap-3 mb-6">
            <button onClick={goBack} className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center">
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-xl font-bold font-display">Go Premium</h1>
          </div>
        )}

        {step === "method" && (
          <>
            <div className="glass-card p-5 mb-5 bg-gradient-to-br from-primary/15 to-primary/5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-11 h-11 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Crown size={22} className="text-primary" />
                </div>
                <div>
                  <p className="text-base font-bold text-foreground">{PLAN_NAME}</p>
                  <p className="text-xs text-muted-foreground">{PLAN_DAYS} days · Mock tests + analytics</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-2xl font-extrabold text-foreground">Rs {PLAN_PRICE}</p>
                  <p className="text-[10px] text-muted-foreground">one-time</p>
                </div>
              </div>
              <ul className="text-xs text-foreground/80 space-y-1.5 mt-3">
                <li className="flex gap-2"><Check size={14} className="text-primary mt-0.5" /> Unlimited mock tests (50 MCQs each)</li>
                <li className="flex gap-2"><Check size={14} className="text-primary mt-0.5" /> Advanced performance analytics</li>
                <li className="flex gap-2"><Check size={14} className="text-primary mt-0.5" /> Priority question bank updates</li>
              </ul>
            </div>

            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">Choose payment method</h2>
            <div className="grid gap-3">
              {methods.map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => { setMethod(m.id); setStep("form"); }}
                    className={`glass-card p-4 flex items-center gap-3 text-left active:scale-[0.99] transition-transform bg-gradient-to-br ${m.color}`}
                  >
                    <div className="w-11 h-11 rounded-xl bg-background/60 border border-border flex items-center justify-center shrink-0">
                      <Icon size={20} className="text-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{m.label}</p>
                      <p className="text-xs text-muted-foreground">{m.desc}</p>
                    </div>
                    <ArrowLeft size={16} className="rotate-180 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
            <div className="mt-5 flex items-center gap-2 text-[11px] text-muted-foreground justify-center">
              <ShieldCheck size={12} /> Demo gateway · No real charges
            </div>
          </>
        )}

        {step === "form" && method && (
          <div className="space-y-4">
            <div className="glass-card p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Paying for</p>
                <p className="text-sm font-semibold text-foreground">{PLAN_NAME}</p>
              </div>
              <p className="text-xl font-extrabold text-foreground">Rs {PLAN_PRICE}</p>
            </div>

            {(method === "jazzcash" || method === "easypaisa") && (
              <div className="glass-card p-4 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">{method === "jazzcash" ? "JazzCash" : "EasyPaisa"} Wallet</h3>
                <div>
                  <label className="text-xs text-muted-foreground">Phone Number</label>
                  <input
                    type="tel" inputMode="numeric" placeholder="03XXXXXXXXX" value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-11 px-4 mt-1 rounded-xl bg-muted border border-border text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                  {phone && !isValidPhonePK(phone) && (
                    <p className="text-[11px] text-destructive mt-1">Enter a valid 11-digit Pakistani mobile number.</p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Amount (PKR)</label>
                  <input value={PLAN_PRICE} disabled className="w-full h-11 px-4 mt-1 rounded-xl bg-muted/60 border border-border text-sm font-semibold" />
                </div>
              </div>
            )}

            {method === "bank" && (
              <div className="glass-card p-4 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Bank Transfer Details</h3>
                {[
                  { k: "Bank", v: FAKE_BANK.bank },
                  { k: "Title", v: FAKE_BANK.title },
                  { k: "Account #", v: FAKE_BANK.account },
                  { k: "IBAN", v: FAKE_BANK.iban },
                ].map((row) => (
                  <div key={row.k} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-muted">
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground uppercase">{row.k}</p>
                      <p className="text-xs font-mono text-foreground truncate">{row.v}</p>
                    </div>
                    <button onClick={() => copyText(row.v, row.k)} className="p-1.5 rounded-md hover:bg-background">
                      <Copy size={14} className="text-muted-foreground" />
                    </button>
                  </div>
                ))}
                <div>
                  <label className="text-xs text-muted-foreground">Transaction ID / Reference</label>
                  <input
                    placeholder="e.g. TRX9923441" value={txnRef}
                    onChange={(e) => setTxnRef(e.target.value)}
                    className="w-full h-11 px-4 mt-1 rounded-xl bg-muted border border-border text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            )}

            {method === "card" && (
              <div className="glass-card p-4 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Card Details</h3>
                <div>
                  <label className="text-xs text-muted-foreground">Card Number</label>
                  <input
                    inputMode="numeric" placeholder="4242 4242 4242 4242" value={cardNum}
                    onChange={(e) => setCardNum(formatCard(e.target.value))}
                    className="w-full h-11 px-4 mt-1 rounded-xl bg-muted border border-border text-sm font-mono tracking-wider outline-none focus:ring-2 focus:ring-primary"
                  />
                  {cardNum && !luhn(cardNum) && (
                    <p className="text-[11px] text-destructive mt-1">Card number looks invalid.</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Expiry</label>
                    <input
                      placeholder="MM/YY" value={cardExp}
                      onChange={(e) => setCardExp(formatExpiry(e.target.value))}
                      className="w-full h-11 px-4 mt-1 rounded-xl bg-muted border border-border text-sm font-mono outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">CVV</label>
                    <input
                      type="password" inputMode="numeric" placeholder="123" maxLength={4} value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                      className="w-full h-11 px-4 mt-1 rounded-xl bg-muted border border-border text-sm font-mono outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Cardholder Name</label>
                  <input
                    placeholder="As printed on card" value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full h-11 px-4 mt-1 rounded-xl bg-muted border border-border text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            )}

            <button
              onClick={handlePay} disabled={!formValid}
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground text-sm font-bold disabled:opacity-40 active:scale-[0.98] transition-transform"
            >
              Pay Rs {PLAN_PRICE} Now
            </button>
            <p className="text-[11px] text-muted-foreground text-center">
              This is a simulated payment for demo purposes. No real money is transferred.
            </p>
          </div>
        )}

        {step === "processing" && (
          <div className="min-h-[70vh] flex flex-col items-center justify-center text-center">
            <Loader2 size={40} className="text-primary animate-spin mb-5" />
            <p className="text-base font-semibold text-foreground">Processing payment…</p>
            <p className="text-xs text-muted-foreground mt-1">Please don't close this screen.</p>
          </div>
        )}

        {step === "success" && (
          <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
            <div className="w-20 h-20 rounded-full bg-success/15 flex items-center justify-center mb-5 animate-in zoom-in duration-300">
              <Check size={40} className="text-success" strokeWidth={3} />
            </div>
            <h2 className="text-2xl font-extrabold font-display text-foreground">Payment Successful</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs">
              Your <span className="font-semibold text-foreground">{PLAN_NAME}</span> is now active for {PLAN_DAYS} days.
            </p>
            <div className="glass-card p-4 mt-6 w-full max-w-sm text-left">
              <div className="flex justify-between text-xs text-muted-foreground"><span>Amount</span><span className="text-foreground font-semibold">Rs {PLAN_PRICE}</span></div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2"><span>Method</span><span className="text-foreground capitalize">{method}</span></div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2"><span>Expires</span><span className="text-foreground">{new Date(Date.now() + PLAN_DAYS * 86400000).toLocaleDateString()}</span></div>
            </div>
            <div className="flex gap-3 mt-7 w-full max-w-sm">
              <button onClick={() => navigate("/home", { replace: true })} className="flex-1 h-12 rounded-xl bg-muted text-sm font-semibold">Home</button>
              <button onClick={() => navigate("/mock-test", { replace: true })} className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground text-sm font-bold">Start Mock Test</button>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default Subscribe;
