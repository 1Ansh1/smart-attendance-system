import { useEffect, useState } from "react";
import api from "../api/client";

export default function Dashboard() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    api
      .get("/students")
      .then((res) => setStudents(res.data))
      .catch(() => alert("Error loading students"));
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      <button onClick={() => (window.location.href = "/camera")}>
        Open Camera
      </button>
      {students.map((s) => (
        <div key={s.id}>
          {s.name} ({s.roll_number})
        </div>
      ))}
    </div>
  );
}
