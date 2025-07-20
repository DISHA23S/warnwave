import { useContext, useState, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import Login from "./Login";
import Register from "./Register";
import axios from "axios";

const DEFAULT_AVATAR =
  "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff&rounded=true";

export default function Home() {
  const { user, setUser } = useContext(AuthContext);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const handleOpenLogin = () => {
    setShowLogin(true);
    setShowRegister(false);
  };
  const handleOpenRegister = () => {
    setShowRegister(true);
    setShowLogin(false);
  };
  const handleCloseModals = () => {
    setShowLogin(false);
    setShowRegister(false);
  };

  // Profile image upload logic
  const handleProfileImageClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      // Upload to Cloudinary (replace with your own cloud name and unsigned upload preset)
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "unsigned_preset"); // <-- set your unsigned preset
      const cloudName = "demo"; // <-- set your cloud name
      const uploadRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData
      );
      const imageUrl = uploadRes.data.secure_url;
      // Update backend
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/auth/profile-image",
        { profileImage: imageUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(res.data);
    } catch (err) {
      alert("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 z-0 animate-bg-gradient bg-gradient-to-tr from-blue-400 via-purple-400 to-pink-400 opacity-90"></div>
      {/* Watermark Logo */}
      <div className="pointer-events-none select-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 opacity-10 text-[18vw] font-extrabold text-white whitespace-nowrap tracking-widest" style={{fontFamily: 'monospace'}}>W</div>
      {/* Top-right Navigation */}
      <div className="absolute top-0 right-0 p-6 z-20 flex gap-4 items-center">
        {user ? (
          <>
            <div className="relative group">
              <img
                src={user.profileImage || DEFAULT_AVATAR}
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-white shadow object-cover bg-white cursor-pointer"
                onError={e => (e.currentTarget.src = DEFAULT_AVATAR)}
                onClick={handleProfileImageClick}
              />
              {/* Camera icon overlay */}
              <button
                type="button"
                onClick={handleProfileImageClick}
                className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                title="Change profile image"
                disabled={uploading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-4.553a1.5 1.5 0 00-2.121-2.121L13 7.879M7 17h.01M17 7h.01M7 7h.01M17 17h.01M12 12v.01M12 12a5 5 0 11-10 0 5 5 0 0110 0z" /></svg>
              </button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleProfileImageChange}
                disabled={uploading}
              />
              {uploading && <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-full"><div className="loader"></div></div>}
            </div>
            <span className="text-white font-semibold text-lg drop-shadow">{user.username}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow transition-all duration-200"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleOpenLogin}
              className="bg-white/80 hover:bg-white text-blue-700 font-semibold px-4 py-2 rounded shadow transition-all duration-200"
            >
              Login
            </button>
            <button
              onClick={handleOpenRegister}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow transition-all duration-200"
            >
              Register
            </button>
          </>
        )}
      </div>
      {/* Main Card */}
      <div className="relative z-20 bg-white/90 rounded-2xl shadow-2xl p-10 max-w-lg w-full flex flex-col items-center animate-fade-in backdrop-blur-md">
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-700 mb-4 tracking-tight text-center drop-shadow">warnwave</h1>
        <p className="text-lg text-gray-700 mb-6 text-center">Welcome to <span className="font-bold text-blue-600">warnwave</span> — your modern solution for safe gesture-based authentication and alerts. Learn how to use gestures securely and protect your digital identity.</p>
        <ul className="text-gray-600 text-base mb-6 space-y-2 list-disc list-inside">
          <li>Sign safely with intuitive gestures</li>
          <li>Advanced security for your accounts</li>
          <li>Easy, fast, and reliable authentication</li>
        </ul>
        <div className="w-full flex flex-col items-center">
          {user ? (
            <p className="text-green-600 font-semibold">You are logged in. Enjoy the features!</p>
          ) : (
            <p className="text-gray-500">Login or register to get started.</p>
          )}
        </div>
      </div>
      {/* Modals */}
      {showLogin && (
        <Login
          modal={true}
          onClose={handleCloseModals}
          onSwitchToRegister={handleOpenRegister}
        />
      )}
      {showRegister && (
        <Register
          modal={true}
          onClose={handleCloseModals}
          onSwitchToLogin={handleOpenLogin}
        />
      )}
      {/* Custom Animations */}
      <style>{`
        @keyframes bg-gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-bg-gradient {
          background-size: 200% 200%;
          animation: bg-gradient 8s ease-in-out infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1.2s cubic-bezier(0.4,0,0.2,1);
        }
        .loader {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #3498db;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
