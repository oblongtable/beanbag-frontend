import React from "react";
import { Button } from "@/components/ui/button";
import { useWebSocket } from "../../context/WebSocketContext"; // Import useWebSocket

interface SectionScreenProps {
  title: string;
  sectionNumber: number;
  isHost: boolean;
}

const SectionScreen: React.FC<SectionScreenProps> = ({ title, sectionNumber, isHost }) => {
  const { sendMessage } = useWebSocket();

  const handleForward = () => {
    sendMessage("quiz_forward", {});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-700 via-teal-700 to-cyan-800 flex flex-col items-center justify-center p-2 sm:p-4 text-white">
      <div className="w-full max-w-3xl text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">Section {sectionNumber}</h1>
        <p className="text-3xl sm:text-4xl font-semibold mb-8">{title}</p>
        {isHost && (
          <Button onClick={handleForward} className="mt-4 text-lg px-8 py-4">
            Forward
          </Button>
        )}
      </div>
    </div>
  );
};

export default SectionScreen;
