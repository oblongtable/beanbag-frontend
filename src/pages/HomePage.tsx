import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import beanbagImage from "../assets/beanbag.png";
import { useEffect, useState } from "react";
import { useWebSocket } from "@/context/WebSocketContext";
import { JoinLobbyAlert } from "@/components/lobby/JoinLobbyAlert";
import { useNavigate } from "react-router";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"


const formSchema = z.object({
  roomCode: z.string().min(4).max(4)
});

function HomePage() {

  const navigate = useNavigate();
  const { connectAndJoinRoom, roomDetails, error, roomClosedEvent, resetRoomClosedEvent } = useWebSocket();
  const { userName } = useUser();
  const [alertMsg, setAlertMsg] = useState<string>("");
  const [isRoomClosedDialogVisible, setIsRoomClosedDialogVisible] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomCode: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    connectAndJoinRoom(values.roomCode, userName!);
  }

  useEffect(() => {
    if (roomDetails) {
      navigate(`/lobby/${roomDetails.roomId}`);
    }
  }, [roomDetails, navigate]);

  useEffect(() => {
    if (error) {
      setAlertMsg(error);
    }
  }, [error]);

  // Effect to show the room closed dialog when the event from context is triggered
  useEffect(() => {
    if (roomClosedEvent) {
      setIsRoomClosedDialogVisible(true);
      resetRoomClosedEvent(); // Reset the context event immediately
    }
  }, [roomClosedEvent, resetRoomClosedEvent]);


  return (
    <div className="flex flex-col items-center py-10">
      <h1 className="text-center text-4xl font-bold pb-8">Welcome {userName}!</h1>
      <img
        src={beanbagImage}
        className="w-64 mb-4"
        alt="Beanbag"
      />
      {error && (<JoinLobbyAlert msg={alertMsg} />)}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-sm">
          <FormField
            control={form.control}
            name="roomCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Room Code</FormLabel>
                <FormControl>
                  <Input placeholder="Enter 4 letter room code" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className="w-full" type="submit">Submit</Button>
        </form>
      </Form>

      <Dialog open={isRoomClosedDialogVisible} onOpenChange={setIsRoomClosedDialogVisible}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Room Closed</DialogTitle>
            <DialogDescription>
              The room you were in has been closed by the creator.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setIsRoomClosedDialogVisible(false)}>OK</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default HomePage;
