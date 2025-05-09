import { accessElf } from "./utils/accessElf";
import { useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { Eye } from "lucide-react";
import { EyeSlash } from "../icons";
import InputGroup from "../components/InputGroup";
import Alert from "../components/Alert";

const LoginPage = () => {
  accessElf.track("LoginPage");

  const auth = useAuth();
  const navigate = useNavigate();

  if (!auth) throw new Error("Auth context is null");
  const { login } = auth;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [viewPassword, setViewPassword] = useState(false);
  const [error, setError] = useState<string>();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await login(email, password);
      console.log("Login Result", res);
      if (res.errors) {
        if (Array.isArray(res.errors)) {
          setError(res.errors[0].message);
        } else {
          setError(res.errors.message);
        }
        return
      }
      navigate("/home");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-4 relative">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={() => navigate("/")}
        >
          X
        </button>
        <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">
          Sign In
        </h2>

        {error && (
          <Alert variant="danger" onDismiss={() => setError(undefined)} timeout={3000}>
            {error}
          </Alert>
        )}

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <div className="flex items-center"></div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex-shrink-0">
              Password
            </label>
            <InputGroup>
              <input
                type={viewPassword ? "text" : "password"}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                variant="outline-primary"
                className="absolute inset-y-0 right-0 flex items-center px-3"
                onClick={() => setViewPassword(!viewPassword)}
              >
                {viewPassword ? <EyeSlash /> : <Eye className="opacity-50" />}
              </Button>
            </InputGroup>
          </div>

          <div>
            <a href="#" className="text-sm text-primary hover:text-indigo-500">
              Forgot password?
            </a>
          </div>

          <Button
            className="w-full bg-primary hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors"
            onClick={handleLogin}
          >
            Sign In
          </Button>
        </form>

        <div className="mt-3 text-center text-sm text-gray-600">
          Don't have an account?
          <Button
            variant="light"
            href="/register"
            className="text-primary hover:text-indigo-500 font-medium ms-2"
          >
            Sign up
          </Button>
        </div>
        <div className="text-center text-sm text-gray-600">
          Forgot your Password?
          <Button
            variant="light"
            href="/forgot"
            className="text-primary hover:text-indigo-500 font-medium ms-2"
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;