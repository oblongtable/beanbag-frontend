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
import { WebSocketContext } from "@/context/WebSocketContext"
import avatarPlaceholder from "../assets/avatar_placeholder.png"
import { useLocation } from "react-router"


const backendWsBaseUrl = import.meta.env.VITE_AUTH0_AUDIENCE.replace(/^https?:\/\//, 'ws://')  // This is bad help

// Messages
interface Message {
  user_id: string
  message: string
}

const messages: Message[] = []
const ChatFormSchema = z.object({
  bio: z
    .string()
    .max(200, {
      message: "Chat message must not be longer than 200 characters.",
    }),
})

function onSubmit(data: z.infer<typeof ChatFormSchema>) {
  console.log(data)
}

// Player
interface Player {
  user_id: string
  user_name: string
  avatar: string
}

function LobbyPage() {

  const { webSocket, setWebSocket } = useContext(WebSocketContext);
  const location = useLocation();

  // Scary that these aren't immutable
  var roomId = location.state?.roomId  // I cannot get this from the URL as we are using HashRouter
  var roomName = location.state?.roomName
  var roomSize = location.state?.roomSize
  var players: Player[] = location.state?.players

  // I joined directly from the URL
  if (location.state === null) {

    // Probably need to display a Dialog box to login/ choose a Name

    // Reopen websocket connection if closed
    if (webSocket === null) {
      const connection = new WebSocket(`${backendWsBaseUrl}/ws`);
      setWebSocket(connection);

      connection.addEventListener("close", (_event) => {
        setWebSocket(null);
      });

      connection.addEventListener("open", (_event) => {
        console.log("WebSocket connection opened");
      });
    }

    // Use API to get back room info (Not implemented yet)
    roomName = "Please call the API again"
    roomSize = 20
    roomId = "ERROR"

  }

  // Build initial Map of players in the lobby
  const initialPlayers = new Map<string, { name: string, avatar: string }>()
  players.forEach((player) => {
    initialPlayers.set(player.user_id, { name: player.user_name, avatar: avatarPlaceholder })
  })

  const [playerMap, _setPlayerMap] = useState(initialPlayers)
  const [messagesList, _setMessagesList] = useState(messages)

  const form = useForm<z.infer<typeof ChatFormSchema>>({
    resolver: zodResolver(ChatFormSchema),
  })

  return (
    <>
      <div className="flex flex-col items-center justify-center pt-4">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-4">
          {roomId}
        </h1>
        <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-4">
          {roomName}
        </p>
        <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-4">
          Players: {playerMap.size} / {roomSize}
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
