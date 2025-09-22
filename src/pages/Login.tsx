import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useDispatch } from "react-redux";
import { loginSuccess } from "@/redux/slices/authSlice";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const url = import.meta.env.VITE_API_BASE_URL;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await axios.post(`${url}/api/auth/login`, {
        email,
        password,
      });
      dispatch(loginSuccess({ user: res.data.user, token: res.data.token }));
      navigate("/");
    } catch (e: any) {
      const message =
        e?.response?.data?.message || e?.message || "Login failed";
      setError(message);
    }
  };
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground text-center">
            Sign in
          </h1>
          <p className="mt-2 text-sm text-muted-foreground text-center">
            Enter your credentials to access your account
          </p>
        </div>
        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div className="space-y-4">
            <Input
              placeholder="email@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground focus:border-transparent bg-background text-foreground"
            />
            <Input
              placeholder="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground focus:border-transparent bg-background text-foreground"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-foreground text-background hover:opacity-90 px-4 py-3 rounded-lg transition-colors font-medium"
          >
            Sign in
          </Button>
          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
        </form>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <a
              href="/register"
              className="font-medium text-foreground hover:opacity-90"
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
