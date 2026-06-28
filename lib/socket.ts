"use client";

import { io, type Socket } from "socket.io-client";
import { getSocketBaseUrl } from "@/lib/api-config";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const url = getSocketBaseUrl();
    socket = io(url, { autoConnect: true, transports: ["websocket", "polling"] });
  }
  return socket;
}

export function joinUserRoom(userId: string) {
  if (!userId) return;
  getSocket().emit("join", userId);
}

export function joinGroupRoom(groupId: string) {
  if (!groupId) return;
  getSocket().emit("joinGroup", groupId);
}
