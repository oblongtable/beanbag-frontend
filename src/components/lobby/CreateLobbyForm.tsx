import { Button } from "../ui/button";
import { useForm } from 'react-hook-form'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@/lib/utils"
import { Input } from "../ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { useContext } from "react";
import { WebSocketContext } from "@/context/WebSocketContext";
import { useNavigate } from "react-router";

const backendWsBaseUrl = import.meta.env.VITE_AUTH0_AUDIENCE.replace(/^https?:\/\//, 'ws://')  // This is bad help
const formSchema = z.object({
  roomName: z.string().min(1).max(20),
  roomSize: z.number().min(1)
})

interface CreateLobbyFormProps  {
  setOpen: (open: boolean) => void;
}

function CreateLobbyForm({ setOpen }: CreateLobbyFormProps) {

  const navigate = useNavigate(); 
  const {webSocket, setWebSocket} = useContext(WebSocketContext);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomName: "",
      roomSize: 8
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {

    console.log("values", values)

    if(webSocket === null) {
      
      const connection = new WebSocket(`${backendWsBaseUrl}/ws`);
      setWebSocket(connection);
  
      connection.addEventListener("message", (event) => {

        console.log("Message from server ", atob(event.data.toString().substring(1, event.data.length - 1)));
        const data = JSON.parse(atob(event.data.toString().substring(1, event.data.length - 1)));

        if(data.message === "Create room Success") {
          setOpen(false);
          navigate(`/lobby/${data.info.room_id}`);
        }

      });

      connection.addEventListener("close", (_event) => {
        setWebSocket(null);
      });
  
      connection.addEventListener("open", (_event) => {
        connection.send(JSON.stringify({
          type: "create_room",
          info: {
            room_name: values.roomName,
            room_size: values.roomSize
          }
        }))
  
      })

    }

  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn("grid items-start gap-4")}>
        <div className="grid gap-2">
          <FormField
            control={form.control}
            name="roomName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Room Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter a room name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid gap-2">
          <FormField
            control={form.control}
            name="roomSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Room Size</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter a room size" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit">Create Lobby</Button>
      </form>
    </Form>
  )
}

export default CreateLobbyForm
