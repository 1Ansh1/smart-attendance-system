import { useMemo, useRef, useState } from "react";
import api from "../api/client";
import AppShell from "../components/AppShell";

export default function RegisterStudent() {
  // student form
  const [form, setForm] = useState({
    name: "",
    roll_number: "",
    student_class: "",
    section: "",
  });

  // camera + captures
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [captures, setCaptures] = useState([]); // [{ blob, previewUrl }]

  // ui state
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState({ type: "idle", text: "" });

  const canSubmit = useMemo(() => {
    return (
      form.name.trim() &&
      form.roll_number.trim() &&
      form.student_class.trim() &&
      form.section.trim() &&
      captures.length >= 3 &&
      !busy
    );
  }, [form, captures.length, busy]);

  const startCamera = async () => {
    setStatus({ type: "idle", text: "" });
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setCameraOn(true);
    } catch {
      setStatus({ type: "error", text: "Camera permission denied." });
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) stream.getTracks().forEach((t) => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
  };

  const capturePhoto = () => {
    if (!cameraOn) {
      setStatus({ type: "error", text: "Start the camera first." });
      return;
    }
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const previewUrl = URL.createObjectURL(blob);
        setCaptures((prev) => [...prev, { blob, previewUrl }]);
        setStatus({ type: "success", text: `Captured ${captures.length + 1} photo(s)` });
      },
      "image/jpeg",
      0.9
    );
  };

  const removeCapture = (idx) => {
    setCaptures((prev) => {
      const copy = [...prev];
      // cleanup object url
      URL.revokeObjectURL(copy[idx].previewUrl);
      copy.splice(idx, 1);
      return copy;
    });
  };

  const resetAll = () => {
    captures.forEach((c) => URL.revokeObjectURL(c.previewUrl));
    setCaptures([]);
    setForm({ name: "", roll_number: "", student_class: "", section: "" });
    setStatus({ type: "idle", text: "" });
  };

  const submitRegistration = async () => {
    if (!canSubmit) {
      setStatus({
        type: "warn",
        text: captures.length < 3 ? "Capture at least 3 photos." : "Fill all fields.",
      });
      return;
    }

    setBusy(true);
    setStatus({ type: "idle", text: "" });

    try {
      // 1) Create student
      const studentRes = await api.post("/students", form);
      const studentId = studentRes.data.id;

      // 2) Upload each captured photo as multipart to /faces/{studentId}
      for (let i = 0; i < captures.length; i++) {
        const fd = new FormData();
        fd.append("file", captures[i].blob, `face_${studentId}_${i + 1}.jpg`);
        await api.post(`/faces/${studentId}`, fd);
      }

      setStatus({
        type: "success",
        text: `Student registered successfully (ID: ${studentId}). Faces uploaded: ${captures.length}`,
      });

      // optional: stop camera after success
      stopCamera();
      // keep data for now; or reset
      // resetAll();
    } catch (e) {
      setStatus({ type: "error", text: "Registration failed. Check backend logs." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell title="Register Student">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="rounded-2xl border border-white/10 bg-zinc-950/60 backdrop-blur p-5">
          <div className="text-sm text-zinc-400">Student details</div>
          <div className="mt-1 text-xl font-semibold tracking-tight">Create student record</div>

          <div className="mt-4 space-y-3">
            <Field
              label="Name"
              value={form.name}
              onChange={(v) => setForm((p) => ({ ...p, name: v }))}
              placeholder="Student name"
            />
            <Field
              label="Roll Number"
              value={form.roll_number}
              onChange={(v) => setForm((p) => ({ ...p, roll_number: v }))}
              placeholder="e.g. 101"
            />
            <Field
              label="Class"
              value={form.student_class}
              onChange={(v) => setForm((p) => ({ ...p, student_class: v }))}
              placeholder="e.g. CSE"
            />
            <Field
              label="Section"
              value={form.section}
              onChange={(v) => setForm((p) => ({ ...p, section: v }))}
              placeholder="e.g. A"
            />

            <div className="pt-2 text-xs text-zinc-400">
              Capture at least <span className="text-zinc-200 font-semibold">3</span> clear photos
              (front-facing, good lighting). 5 is ideal.
            </div>

            <div className="flex gap-2 pt-3">
              <button
                onClick={submitRegistration}
                disabled={!canSubmit}
                className="flex-1 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 px-4 py-2 text-sm font-semibold text-white transition"
              >
                {busy ? "Registering..." : "Register Student"}
              </button>

              <button
                onClick={resetAll}
                disabled={busy}
                className="rounded-xl border border-white/10 bg-zinc-900/60 hover:bg-zinc-800 px-4 py-2 text-sm text-zinc-100 transition"
              >
                Reset
              </button>
            </div>

            {status.text && (
              <div className={`mt-3 ${pill(status.type)}`}>
                {status.text}
              </div>
            )}
          </div>
        </div>

        {/* Camera */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-zinc-950/60 backdrop-blur p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm text-zinc-400">Camera</div>
              <div className="mt-1 text-xl font-semibold tracking-tight">Capture face photos</div>
            </div>

            <div className="flex gap-2">
              {!cameraOn ? (
                <button
                  onClick={startCamera}
                  className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-4 py-2 text-sm font-semibold transition"
                >
                  Start
                </button>
              ) : (
                <button
                  onClick={stopCamera}
                  className="rounded-xl border border-white/10 bg-zinc-900/60 hover:bg-zinc-800 px-4 py-2 text-sm text-zinc-100 transition"
                >
                  Stop
                </button>
              )}

              <button
                onClick={capturePhoto}
                disabled={!cameraOn || busy}
                className="rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white px-4 py-2 text-sm font-semibold transition"
              >
                Capture
              </button>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-black">
            <video ref={videoRef} autoPlay className="w-full h-[360px] object-cover" />
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {/* Captures */}
          <div className="mt-5">
            <div className="flex items-center justify-between">
              <div className="text-sm text-zinc-400">
                Captured photos: <span className="text-zinc-100 font-semibold">{captures.length}</span>
              </div>
              <div className="text-xs text-zinc-500">Click a photo to remove it</div>
            </div>

            {captures.length === 0 ? (
              <div className="mt-3 rounded-xl border border-white/10 bg-zinc-900/30 p-4 text-sm text-zinc-300">
                No photos captured yet. Start camera and click Capture.
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                {captures.map((c, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => removeCapture(idx)}
                    className="group relative overflow-hidden rounded-xl border border-white/10 bg-zinc-900/30"
                    title="Remove photo"
                  >
                    <img src={c.previewUrl} alt={`capture-${idx}`} className="h-28 w-full object-cover" />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-black/40 flex items-center justify-center text-xs text-white">
                      Remove
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <div className="text-xs text-zinc-400">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-500/20"
      />
    </div>
  );
}

function pill(type) {
  const base = "rounded-xl border px-4 py-3 text-sm backdrop-blur";
  if (type === "success") return `${base} border-emerald-500/20 bg-emerald-500/10 text-emerald-200`;
  if (type === "warn") return `${base} border-amber-500/20 bg-amber-500/10 text-amber-200`;
  return `${base} border-red-500/20 bg-red-500/10 text-red-200`;
}