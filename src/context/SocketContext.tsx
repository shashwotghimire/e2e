import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { socket } from "@/socket";
import { useContext, createContext, useEffect } from "react";

const SocketContext = createContext(socket);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const token = useSelector((state: RootState) => state.auth.token);
  useEffect(() => {
    if (token) {
      socket.auth = { token };
      socket.connect();
    } else {
      socket.disconnect();
    }
    return () => {
      socket.off("connection");
      socket.off("disconnect");
    };
  }, [token]);
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
