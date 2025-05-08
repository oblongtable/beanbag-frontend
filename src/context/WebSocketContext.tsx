import React, { createContext, useState, useContext, useEffect } from "react";

interface RoomDetails {
  roomId: string;
  roomName: string;
  roomSize: number;
  players: any[]; // Define a proper type for players if possible
  host_id: string; // Add host_id to RoomDetails interface
}

interface WebSocketContextType {
  webSocket: WebSocket | null;
  isConnected: boolean;
  roomDetails: RoomDetails | null;
  userId: string | null; // Added myId to WebSocketContextType
  connectAndJoinRoom: (roomCode: string, name: string) => void;
  connectAndCreateRoom: (roomName: string, roomSize: number, name: string) => void; // Added create room function
  disconnect: () => void;
  error: string | null;
}

export const WebSocketContext = createContext<WebSocketContextType>({
  webSocket: null,
  isConnected: false,
  roomDetails: null,
  userId: null, // Added myId to default value
  connectAndJoinRoom: () => {},
  connectAndCreateRoom: () => {}, // Added create room function
  disconnect: () => {},
  error: null,
});

// const backendWsBaseUrl = import.meta.env.VITE_AUTH0_AUDIENCE.replace(/^https?:\/\//, 'ws://'); // Use ws:// or wss:// for websockets
const backendWsBaseUrl = "ws://localhost:8080"


export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [roomDetails, setRoomDetails] = useState<RoomDetails | null>(null);
  const [userId, setUserId] = useState<string | null>(null); // Added myId state
  const [error, setError] = useState<string | null>(null);

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
          host_id: data.info.host_id, // Include host_id from the server response
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
              host_id: data.host_id, // Include host_id from the server response
            };
          }
          return null; // Or handle the case where prevDetails is null if necessary
        });
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
                name: name // Assuming the creator also joins the room with a name
            }
        }));
    } else if (connection) {
        connection.onopen = () => {
            connection.send(JSON.stringify({
                type: "create_room",
                info: {
                    room_name: roomName,
                    room_size: roomSize,
                    name: name
                }
            }));
        }
    }
  };


  const disconnect = () => {
    if (webSocket) {
      webSocket.close();
    }
  };

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);


  return (
    <WebSocketContext.Provider value={{ webSocket, isConnected, roomDetails, userId, connectAndJoinRoom, connectAndCreateRoom, disconnect, error }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
