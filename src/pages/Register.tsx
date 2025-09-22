import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import axios from "axios";
import { loginSuccess } from "@/redux/slices/authSlice";

function Register() {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const url = import.meta.env.VITE_API_BASE_URL;
  const handleRegister = async (e: FormEvent) => {
    setError(null);

    e.preventDefault();
    try {
      const res = await axios.post(`${url}/api/auth/register`, {
        username,
        email,
        password,
      });
      dispatch(loginSuccess({ user: res.data.user, token: res.data.token }));
      navigate("/");
      setUsername("");
      setEmail("");
      setPassword("");
    } catch (e: any) {
      const message =
        e?.response?.data?.message || e?.message || "Registration failed";
      setError(message);
    }
  };
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground text-center">
            Create account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground text-center">
            Sign up to start chatting with others
          </p>
        </div>
        <form onSubmit={handleRegister} className="mt-8 space-y-6">
          <div className="space-y-4">
            <Input
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground focus:border-transparent bg-background text-foreground"
            />
            <Input
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground focus:border-transparent bg-background text-foreground"
            />
            <Input
              type="password"
              value={password}
              placeholder="password"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground focus:border-transparent bg-background text-foreground"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-foreground text-background hover:opacity-90 px-4 py-3 rounded-lg transition-colors font-medium"
          >
            Create account
          </Button>
          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
        </form>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-medium text-foreground hover:opacity-90"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
