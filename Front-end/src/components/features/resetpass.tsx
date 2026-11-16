import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import Logo from "@/assets/image 1.png";
import BooksImg from "@/assets/image 2.png";
import { resetPassword } from "@/lib/api";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation() as { state?: { email?: string } };

  const initialEmail = location.state?.email || "";

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const targetEmail = email || initialEmail;
    if (!targetEmail) {
      setError("Please enter your email address.");
      return;
    }
    if (!/^[A-Za-z0-9._%+-]+@gmail\.com$/i.test(targetEmail)) {
      setError("Please use a valid Gmail address (example@gmail.com).");
      return;
    }
    if (!newPassword || !confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(targetEmail, newPassword, confirmPassword);
      alert("Password successfully reset!");
      navigate("/");
    } catch (err: any) {
      setError(err?.message || "Reset failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5FAFD] flex flex-col items-center justify-center p-6">
      
      {/* Main Card Container */}
      <div className="w-full max-w-xl bg-white p-10 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center relative">
        
        {/* Top Left College Logo */}
        <div className="absolute top-8 left-8">
          <img
            src={Logo}
            alt="Cordova Public College Logo"
            className="w-16 h-16 object-contain"
          />
        </div>

        {/* Center Header: CPC Library & Book Stack */}
        <div className="flex flex-col items-center mb-10 mt-4">
          <h1 className="text-xl font-['Irish_Grover',cursive] tracking-wide text-black mb-1">
            CPC Library
          </h1>
          <img
            src={BooksImg}
            alt="Stack of Books"
            className="w-20 h-20 object-contain mb-1"
          />
          <p className="text-xs font-['Irish_Grover',cursive] tracking-wide text-black">
            Library Book Search App
          </p>
        </div>

        {/* Reset Password Form */}
        <form onSubmit={handleResetPassword} className="w-full max-w-md flex flex-col gap-6">
          
          {!initialEmail ? (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-800">Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 bg-[#D9D9D9] border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#143D99]"
                required
              />
            </div>
          ) : (
            <p className="text-sm text-gray-700">Resetting password for <strong>{initialEmail}</strong></p>
          )}

          {/* New Password Field */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-800">
              New Password:
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full h-12 px-4 bg-[#D9D9D9] border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#143D99]"
              required
            />
          </div>

          {/* Confirm Password Field */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-800">
              Confirm Password:
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-12 px-4 bg-[#D9D9D9] border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#143D99]"
              required
            />
          </div>

          {error ? <p className="text-sm text-red-600 text-center">{error}</p> : null}

          {/* Reset Password Button */}
          <div className="flex justify-center mt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-56 h-12 bg-[#143D99] hover:bg-blue-900 disabled:opacity-60 text-white font-mono text-sm tracking-wider rounded-xl shadow transition-colors cursor-pointer"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
