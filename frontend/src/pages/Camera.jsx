import { useRef, useState } from "react";
import api from "../api/client";

export default function Camera() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [message, setMessage] = useState("");

  // Start webcam
  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
  };

  // Capture image
  const capture = async () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    // Convert to blob
    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append("file", blob, "capture.jpg");

      try {
        const res = await api.post("/attendance/mark", formData);
        setMessage(JSON.stringify(res.data));
      } catch (err) {
        setMessage("Error marking attendance");
      }
    }, "image/jpeg");
  };

  return (
    <div>
      <h2>Camera Attendance</h2>

      <video ref={videoRef} autoPlay width="400" />

      <br />

      <button onClick={startCamera}>Start Camera</button>
      <button onClick={capture}>Mark Attendance</button>

      <canvas ref={canvasRef} style={{ display: "none" }} />

      <p>{message}</p>
    </div>
  );
}