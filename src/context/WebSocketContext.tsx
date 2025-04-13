import React, { createContext } from "react";

interface WebSocketContextType {
  webSocket: WebSocket | null;
  setWebSocket: React.Dispatch<React.SetStateAction<WebSocket | null>>;
}

export const WebSocketContext = createContext<WebSocketContextType>({webSocket: null, setWebSocket: () => null});
