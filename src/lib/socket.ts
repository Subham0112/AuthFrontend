import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;
let lastJoined: number | null = null;

// Singleton socket shared across the whole app (Navbar, modals, pages…).
// One connection per tab instead of one per component.
// Concept:
//   - every logged-in user "joins" a private room called `user_<id>`
//   - the server emits friend events into that room, so only that user
//     receives them (like a personal notification channel)
export const connectSocket = (userId: number): Socket => {
  if (!socket) {
    socket = io(import.meta.env.VITE_BACKEND_API, {
      withCredentials: true,
    });
    // Whenever the connection is (re)established, re-join the current
    // user's room so we never miss events after a reconnect.
    socket.on("connect", () => {
      if (lastJoined !== null) socket?.emit("join", lastJoined);
    });
  } else if (!socket.connected) {
    socket.connect();
  }

  if (socket.connected) {
    socket.emit("join", userId);
  }
  lastJoined = userId;
  return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = (): void => {
  socket?.disconnect();
  socket = null;
  lastJoined = null;
};