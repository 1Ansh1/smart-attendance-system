import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Camera from "./pages/Camera";
import RegisterStudent from "./pages/RegisterStudent";
import Report from "./pages/Report";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/camera" element={<Camera />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/register-student" element={<RegisterStudent />} />
        <Route path="/report/:studentId" element={<Report />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;