import { useState } from "react";
import { Link, useNavigate } from "react-router";
import Logo from "@/assets/image 1.png";
import BooksImg from "@/assets/image 2.png";
import { register, setToken } from "@/lib/api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!/^[A-Za-z0-9._%+-]+@gmail\.com$/i.test(email)) {
      setError("Please use a valid Gmail address (example@gmail.com).");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await register(name, email, password);
      setToken(res.token);
      localStorage.setItem("auth_user", JSON.stringify(res.user));
      navigate("/homepage");
    } catch (err: any) {
      setError(err?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5FAFD] relative flex flex-col items-center justify-center p-6">
      <img
        src={Logo}
        alt="Cordova Public College Logo"
        className="w-20 h-20 md:w-20 md:h-20 object-contain absolute top-8 left-8 md:top-12 md:left-16"
      />

      <div className="w-full max-w-md flex flex-col items-center">
        <h1 className="text-2xl font-['Irish_Grover',cursive] tracking-wide text-black mb-2">
          CPC Library
        </h1>

        <img src={BooksImg} alt="Stack of Books" className="w-28 h-28 object-contain my-1" />

        <h2 className="text-xl font-['Irish_Grover',cursive] text-black underline underline-offset-4 mb-4">
          Library Book Search App
        </h2>

        <h3 className="text-lg font-['Irish_Grover',cursive] tracking-wider text-black uppercase mb-4">
          Create Account
        </h3>

        <form className="w-full flex flex-col gap-3" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-black font-normal pl-1">Student Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full h-10 px-5 bg-[#D9D9D9] rounded-full text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#143D99]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-black font-normal pl-1">Gmail:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-10 px-5 bg-[#D9D9D9] rounded-full text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#143D99]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-black font-normal pl-1">Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full h-10 px-5 bg-[#D9D9D9] rounded-full text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#143D99]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-black font-normal pl-1">Confirm Password:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full h-10 px-5 bg-[#D9D9D9] rounded-full text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#143D99]"
            />
          </div>

          {error ? <p className="text-sm text-red-600 text-center">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-40 mx-auto h-9 bg-[#143D99] hover:bg-blue-900 disabled:opacity-60 text-white font-medium rounded flex items-center justify-center cursor-pointer"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <div className="mt-4 text-sm">
          <span className="text-black">Already have an account? </span>
          <Link to="/" className="font-medium text-[#143D99] underline underline-offset-2 hover:text-blue-900">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
