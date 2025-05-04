import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { zodResolver } from "@hookform/resolvers/zod"
import { useContext, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { useWebSocket } from "@/context/WebSocketContext" // Changed import
import avatarPlaceholder from "../assets/avatar_placeholder.png"
import { useParams } from "react-router"; // Use useParams to get lobbyId from URL
import { useEffect } from "react"; // Import useEffect

// Messages
interface Message {
  user_id: string
  message: string
}

const messages: Message[] = [] // This will likely need to be managed by the context later

const ChatFormSchema = z.object({
  bio: z
    .string()
    .max(200, {
      message: "Chat message must not be longer than 200 characters.",
    }),
})

function onSubmit(data: z.infer<typeof ChatFormSchema>) {
  console.log(data)
  // TODO: Send chat message via WebSocket
}

// Player
interface Player {
  user_id: string
  user_name: string
  avatar: string
}

function LobbyPage() {

  const { lobbyId } = useParams<{ lobbyId: string }>(); // Get lobbyId from URL
  const { roomDetails, isConnected, error } = useWebSocket(); // Use hook to get context values

  // Effect to handle cases where roomDetails is not available (e.g., direct access or refresh)
  useEffect(() => {
    if (!roomDetails && !error && isConnected) {
      // If connected but no room details, this might indicate a direct access/refresh.
      // A more robust solution would attempt to rejoin or fetch room details here.
      // For now, we'll just log a message.
      console.log("WebSocket connected but no room details available. Consider rejoining or fetching room info.");
      // TODO: Implement logic to rejoin or fetch room details based on lobbyId from URL
      // Example: connectAndJoinRoom(lobbyId, userName); // Need userName here
    } else if (!roomDetails && !isConnected && !error) {
        // If not connected and no room details, and no error, maybe show a loading state?
         console.log("WebSocket not connected and no room details available.");
    }
  }, [roomDetails, isConnected, error, lobbyId]);

  // Effect to update player list when roomDetails changes
  useEffect(() => {
    if (roomDetails) {
      const updatedPlayers = new Map<string, { name: string, avatar: string }>();
      roomDetails.players.forEach((player) => {
        // Only add players who are not the host to the map
        if (player.user_id !== roomDetails.host_id) {
          updatedPlayers.set(player.user_id, { name: player.user_name, avatar: avatarPlaceholder });
        }
      });
      setPlayerMap(updatedPlayers);
    }
  }, [roomDetails, isConnected, error, lobbyId]); // Dependency array includes roomDetails, isConnected, error, lobbyId

  // Effect to update player list when roomDetails changes
  useEffect(() => {
    console.log("roomDetails changed:", roomDetails); // Log roomDetails
    if (roomDetails) {
      const updatedPlayers = new Map<string, { name: string, avatar: string }>();
      roomDetails.players.forEach((player) => {
        // Only add players who are not the host to the map
        if (player.user_id !== roomDetails.host_id) {
          updatedPlayers.set(player.user_id, { name: player.user_name, avatar: avatarPlaceholder });
        } else {
          console.log("Skipping host:", player.user_name, player.user_id); // Log when host is skipped
        }
      });
      console.log("Updated playerMap:", updatedPlayers); // Log the resulting map
      setPlayerMap(updatedPlayers);
    } else {
      // Clear player map if roomDetails becomes null (e.g., on disconnect)
      console.log("roomDetails is null, clearing playerMap.");
      setPlayerMap(new Map());
    }
  }, [roomDetails]); // Dependency array includes roomDetails


  // Display loading or error state if roomDetails is not available
  if (!roomDetails) {
    if (error) {
      return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
    }
    // You might want a more sophisticated loading indicator
    return <div className="flex justify-center items-center h-screen">Loading room details...</div>;
  }

  // Note: playerMap and messagesList state will need to be updated
  // based on incoming WebSocket messages handled in the context.
  // playerMap is now managed by the useEffect hook.
  const [playerMap, setPlayerMap] = useState<Map<string, { name: string, avatar: string }>>(new Map());
  const [messagesList, _setMessagesList] = useState(messages)
  
  const form = useForm<z.infer<typeof ChatFormSchema>>({
    resolver: zodResolver(ChatFormSchema),
  })


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
      <div className="flex justify-center py-8">
        <ScrollArea>
          <div>
            <Card className="w-[350px]">
              <CardHeader>
                <CardTitle>Chat</CardTitle>
                <CardDescription>Start yapping...</CardDescription>
              </CardHeader>
              <CardContent>
                {messagesList.map(message => (
                  <div className="flex items-start space-x-4 pb-2" key={message.user_id}>
                    <Avatar className="flex-shrink-0">
                      <AvatarImage src={playerMap.get(message.user_id)?.avatar} alt="@shadcn" />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow text-left">
                      <b className="block">{playerMap.get(message.user_id)?.name}</b>
                      <p className="text-gray-700">{message.message}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="grid w-full space-y-4">
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              placeholder="Type your message here."
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit">Submit</Button>
                  </form>
                </Form>
              </CardFooter>
            </Card>
          </div>
        </ScrollArea>
      </div>
    </>
  )
}

export default LobbyPage
