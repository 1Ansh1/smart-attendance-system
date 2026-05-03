import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/client";
import AppShell from "../components/AppShell";

export default function Report() {
  const { studentId } = useParams();
  const nav = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/attendance/report/${studentId}`)
      .then((res) => setData(res.data))
      .catch(() => alert("Error loading report"))
      .finally(() => setLoading(false));
  }, [studentId]);

  return (
    <AppShell title="Student Report">
      <div className="max-w-xl">
        <div className="bg-zinc-900 border border-white/10 rounded-xl p-6">
          
          <h2 className="text-xl font-bold mb-4">
            Report for Student ID: {studentId}
          </h2>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="text-lg">
              <p>Total Present: <span className="font-bold">{data.total_present}</span></p>
            </div>
          )}

          <button
            onClick={() => nav("/dashboard")}
            className="mt-4 bg-indigo-500 px-4 py-2 rounded text-white"
          >
            Back
          </button>

        </div>
      </div>
    </AppShell>
  );
}