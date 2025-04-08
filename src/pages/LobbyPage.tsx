import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRef, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
 
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"


// Placeholder
const players = [
    {
        id: 1,
        name: "Jane Doe",
        avatar: "https://static.wikia.nocookie.net/zenless-zone-zero/images/5/59/Avatar_Jane_Doe.png"
    },
    {
        id: 2,
        name: "Hoshimi Miyabi",
        avatar: "https://static.wikia.nocookie.net/zenless-zone-zero/images/7/79/Avatar_Hoshimi_Miyabi.png"
    },
    {
        id: 3,
        name: "Tsukishiro Yanagi",
        avatar: "https://static.wikia.nocookie.net/zenless-zone-zero/images/a/a3/Avatar_Tsukishiro_Yanagi.png"
    },
    {
        id: 4,
        name: "Zhu Yuan",
        avatar: "https://static.wikia.nocookie.net/zenless-zone-zero/images/5/53/Avatar_Zhu_Yuan.png"
    }
]

// Placeholder
const messages = [
    {
        id: 1,
        user_id: 1,
        message: "Hello, how are you?"
    },
    {
        id: 2,
        user_id: 2,
        message: "I'm fine, thanks!"
    },
    {
        id: 3,
        user_id: 3,
        message: "What about you?"
    }
]

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

function LobbyPage() {

    // Build initial Map of players in the lobby
    const initialPlayers = new Map<number, { name: string, avatar: string }>()
    players.forEach((player) => {
        initialPlayers.set(player.id, { name: player.name, avatar: player.avatar })
    })

    const [playerMap, setPlayerMap] = useState(initialPlayers)
    const [messagesList, setMessagesList] = useState(messages)

    const form = useForm<z.infer<typeof ChatFormSchema>>({
        resolver: zodResolver(ChatFormSchema),
    })

    return (
        <>
            <div className="flex justify-center">
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
                                    <div className="flex items-start space-x-4 pb-2" key={message.id}>
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
