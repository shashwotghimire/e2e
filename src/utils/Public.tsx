import type { RootState } from "@/redux/store";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
function Public() {
  const token = useSelector((state: RootState) => state.auth.token);
  if (token) {
    return <Navigate to={"/"} replace />;
  }
  return <Outlet />;
}

export default Public;
