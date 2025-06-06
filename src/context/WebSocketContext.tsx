import Role from "@/enum/role";
import React, { createContext, useState, useContext, useCallback } from "react";


enum MessageType {
  JOIN_ROOM = "join_room",
  JOIN_ROOM_SUCESS = "join_room_success",
  JOIN_ROOM_FAILED = "join_room_failed",
  CREATE_ROOM = "create_room",
  CREATE_ROOM_SUCESS = "create_room_success",
  CREATE_ROOM_FAILED = "create_room_failed",
  ROOM_STATUS_UPDATE = "room_status_update",
  ROOM_SHUTDOWN = "room_shutdown",
  START_GAME = "start_game",

}

interface BaseWebSocketMessage {
  type: MessageType;
  message: string
}

interface JoinRoomSuccessMessage extends BaseWebSocketMessage  {
  type: MessageType.JOIN_ROOM_SUCESS,
  info: {
    roomId: string,
    roomName: string,
    roomSize: number,
    user_info: Player[],
    user_id: string
    host_id: string
  }
}

interface CreateRoomSucess extends BaseWebSocketMessage {
  type: MessageType.CREATE_ROOM_SUCESS,
  info: {
    roomId: string,
    roomName: string,
    roomSize: number,
    user_info: Player[]
    user_id: string
    host_id: string
  }
}

interface CreateRoomFailedMessage extends BaseWebSocketMessage {
  type: MessageType.CREATE_ROOM_FAILED,
}

interface JoinRoomFailedMessage extends BaseWebSocketMessage {
  type: MessageType.JOIN_ROOM_FAILED,
}

interface RoomShutdownMessage extends BaseWebSocketMessage {
  type: MessageType.ROOM_SHUTDOWN,
}

interface RoomStatusUpdate extends BaseWebSocketMessage {
  type: MessageType.ROOM_STATUS_UPDATE,
  users_info: Player[],
  host_id: string
}

export type WebSocketMessage = JoinRoomSuccessMessage | CreateRoomSucess | CreateRoomFailedMessage | RoomStatusUpdate | JoinRoomFailedMessage | RoomShutdownMessage;

interface Player {
  user_id: string;
  user_name: string;
  role: Role;
}

interface RoomDetails {
  roomId: string;
  roomName: string;
  roomSize: number;
  players: Player[];
  hostId: string;
  userId: string
}

interface WebSocketContextType {
  webSocket: WebSocket | null;
  isConnected: boolean;
  roomDetails: RoomDetails | null;
  joinRoom: (roomCode: string, name: string) => void;
  createRoom: (roomName: string, roomSize: number, name: string) => void;
  disconnect: () => void;
  error: string | null;
  roomClosedEvent: boolean;
  lastMessage: WebSocketMessage | null;
}

export const WebSocketContext = createContext<WebSocketContextType>({
  webSocket: null,
  isConnected: false,
  roomDetails: null,
  joinRoom: () => {},
  createRoom: () => {},
  disconnect: () => {},
  error: null,
  roomClosedEvent: false,
  lastMessage: null
});

// const backendWsBaseUrl = import.meta.env.VITE_AUTH0_AUDIENCE.replace(/^https?:\/\//, 'ws://'); // Use ws:// or wss:// for websockets
const backendWsBaseUrl = import.meta.env.VITE_WEBSOCKET_URL || "wss://beanbag-backend-production.up.railway.app"

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [roomDetails, setRoomDetails] = useState<RoomDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [roomClosed, setRoomClosed] = useState<boolean>(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  const connect = useCallback((onOpenCallback: (socket: WebSocket) => void) => {
    if (webSocket) {
      if (webSocket.readyState === WebSocket.OPEN) {
          onOpenCallback(webSocket);
      } else {
          webSocket.addEventListener('open', () => onOpenCallback(webSocket), { once: true });
      }
      return;
    }

    const newWebsocket = new WebSocket(`${backendWsBaseUrl}/ws`);

    newWebsocket.onopen = () => {
      console.log("WebSocket connected.");
      setIsConnected(true);
      setWebSocket(newWebsocket);
      onOpenCallback(newWebsocket);
    };

    newWebsocket.onmessage = (event) => {
      console.log("Message from server ", event.data);
      const data = JSON.parse(event.data) as WebSocketMessage;
      setLastMessage(data);

      switch (data.type) {
        case MessageType.CREATE_ROOM_SUCESS:
        case MessageType.JOIN_ROOM_SUCESS:
          setRoomDetails({
            roomId: data.info.roomId,
            roomName: data.info.roomName,
            roomSize: data.info.roomSize,
            players: data.info.user_info,
            hostId: data.info.host_id,
            userId: data.info.user_id
          });
          setRoomClosed(false);
          break;
        case MessageType.CREATE_ROOM_FAILED:
        case MessageType.JOIN_ROOM_FAILED:
          setError(data.message);
          newWebsocket.close();
          break;
        case MessageType.ROOM_STATUS_UPDATE:
          setRoomDetails(prevDetails => {
            if (prevDetails) {
              return {
                ...prevDetails,
                players: data.users_info,
                host_id: data.host_id,
              };
            }
            return null;
          });
          break;
        case MessageType.ROOM_SHUTDOWN:
          setRoomClosed(true);
          setTimeout(() => {
            disconnect();
          }, 50)
          break;
        default:
          break;
      }
    };

    newWebsocket.onerror = (event) => {
      console.error("WebSocket error:", event);
      setError("WebSocket connection error.");
      setIsConnected(false);
      setRoomClosed(true)
      setWebSocket(null);
      setRoomDetails(null);
    };

    newWebsocket.onclose = (event) => {
      console.log("WebSocket disconnected:", event.code, event.reason);
      setIsConnected(false);
      setWebSocket(null);
      setRoomDetails(null);
      setRoomClosed(true)
      if (!event.wasClean) {
        setError(`WebSocket connection closed unexpectedly. Code: ${event.code}, Reason: ${event.reason}`);
      } else {
        setError(null);
      }
    };

    setWebSocket(newWebsocket);
  }, [webSocket]);

  const joinRoom = (roomCode: string, name: string) => {
    const message = {
        type: "join_room",
        info: { room_id: roomCode, name: name }
    };
    connect((socket: WebSocket) => socket.send(JSON.stringify(message)));
};

const createRoom = (roomName: string, roomSize: number, name: string) => {
    const message = {
        type: "create_room",
        info: { room_name: roomName, room_size: roomSize, username: name }
    };
    connect((socket: WebSocket) => socket.send(JSON.stringify(message)));
  };

 const disconnect = () => {
    setRoomDetails(null); 
    setIsConnected(false);
    setError(null);
    if (webSocket) {
      webSocket.close(1000, "Normal Closure"); 
    }
    setWebSocket(null);
  };


  return (
    <WebSocketContext.Provider value={{ webSocket, isConnected, roomDetails, joinRoom, createRoom, disconnect, error, roomClosedEvent: roomClosed, lastMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
