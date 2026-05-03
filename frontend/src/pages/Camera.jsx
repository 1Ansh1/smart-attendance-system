import { useRef, useState } from "react";
import api from "../api/client";
import AppShell from "../components/AppShell";

export default function Camera() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [status, setStatus] = useState({ type: "idle", text: "" });
  const [busy, setBusy] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);

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
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
  };

  const markAttendance = async () => {
    if (!cameraOn) {
      setStatus({ type: "error", text: "Start the camera first." });
      return;
    }

    setBusy(true);
    setStatus({ type: "idle", text: "" });

    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      async (blob) => {
        try {
          const formData = new FormData();
          formData.append("file", blob, "capture.jpg");

          const res = await api.post("/attendance/mark", formData);

          const msg = res?.data?.message || "Done";
          if (msg.toLowerCase().includes("marked")) {
            setStatus({ type: "success", text: msg });
          } else if (msg.toLowerCase().includes("already")) {
            setStatus({ type: "info", text: msg });
          } else {
            setStatus({ type: "warn", text: msg });
          }
        } catch {
          setStatus({ type: "error", text: "Failed to mark attendance." });
        } finally {
          setBusy(false);
        }
      },
      "image/jpeg",
      0.9
    );
  };

  return (
    <AppShell title="Mark Attendance">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camera panel */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-zinc-950/60 backdrop-blur p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm text-zinc-400">Camera</div>
              <div className="text-xl font-semibold tracking-tight">
                Capture & mark attendance
              </div>
            </div>

            <div className="flex gap-2">
              {!cameraOn ? (
                <button
                  onClick={startCamera}
                  className="rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 text-sm font-semibold transition"
                >
                  Start
                </button>
              ) : (
                <button
                  onClick={stopCamera}
                  className="rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-100 px-4 py-2 text-sm transition"
                >
                  Stop
                </button>
              )}

              <button
                onClick={markAttendance}
                disabled={busy}
                className="rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-zinc-950 px-4 py-2 text-sm font-semibold transition"
              >
                {busy ? "Marking..." : "Mark"}
              </button>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-black">
            <video ref={videoRef} autoPlay className="w-full h-[380px] object-cover" />
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {status.text && (
            <div className={`mt-4 ${statusPill(status.type)}`}>
              {status.text}
            </div>
          )}
        </div>

        {/* Tips panel */}
        <div className="rounded-2xl border border-white/10 bg-zinc-950/60 backdrop-blur p-5">
          <div className="text-sm text-zinc-400">Tips</div>
          <div className="mt-2 space-y-3 text-sm text-zinc-300">
            <div className="rounded-xl border border-white/10 bg-zinc-900/30 p-3">
              Use good lighting and keep the face centered.
            </div>
            <div className="rounded-xl border border-white/10 bg-zinc-900/30 p-3">
              If you get “No match”, upload 3–5 images per student.
            </div>
            <div className="rounded-xl border border-white/10 bg-zinc-900/30 p-3">
              Attendance is limited to once per student per day (prevents duplicates).
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function statusPill(type) {
  const base =
    "rounded-xl border px-4 py-3 text-sm backdrop-blur";
  if (type === "success")
    return `${base} border-emerald-500/20 bg-emerald-500/10 text-emerald-200`;
  if (type === "info")
    return `${base} border-blue-500/20 bg-blue-500/10 text-blue-200`;
  if (type === "warn")
    return `${base} border-amber-500/20 bg-amber-500/10 text-amber-200`;
  return `${base} border-red-500/20 bg-red-500/10 text-red-200`;
}