import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const nav = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    nav("/");
  };

  return (
    <div className="flex justify-between items-center bg-white shadow px-6 py-3">
      <h1 className="text-xl font-bold">Smart Attendance</h1>

      <div className="space-x-3">
        <button
          onClick={() => nav("/dashboard")}
          className="px-3 py-1 bg-gray-200 rounded"
        >
          Dashboard
        </button>

        <button
          onClick={() => nav("/camera")}
          className="px-3 py-1 bg-green-500 text-white rounded"
        >
          Camera
        </button>

        <button
          onClick={logout}
          className="px-3 py-1 bg-red-500 text-white rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
}