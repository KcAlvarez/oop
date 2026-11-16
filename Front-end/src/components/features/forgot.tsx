import { useState } from "react";
import { useNavigate } from "react-router";
import Logo from "@/assets/image 1.png";
import BooksImg from "@/assets/image 2.png";
import { forgotPassword } from "@/lib/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!/^[A-Za-z0-9._%+-]+@gmail\.com$/i.test(email)) {
      setError("Please use a valid Gmail address (example@gmail.com).");
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(email);
      navigate("/reset-password", { state: { email } });
    } catch (err: any) {
      setError(err?.message || "Request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5FAFD] relative flex flex-col items-center justify-center p-6">
      {/* Left School Logo */}
      <img
        src={Logo}
        alt="Cordova Public College Logo"
        className="w-20 h-20 md:w-24 md:h-24 object-contain absolute top-8 left-8 md:top-12 md:left-16"
      />

      {/* Centered Content Container */}
      <div className="w-full max-w-md flex flex-col items-center">
        {/* CPC Library Header */}
        <h1 className="text-2xl font-['Irish_Grover',cursive] tracking-wide text-black mb-2">
          CPC Library
        </h1>

        <img
          src={BooksImg}
          alt="Stack of Books"
          className="w-28 h-28 object-contain mb-2"
        />

        <h2 className="text-xl font-['Irish_Grover',cursive] tracking-wide text-black underline underline-offset-4 mb-6">
          Library Book Search App
        </h2>

        {/* Page Title */}
        <h3 className="text-xl font-['Irish_Grover',cursive] tracking-wider text-black uppercase mb-6">
          FORGOT PASSWORD
        </h3>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
          <div className="w-full max-w-sm">
            <label
              htmlFor="email"
              className="block text-sm text-black mb-1.5 ml-2"
            >
              Enter your email address.
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 px-5 bg-[#D9D9D9] rounded-full text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#143D99]"
            />
          </div>

          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

          {/* Continue Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-36 h-9 bg-[#143D99] hover:bg-blue-900 disabled:opacity-60 text-white text-sm font-medium tracking-wider uppercase rounded-full transition-colors cursor-pointer"
          >
            {loading ? "..." : "CONTINUE"}
          </button>
        </form>
      </div>
    </div>
  );
}
