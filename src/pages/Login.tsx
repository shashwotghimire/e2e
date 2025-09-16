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
    <div>
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <Input
          placeholder="email@example.com"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          placeholder="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit">Login</Button>
        {error && <p>{error}</p>}
      </form>
    </div>
  );
}

export default Login;
