import React from "react";
import { Button } from "@/components/ui/button"; // Import Button
import { useWebSocket } from "../../context/WebSocketContext"; // Import useWebSocket

interface TitleScreenProps {
  title: string;
  description: string;
  hostName: string;
  isHost: boolean; // Add isHost prop
}

const TitleScreen: React.FC<TitleScreenProps> = ({ title, description, hostName, isHost }) => {
  const { sendMessage } = useWebSocket();

  const handleForward = () => {
    sendMessage("quiz_forward", {});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-indigo-700 to-blue-800 flex flex-col items-center justify-center p-2 sm:p-4 text-white">
      <div className="w-full max-w-3xl text-center">
        <h1 className="text-5xl sm:text-6xl font-bold mb-4">{title}</h1>
        <p className="text-xl sm:text-2xl mb-8">{description}</p>
        <p className="text-lg sm:text-xl mb-8">Hosted by: {hostName}</p>
        {isHost && (
          <Button onClick={handleForward} className="mt-4 text-lg px-8 py-4">
            Forward
          </Button>
        )}
      </div>
    </div>
  );
};

export default TitleScreen;
