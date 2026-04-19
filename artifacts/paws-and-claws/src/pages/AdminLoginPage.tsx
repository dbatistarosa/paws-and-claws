import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAdminLogin } from "@workspace/api-client-react";
import { Heart, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
  const [, navigate] = useLocation();
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) navigate("/admin/dashboard");
  }, []);

  const { mutate: login, isPending } = useAdminLogin({
    mutation: {
      onSuccess: (data) => {
        localStorage.setItem("admin_token", data.token);
        navigate("/admin/dashboard");
      },
      onError: () => {
        setError("Incorrect PIN. Please try again.");
        setPin("");
      },
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!pin) { setError("Please enter your PIN."); return; }
    login({ data: { pin } });
  }

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm bg-background rounded-3xl shadow-lg border border-border p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <div className="flex items-center gap-2 justify-center mb-2">
            <Heart className="w-5 h-5 text-primary fill-primary/20" />
            <span className="font-serif font-bold text-lg">Paws and Claws</span>
          </div>
          <h1 className="text-2xl font-serif font-bold">Admin Login</h1>
          <p className="text-muted-foreground text-sm mt-1">Enter your PIN to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showPin ? "text" : "password"}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter PIN"
              className="w-full px-4 py-3 pr-12 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-center text-2xl tracking-[0.5em] font-mono"
              autoComplete="current-password"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-xl text-center">{error}</p>
          )}

          <Button type="submit" className="w-full rounded-xl h-12 text-base" disabled={isPending}>
            {isPending ? "Logging in..." : "Login"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">← Back to website</a>
        </div>
      </div>
    </div>
  );
}
