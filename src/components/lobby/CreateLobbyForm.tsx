import { Button } from "../ui/button";
import { useForm } from 'react-hook-form'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@/lib/utils"
import { Input } from "../ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { useEffect, useState } from "react"; // Added useEffect and useState
import { useWebSocket } from "@/context/WebSocketContext"; // Changed import

const formSchema = z.object({
  roomName: z.string().min(1).max(20),
  roomSize: z.number().min(1)
})

interface CreateLobbyFormProps  {
  setOpen: (open: boolean) => void;
  // Assuming user name is available or passed as a prop
  userName: string; // Added userName prop
}

function CreateLobbyForm({ setOpen, userName }: CreateLobbyFormProps) { // Added userName prop

  const { webSocket, connectAndCreateRoom, error } = useWebSocket(); // Updated hook usage
  const [formError, setFormError] = useState<string | null>(null); // State for form-specific errors
  const [isLoading, setIsLoading] = useState<boolean>(false); // State for loading indicator

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomName: "My Lobby",
      roomSize: 8
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    setFormError(null); // Clear previous form errors
    if (webSocket === null) {
      setIsLoading(true); // Start loading
      connectAndCreateRoom(values.roomName, values.roomSize, userName); // Use connectAndCreateRoom
      setIsLoading(false)
      setOpen(false); // Close the modal
    } else {
      // Handle case where websocket is already connected but not in a room?
      // For now, assume if websocket is connected, we are in a room or joining.
      // This might need refinement based on application flow.
      console.log("WebSocket already connected, not creating a new room.");
      setFormError("Already connected to a WebSocket. Please refresh if you are not in a room.");
    }
  }

  // Effect to handle errors from the WebSocket context
  useEffect(() => {
    if (error) {
      setIsLoading(false); // Stop loading on error
      setFormError(error); // Display WebSocket errors in the form
    }
  }, [error]);


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
              <Input type="number" placeholder="Enter a room size" {...field} onChange={e => field.onChange(Number(e.target.value))} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
    {formError && <p className="text-red-500 text-sm">{formError}</p>} {/* Display form errors */}
    <Button type="submit" disabled={isLoading}> {/* Disable button when loading */}
      {isLoading ? 'Creating...' : 'Create Lobby'} {/* Optional: Change button text */}
    </Button>
  </form>
</Form>
)
}

export default CreateLobbyForm
