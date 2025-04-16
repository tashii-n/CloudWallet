// utils/socket.ts
import { io, Socket } from "socket.io-client";
import { getAuthData } from "./auth/auth";
import { CONFIG } from "./constants";

let socket: Socket | null = null;

export const initSocket = async (): Promise<Socket> => {
  const authData = await getAuthData();

  if (!authData || !authData.accessToken) {
    throw new Error("No access token available for socket connection");
  }

  if (!socket) {
    const socketUrl = CONFIG.WEBSOCKET_URL;
    socket = io(socketUrl, {
      auth: { token: authData.accessToken },
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected with ID:", socket?.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });
  } else {
    socket.auth = { token: authData.accessToken };
    socket.connect(); // reconnect with new token
  }

  return socket;
};

export const getSocket = (): Socket | null => socket;
