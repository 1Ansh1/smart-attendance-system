import { useState } from "react";
import api from "../api/client";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const nav = useNavigate();

  const handleLogin = async (e) => {
    e?.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.access_token);
      nav("/dashboard");
    } catch (e2) {
      setErr("Invalid email or password.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center px-4">
     
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute top-24 right-0 h-80 w-80 rounded-full bg-fuchsia-600/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-zinc-950/60 backdrop-blur shadow-2xl">
          <div className="p-6 md:p-8">
            <div className="mb-6">
              <div className="text-sm text-zinc-400">Welcome back</div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Teacher Login
              </h1>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400">Email</label>
                <input
                  className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-900/60 px-3 py-2 text-sm outline-none focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="teacher@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400">Password</label>
                <input
                  type="password"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-900/60 px-3 py-2 text-sm outline-none focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>

              {err && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {err}
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-60 px-4 py-2 text-sm font-medium text-white transition"
              >
                {busy ? "Signing in..." : "Sign in"}
              </button>
            </form>
          </div>

          <div className="border-t border-white/10 px-6 md:px-8 py-4 text-xs text-zinc-400">
            Tip: keep lighting good for accurate recognition.
          </div>
        </div>
      </div>
    </div>
  );
}