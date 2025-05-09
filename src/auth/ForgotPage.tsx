import { useState } from "react";
import { accessElf } from "./utils/accessElf";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

function ForgotPage() {
  accessElf.track("ForgotPage");

  const [email, setEmail] = useState("");
  const [mode, setMode] = useState("email");
  const navigate = useNavigate();
  const { forgot } = useAuth();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      forgot(email);
      setMode("sent");
      console.log("Forgot password request sent for:", email);
    } catch (error) {
      console.error("Forgot password failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 relative">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={() => navigate("/")}
        >
          X
        </button>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Forgot Password</h2>
        {mode === "sent" && (
          <div className="text-center text-gray-600 mb-4">
            A password reset link has been sent to your email address.
          </div>
        )}
        {mode === "email" && (
        <form className="space-y-4" onSubmit={handleForgotPassword}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            Reset Password
          </button>
        </form>
        )}
        <div className="mt-6 text-center text-sm text-gray-600">
          Remembered your password?{" "}
          <a href="#" className="text-primary hover:text-indigo-500 font-medium">
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
}

export default ForgotPage;