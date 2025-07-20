import { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Login({ modal = false, onClose, onSwitchToRegister }) {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      const user = await axios.get("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${res.data.token}` },
      });
      setUser(user.data);
      if (modal && onClose) onClose();
      else navigate("/");
    } catch (err) {
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className="bg-white rounded-2xl shadow-2xl p-8 w-[90%] max-w-md relative animate-modal-pop">
      {modal && (
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
      )}
      <h2 className="text-2xl font-bold mb-4 text-center text-blue-700">Login</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full border px-3 py-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border px-3 py-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 w-full text-white px-4 py-2 rounded hover:bg-blue-700 transition-all"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <div className="mt-4 text-center text-sm text-gray-600">
        Don't have an account?{' '}
        {modal ? (
          <button onClick={onSwitchToRegister} className="text-blue-600 hover:underline font-semibold">Register</button>
        ) : (
          <a href="/register" className="text-blue-600 hover:underline font-semibold">Register</a>
        )}
      </div>
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
