import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useState, FormEvent } from "react" // Added FormEvent
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input" // Added Input for name prompt
import { useWebSocket } from "@/context/WebSocketContext" // Changed import
import avatarPlaceholder from "../assets/avatar_placeholder.png"
import { useParams, useNavigate } from "react-router-dom"; // Use useParams and useNavigate from react-router-dom
import { useEffect } from "react"; // Import useEffect

// Messages
// interface Message {
//   user_id: string
//   message: string
// }

// const messages: Message[] = [] // This will likely need to be managed by the context later

// const ChatFormSchema = z.object({
//   bio: z
//     .string()
//     .max(200, {
//       message: "Chat message must not be longer than 200 characters.",
//     }),
// })

// function onSubmit(data: z.infer<typeof ChatFormSchema>) {
//   console.log(data)
//   // TODO: Send chat message via WebSocket
// }


function LobbyPage() {
  const { lobbyId } = useParams<{ lobbyId: string }>();
  const navigate = useNavigate(); // Reinstate useNavigate
  const { roomDetails, isConnected, error, userId, connectAndJoinRoom, disconnect } = useWebSocket();

  const [userName, setUserName] = useState<string | null>(localStorage.getItem("userName")); // Try to get name from localStorage
  const [showNamePrompt, setShowNamePrompt] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState<string>("");
  const [attemptedJoin, setAttemptedJoin] = useState<boolean>(false);


  // Effect for joining room via URL
  useEffect(() => {
    // If there's a lobbyId in the URL, no room details yet, not connected, and no error
    if (lobbyId && !roomDetails && !isConnected && !error && !attemptedJoin) {
      if (userName) {
        console.log(`Attempting to join room ${lobbyId} with username ${userName}`);
        connectAndJoinRoom(lobbyId, userName);
        setAttemptedJoin(true); // Mark that an attempt has been made
      } else {
        // If no username, show prompt
        setShowNamePrompt(true);
      }
    }
    // If user navigates away or lobbyId is removed, disconnect
    return () => {
      if (lobbyId && isConnected) { // Disconnect if user was connected to a specific lobby
        // disconnect(); // Decided against auto-disconnect on navigate away for now, context handles unmount
      }
    };
  }, [lobbyId, roomDetails, isConnected, error, userName, connectAndJoinRoom, attemptedJoin, disconnect]);


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
      setShowNamePrompt(false); // Hide prompt if successfully joined
      setAttemptedJoin(true); // Successfully joined
    } else {
      setPlayerMap(new Map());
    }
  }, [roomDetails]);

  const handleNameSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (nameInput.trim() && lobbyId) {
      localStorage.setItem("userName", nameInput.trim()); // Save name to localStorage
      setUserName(nameInput.trim());
      setShowNamePrompt(false);
      console.log(`Attempting to join room ${lobbyId} with new username ${nameInput.trim()}`);
      connectAndJoinRoom(lobbyId, nameInput.trim());
      setAttemptedJoin(true);
    }
  };

  const [playerMap, setPlayerMap] = useState<Map<string, { name: string, avatar: string }>>(new Map());
  // const [messagesList, setMessagesList] = useState(messages);
  // const _orm = useForm<z.infer<typeof ChatFormSchema>>({
  //   resolver: zodResolver(ChatFormSchema),
  // });

  // Loading, Error, and Name Prompt States
  if (lobbyId && showNamePrompt && !isConnected && !roomDetails) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <form onSubmit={handleNameSubmit} className="p-4 border rounded shadow-md bg-white dark:bg-gray-800">
          <h2 className="text-xl mb-4 text-gray-900 dark:text-gray-100">Enter your name to join lobby {lobbyId}</h2>
          <Input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Your Name"
            className="mb-4"
            required
          />
          <Button type="submit">Join Lobby</Button>
        </form>
        {error && <p className="text-red-500 mt-4">Error: {error}</p>}
      </div>
    );
  }

  if (lobbyId && !isConnected && !roomDetails && attemptedJoin && !error) {
    return <div className="flex justify-center items-center h-screen">Connecting to lobby {lobbyId}...</div>;
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-red-500">
        <p>Error: {error}</p>
        <Button onClick={() => navigate('/')} className="mt-4">Go to Homepage</Button> 
      </div>
    );
  }

  if (lobbyId && !roomDetails && isConnected) {
     // This case might happen if connected but room details are not yet set (e.g. waiting for server message)
     // or if connectAndJoinRoom was called but the server hasn't responded with room details yet.
     // It can also happen if the room doesn't exist and the error state from context hasn't propagated yet.
    return <div className="flex justify-center items-center h-screen">Loading room details for {lobbyId}...</div>;
  }

  if (!lobbyId || !roomDetails) {
    // This handles cases where there's no lobbyId in URL or if roomDetails are still null without an error
    // (e.g. initial load before any attempt to join if not coming from a direct link)
    // Or if the user navigated here without a lobbyId (e.g. from create/join on homepage)
    // but then the WebSocket connection dropped or roomDetails became null for some other reason.
    // For now, redirect to home if no lobbyId and no roomDetails.
    // If there IS a lobbyId but no roomDetails and no error, it means we are likely still loading or failed silently.
    // The `attemptedJoin` state helps differentiate.
    if (!lobbyId && !roomDetails) {
        console.log("No lobbyId and no roomDetails, navigating to home.");
        navigate('/'); 
        return null; // Or a loading spinner while navigating
    }
    // If lobbyId exists, but no roomDetails, and we haven't prompted for name or attempted join, show loading.
    // This state should ideally be covered by the name prompt or connecting states.
    if (lobbyId && !roomDetails && !showNamePrompt && !attemptedJoin && !error) {
        return <div className="flex justify-center items-center h-screen">Preparing to join lobby {lobbyId}...</div>;
    }
    // If we attempted to join, but still no roomDetails and no error, it's a loading state.
    if (lobbyId && !roomDetails && attemptedJoin && !error) {
        return <div className="flex justify-center items-center h-screen">Loading room details for {lobbyId}...</div>;
    }
    // Fallback for unexpected states, or if user somehow lands here without lobbyId but context has details (less likely)
    // If there's no lobbyId but we have roomDetails (e.g. from a previous session/navigation), show the lobby.
    // This part of the logic might need refinement based on exact flow from homepage.
    // For now, if no lobbyId and no roomDetails, we navigate home. If roomDetails exist, we show them.
    // The primary goal here is to handle the direct link scenario.
    if (!roomDetails) { // Final catch-all if still no roomDetails
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }
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
        {userId && roomDetails && roomDetails.players.length > 1 && roomDetails.players[1].user_id === userId && (
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
      {/* <div className="flex justify-center py-8">
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
      </div> */}
    </>
  )
}

export default LobbyPage
