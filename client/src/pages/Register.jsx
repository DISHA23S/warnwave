import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register({ modal = false, onClose, onSwitchToLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1 = form, 2 = OTP
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/auth/register", form);
      setStep(2); // Show OTP step
    } catch (err) {
      alert("Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/auth/verify-otp", {
        email: form.email,
        otp,
      });
      alert("Registration successful. Please login.");
      if (modal && onSwitchToLogin) onSwitchToLogin();
      else navigate("/login");
    } catch (err) {
      alert("Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className="bg-white rounded-2xl shadow-2xl p-8 w-[90%] max-w-md relative animate-modal-pop">
      {modal && (
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
      )}
      {step === 1 ? (
        <>
          <h2 className="text-2xl font-bold mb-4 text-center text-blue-700">Register</h2>
          <form onSubmit={handleRegister} className="space-y-3">
            <input
              type="text"
              name="username"
              placeholder="Username"
              className="w-full border px-3 py-2 rounded"
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full border px-3 py-2 rounded"
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="w-full border px-3 py-2 rounded"
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              className="w-full border px-3 py-2 rounded"
              onChange={handleChange}
              required
            />
            <button
              type="submit"
              className="bg-green-600 w-full text-white px-4 py-2 rounded hover:bg-green-700 transition-all"
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
          <div className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{' '}
            {modal ? (
              <button onClick={onSwitchToLogin} className="text-blue-600 hover:underline font-semibold">Login</button>
            ) : (
              <a href="/login" className="text-blue-600 hover:underline font-semibold">Login</a>
            )}
          </div>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-4 text-center text-blue-700">Verify OTP</h2>
          <input
            type="text"
            placeholder="Enter OTP"
            className="w-full border px-3 py-2 rounded mb-4"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <button
            onClick={handleVerifyOtp}
            className="bg-blue-600 w-full text-white px-4 py-2 rounded hover:bg-blue-700 transition-all"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify & Complete Registration"}
          </button>
        </>
      )}
    </div>
  );

  if (modal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
        {content}
        <style>{`
          @keyframes modal-pop {
            from { opacity: 0; transform: scale(0.95) translateY(30px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          .animate-modal-pop {
            animation: modal-pop 0.4s cubic-bezier(0.4,0,0.2,1);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      {content}
    </div>
  );
}
