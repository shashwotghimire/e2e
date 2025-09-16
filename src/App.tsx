import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Landing from "./pages/Landing";
import Protected from "./utils/Protected";
import Public from "./utils/Public";
function App() {
  return (
    <Routes>
      <Route path="/landing" element={<Landing />} />ß
      <Route element={<Public />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      <Route element={<Protected />}>
        <Route path="/" element={<Home />} />
      </Route>
    </Routes>
  );
}

export default App;
