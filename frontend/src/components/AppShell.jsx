import { NavLink, useNavigate } from "react-router-dom";

const LinkItem = ({ to, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      [
        "block px-3 py-2 rounded-lg text-sm transition",
        isActive
          ? "bg-zinc-800 text-white"
          : "text-zinc-300 hover:bg-zinc-900 hover:text-white",
      ].join(" ")
    }
  >
    {label}
  </NavLink>
);

export default function AppShell({ title, children }) {
  const nav = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    nav("/");
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute top-24 right-0 h-72 w-72 rounded-full bg-fuchsia-600/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl">
       
        <aside className="hidden md:flex w-64 flex-col border-r border-white/10 bg-zinc-950/60 backdrop-blur px-4 py-6">
          <div className="mb-6">
            <div className="text-lg font-semibold tracking-tight">Smart Attendance</div>
            <div className="text-xs text-zinc-400">Teacher Console</div>
          </div>

          <nav className="space-y-1">
            <LinkItem to="/dashboard" label="Dashboard" />
            <LinkItem to="/camera" label="Mark Attendance" />
            <LinkItem to="/register-student" label="Register Student" />
          </nav>

          <div className="mt-auto pt-6">
            <button
              onClick={logout}
              className="w-full rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 px-3 py-2 text-sm text-zinc-200 transition"
            >
              Logout
            </button>
          </div>
        </aside>

        
        <main className="flex-1">
         
          <div className="sticky top-0 z-10 border-b border-white/10 bg-zinc-950/60 backdrop-blur">
            <div className="flex items-center justify-between px-4 md:px-8 py-4">
              <div>
                <div className="text-sm text-zinc-400">Smart Attendance</div>
                <div className="text-xl font-semibold tracking-tight">{title}</div>
              </div>

              <div className="flex items-center gap-2 md:hidden">
                <button
                  onClick={() => nav("/dashboard")}
                  className="rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 px-3 py-2 text-xs text-zinc-200 transition"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => nav("/camera")}
                  className="rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 px-3 py-2 text-xs text-zinc-200 transition"
                >
                  Camera
                </button>
                <button
                  onClick={logout}
                  className="rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 px-3 py-2 text-xs text-zinc-200 transition"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          <div className="px-4 md:px-8 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}