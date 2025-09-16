import { Navigate, Outlet } from "react-router-dom";
import type { RootState } from "@/redux/store";
import { useSelector } from "react-redux";

function Protected() {
  const token = useSelector((state: RootState) => state.auth.token);
  return token ? <Outlet /> : <Navigate to="/landing" replace />;
}

export default Protected;
