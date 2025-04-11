import { Button } from "../ui/button";
import { useForm } from 'react-hook-form'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@/lib/utils"
import { Input } from "../ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import useWebSocket from "@/hooks/useWebSocket";


const formSchema = z.object({
  roomName: z.string().min(1).max(20),
  roomSize: z.number().min(1)
})

function CreateLobbyForm({ className }: React.ComponentProps<"form">) {

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomName: "",
      roomSize: 8
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {

    const socket = useWebSocket()

    socket.send(JSON.stringify({
      type: "create_room",
      payload: {
        RoomName: values.roomName,
        RoomSize: values.roomSize
      }
    }));

  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn("grid items-start gap-4", className)}>
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
