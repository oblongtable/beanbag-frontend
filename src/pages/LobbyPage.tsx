import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useState } from "react" // Added FormEvent
import { Button } from "@/components/ui/button"
import { useWebSocket } from "@/context/WebSocketContext" // Changed import
import avatarPlaceholder from "../assets/avatar_placeholder.png"
import {  useNavigate } from "react-router-dom"; // Use useParams and useNavigate from react-router-dom
import { useEffect } from "react"; // Import useEffect
import Role from "@/enum/role"


function LobbyPage() {
  const navigate = useNavigate(); // Reinstate useNavigate
  const { roomDetails, userId } = useWebSocket();
  const [isHost, setIsHost] = useState(false);

  // Effect to update player list when roomDetails changes
  useEffect(() => {
    if (roomDetails) {
      const updatedPlayers = new Map<string, { name: string, avatar: string }>();
      roomDetails.players.forEach((player) => {
        // Only add players who are not the host to the map
        if (player.role !== Role.CREATOR) {
          updatedPlayers.set(player.user_id, { name: player.user_name, avatar: avatarPlaceholder });
        }

        if(player.role === Role.HOST && player.user_id === userId) {
          setIsHost(true);
        }
        
      });
      setPlayerMap(updatedPlayers);
    } else {
      navigate("/")
    }
  }, [roomDetails]);

  const [playerMap, setPlayerMap] = useState<Map<string, { name: string, avatar: string }>>(new Map());

  if (!roomDetails){
    console.log("Room details are not available as you are not connected.");
    return null;
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center pt-4">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-4">
          {roomDetails.roomId} {/* Use roomDetails from context */}
        </h1>
        <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-4">
          {roomDetails.roomName} {/* Use roomDetails from context */}
        </p>
        <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-4">
          Players: {playerMap.size} / {roomDetails.roomSize} {/* Use playerMap size for count and roomSize for available slots */}
        </p>
        {/*
          Assuming the first player in the players array is the current user.
          In a real application, the current user's ID should be obtained from an authentication context or similar reliable source.
        */}
        {isHost && (
          <div className="flex space-x-4 mb-4">
            <Button>Edit Config</Button>
            <Button>Start Quiz</Button>
          </div>
        )}
        <div>
          <Card className="w-[350px]">
            <CardHeader>
              <CardTitle>Players</CardTitle>
              <CardDescription>We in da lobby</CardDescription>
            </CardHeader>
            <CardContent>
              {Array.from(playerMap.entries()).map(([id, player]) => (
                <div className="justify-items-start flex items-center space-x-4 pb-2" key={id}>
                  <Avatar>
                    <AvatarImage src={player["avatar"]} alt="@shadcn" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <p>{player["name"]}</p>
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex justify-between" />
          </Card>
        </div>
      </div>
    </>
  )
}

export default LobbyPage
