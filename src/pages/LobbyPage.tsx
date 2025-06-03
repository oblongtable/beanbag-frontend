import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useWebSocket } from "@/context/WebSocketContext"
import avatarPlaceholder from "../assets/avatar_placeholder.png"
import {  useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Role from "@/enum/role"


function LobbyPage() {
  const navigate = useNavigate();
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
      // If roomDetails become null, it means the user has left or been disconnected
      // Navigate to home page
      navigate("/");
    }
  }, [roomDetails, userId, navigate]);

  const [playerMap, setPlayerMap] = useState<Map<string, { name: string, avatar: string }>>(new Map());

  if (!roomDetails){
    console.log("Room details are not available.");
    return null;
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center pt-4">
        {roomDetails && (
          <>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-4">
              {roomDetails.roomId}
            </h1>
            <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-4">
              {roomDetails.roomName}
            </p>
            <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-4">
              Players: {playerMap.size} / {roomDetails.roomSize}
            </p>
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
          </>
        )}
      </div>
    </>
  )
}

export default LobbyPage
