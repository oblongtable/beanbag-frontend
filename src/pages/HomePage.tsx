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
import { Button } from "../components/ui/button";
import beanbagImage from "../assets/beanbag.png";
import { useEffect, useState } from "react";
import { useWebSocket } from "@/context/WebSocketContext";
import { JoinLobbyAlert } from "@/components/lobby/JoinLobbyAlert";
import { useNavigate } from "react-router";

const formSchema = z.object({
  roomCode: z.string().min(4).max(4),
  name: z.string().min(1).max(20),
});

function HomePage() {

  const navigate = useNavigate();
  const { connectAndJoinRoom, roomDetails, error } = useWebSocket();
  const [alertMsg, setAlertMsg] = useState<string>("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomCode: "",
      name: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    connectAndJoinRoom(values.roomCode, values.name);
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

  return (
    <div className="flex flex-col items-center py-10">
      <img
        src={beanbagImage}
        className="w-64 mb-4"
        alt="Beanbag"
      />
      {error && (<JoinLobbyAlert msg={alertMsg} />)}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-md">
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
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className="w-full" type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  );
}

export default HomePage;
