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
    } catch (e: any) {
      const message =
        e?.response?.data?.message || e?.message || "Registration failed";
      setError(message);
    }
  };
  return (
    <div>
      <h1>Register</h1>
      <form onSubmit={handleRegister}>
        <Input
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          value={password}
          placeholder="password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit">Create account</Button>
        {error && <p>{error}</p>}
      </form>
    </div>
  );
}

export default Register;
