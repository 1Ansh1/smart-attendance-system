import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import AppShell from "../components/AppShell";
import { useNavigate } from "react-router-dom";
export default function Dashboard() {
  const [students, setStudents] = useState([]);
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get("/students")
      .then((res) => setStudents(res.data))
      .catch(() => alert("Error loading students"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return students;
    return students.filter((s) => {
      const name = (s.name || "").toLowerCase();
      const roll = (s.roll_number || "").toLowerCase();
      const cls = (s.student_class || "").toLowerCase();
      const sec = (s.section || "").toLowerCase();
      return (
        name.includes(term) ||
        roll.includes(term) ||
        cls.includes(term) ||
        sec.includes(term)
      );
    });
  }, [q, students]);

  return (
    <AppShell title="Dashboard">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-zinc-950/60 backdrop-blur p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm text-zinc-400">Students</div>
                <div className="text-xl font-semibold tracking-tight">
                  Manage & view enrolled students
                </div>
              </div>

              <button
                onClick={() => (window.location.href = "/camera")}
                className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-4 py-2 text-sm font-semibold transition"
              >
                Mark Attendance
              </button>
            </div>

            <div className="mt-4">
              <input
                className="w-full rounded-xl border border-white/10 bg-zinc-900/60 px-3 py-2 text-sm outline-none focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-500/20"
                placeholder="Search by name, roll, class, section..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </div>

          {/* List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : filtered.length === 0 ? (
              <div className="md:col-span-2 rounded-2xl border border-white/10 bg-zinc-950/60 backdrop-blur p-6 text-zinc-300">
                No students found.
              </div>
            ) : (
              filtered.map((s) => (
                <div
                  key={s.id}
                  className="rounded-2xl border border-white/10 bg-zinc-950/60 backdrop-blur p-5 hover:border-white/20 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold">{s.name}</div>
                      <div className="text-xs text-zinc-400 mt-1">
                        Roll:{" "}
                        <span className="text-zinc-200">{s.roll_number}</span>
                      </div>
                    </div>
                    <span className="text-xs rounded-full border border-white/10 bg-zinc-900/60 px-2 py-1 text-zinc-300">
                      ID {s.id}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-zinc-300">
                    <div className="rounded-xl border border-white/10 bg-zinc-900/30 px-3 py-2">
                      <div className="text-xs text-zinc-400">Class</div>
                      <div className="font-medium text-zinc-100">
                        {s.student_class}
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-zinc-900/30 px-3 py-2">
                      <div className="text-xs text-zinc-400">Section</div>
                      <div className="font-medium text-zinc-100">
                        {s.section}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => nav(`/report/${s.id}`)}
                      className="rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 text-sm font-semibold transition"
                    >
                      View Report
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-zinc-950/60 backdrop-blur p-5">
            <div className="text-sm text-zinc-400">Summary</div>
            <div className="mt-1 text-2xl font-semibold tracking-tight">
              {loading ? "—" : students.length}
            </div>
            <div className="text-sm text-zinc-400">Total students</div>

            <div className="mt-4 rounded-xl border border-white/10 bg-zinc-900/30 p-4 text-sm text-zinc-300">
              Tip: Register 3–5 images per student for best matching accuracy.
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-950/60 backdrop-blur p-5">
            <div className="text-sm text-zinc-400">Quick actions</div>
            <div className="mt-3 flex flex-col gap-2">
              <button
                onClick={() => (window.location.href = "/camera")}
                className="rounded-xl border border-white/10 bg-zinc-900/60 hover:bg-zinc-800 px-4 py-2 text-sm text-zinc-100 transition"
              >
                Open camera
              </button>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="rounded-xl border border-white/10 bg-zinc-900/60 hover:bg-zinc-800 px-4 py-2 text-sm text-zinc-100 transition"
              >
                Scroll to top
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950/60 backdrop-blur p-5 animate-pulse">
      <div className="h-4 w-2/3 bg-zinc-800 rounded" />
      <div className="mt-3 h-3 w-1/2 bg-zinc-800 rounded" />
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="h-12 bg-zinc-900/60 rounded-xl border border-white/5" />
        <div className="h-12 bg-zinc-900/60 rounded-xl border border-white/5" />
      </div>
    </div>
  );
}
