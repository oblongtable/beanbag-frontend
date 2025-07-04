import Role from "@/enum/role";
import React, { createContext, useState, useContext } from "react";


interface Player {
  user_name: string;
  role: Role;
  user_lobby_id: number
}

interface RoomDetails {
  roomId: string;
  roomName: string;
  roomSize: number;
  players: Player[];
  isHost: boolean; // Add isHost field
}

interface WebSocketContextType {
  webSocket: WebSocket | null;
  isConnected: boolean;
  roomDetails: RoomDetails | null;
  userId: string | null; // Added myId to WebSocketContextType
  currentGameState: { type: string; info: any } | null; // New: current game state
  connectAndJoinRoom: (roomCode: string, name: string) => void;
  connectAndCreateRoom: (roomName: string, roomSize: number, name: string) => void; // Added create room function
  disconnect: () => void;
  sendMessage: (type: string, info: object) => void; // Add sendMessage
  error: string | null;
  roomClosedEvent: boolean;
  resetRoomClosedEvent: () => void;
}

export const WebSocketContext = createContext<WebSocketContextType>({
  webSocket: null,
  isConnected: false,
  roomDetails: null,
  userId: null,
  currentGameState: null, // Initialize
  connectAndJoinRoom: () => {},
  connectAndCreateRoom: () => {},
  disconnect: () => {},
  sendMessage: () => {}, // Add sendMessage default
  error: null,
  roomClosedEvent: false,
  resetRoomClosedEvent: () => {},
});

// const backendWsBaseUrl = import.meta.env.VITE_AUTH0_AUDIENCE.replace(/^https?:\/\//, 'ws://'); // Use ws:// or wss:// for websockets
const backendWsBaseUrl = import.meta.env.VITE_WEBSOCKET_URL || "wss://beanbag-backend-production.up.railway.app"


export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [roomDetails, setRoomDetails] = useState<RoomDetails | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentGameState, setCurrentGameState] = useState<{ type: string; info: any } | null>(null); // New state
  const [error, setError] = useState<string | null>(null);
  const [roomClosedEvent, setRoomClosedEvent] = useState<boolean>(false);

  const setupWebSocket = () => {
    if (webSocket) {
      console.log("WebSocket already connected.");
      return webSocket;
    }

    setError(null); // Clear previous errors
    const connection = new WebSocket(`${backendWsBaseUrl}/ws`);

    connection.onopen = () => {
      console.log("WebSocket connected.");
      setIsConnected(true);
    };

    connection.onmessage = (event) => {
      console.log("Message from server ", event.data);
      const data = JSON.parse(event.data);

      if (data.message === "Join room Success" || data.message === "Create room Success") {
        setRoomDetails({
          roomId: data.info.room_id, // Use room_id from the server response
          roomName: data.info.room_name,
          roomSize: data.info.room_size,
          players: data.info.users_info,
          isHost: false, // Initialize isHost to false, will be updated by room_status_update
        });
        setUserId(data.info.user_id); // Set myId from the server response
        // Navigation will happen in the component consuming the context
      } else if (data.message && (data.message.startsWith("Join room failed:") || data.message.startsWith("Create room failed:"))) {
        setError(data.message);
        connection.close(); // Close connection on failure
      } else if (data.type === "room_status_update") { // Handle room status updates
        setRoomDetails(prevDetails => {
          if (prevDetails) {
            return {
              ...prevDetails,
              players: data.users_info, // Update players list
              isHost: data.is_host, // Update isHost field
            };
          }
          return null; // Or handle the case where prevDetails is null if necessary
        });
      } else if (data.type === "room_shutdown") {
        console.log("Room shutdown message received.");
        setRoomClosedEvent(true);
        // Delay disconnecting to allow state to propagate and trigger dialog in HomePage
        setTimeout(() => {
          disconnect();
        }, 50); // Adjust delay as needed
      } else if (data.type === "show_title") {
        setCurrentGameState({ type: data.type, info: data.info });
      } else if (data.type === "show_section") { // Handle show_section message
        setCurrentGameState({ type: data.type, info: data.info });
      } else if (data.type === "new_question") { // Handle new_question message
        setCurrentGameState({ type: data.type, info: data.info });
      } else if (data.type === "question_result") { // Handle question_result message
        setCurrentGameState({ type: data.type, info: data.info });
      } else if (data.type === "game_over") { // Handle game_over message
        setCurrentGameState({ type: data.type, info: data.info });
      }
      // Handle other message types here later (e.g., game state updates)
    };

    connection.onerror = (event) => {
      console.error("WebSocket error:", event);
      setError("WebSocket connection error.");
      setIsConnected(false);
      setWebSocket(null);
      setRoomDetails(null);
    };

    connection.onclose = (event) => {
      console.log("WebSocket disconnected:", event.code, event.reason);
      setIsConnected(false);
      setWebSocket(null);
      setRoomDetails(null);
      if (!event.wasClean) {
        setError(`WebSocket connection closed unexpectedly. Code: ${event.code}, Reason: ${event.reason}`);
      } else {
        setError(null);
      }
    };

    setWebSocket(connection);
    return connection;
  };

  const resetRoomClosedEvent = () => {
    setRoomClosedEvent(false);
  };


  const connectAndJoinRoom = (roomCode: string, name: string) => {
    const connection = setupWebSocket();
    if (connection && connection.readyState === WebSocket.OPEN) {
       connection.send(JSON.stringify({
        type: "join_room",
        info: {
          room_id: roomCode,
          name: name
        }
      }));
    } else if (connection) {
        connection.onopen = () => {
             connection.send(JSON.stringify({
                type: "join_room",
                info: {
                room_id: roomCode,
                name: name
                }
            }));
        }
    }
  };

  const connectAndCreateRoom = (roomName: string, roomSize: number, name: string) => {
    const connection = setupWebSocket();
     if (connection && connection.readyState === WebSocket.OPEN) {
        connection.send(JSON.stringify({
            type: "create_room",
            info: {
                room_name: roomName,
                room_size: roomSize,
                username: name // Assuming the creator also joins the room with a name
            }
        }));
    } else if (connection) {
        connection.onopen = () => {
            connection.send(JSON.stringify({
                type: "create_room",
                info: {
                    room_name: roomName,
                    room_size: roomSize,
                    username: name
                }
            }));
        }
    }
  };


  const disconnect = () => {
    setCurrentGameState(null);
    setRoomDetails(null); // Clear room details on disconnect
    setUserId(null); // Clear myId on disconnect
    setIsConnected(false);
    setError(null); // Clear error on disconnect
    if (webSocket) {
      webSocket.close(1000, "Normal Closure"); // Close with code 1000 for normal closure
    }
    setWebSocket(null); // Clear the WebSocket reference on close
  };

  const sendMessage = (type: string, info: object) => {
    if (webSocket && webSocket.readyState === WebSocket.OPEN) {
      webSocket.send(JSON.stringify({ type, info }));
    } else {
      console.error("WebSocket is not connected or not open.");
    }
  };

  return (
    <WebSocketContext.Provider value={{ webSocket, isConnected, roomDetails, userId, currentGameState, connectAndJoinRoom, connectAndCreateRoom, disconnect, sendMessage, error, roomClosedEvent, resetRoomClosedEvent }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
