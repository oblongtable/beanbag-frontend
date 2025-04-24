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
import { useContext, useState } from "react";
import { WebSocketContext } from "@/context/WebSocketContext";
import { JoinLobbyAlert } from "@/components/lobby/JoinLobbyAlert";
import { useNavigate } from "react-router";

const backendWsBaseUrl = import.meta.env.VITE_AUTH0_AUDIENCE.replace(/^https?:\/\//, 'http://')  // This is bad help

const formSchema = z.object({
  roomCode: z.string().min(4).max(4),
  name: z.string().min(1).max(20),
});

function HomePage() {

  const navigate = useNavigate();
  const { webSocket, setWebSocket } = useContext(WebSocketContext);
  const [showJoinRoomAlert, setShowJoinRoomAlert] = useState<boolean>(false);
  const [alertMsg, setAlertMsg] = useState<string>("");;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomCode: "",
      name: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);

    if (webSocket === null) {

      const connection = new WebSocket(`${backendWsBaseUrl}/ws`);
      setWebSocket(connection);

      connection.addEventListener("message", (event) => {

        console.log("Message from server ", event.data);
        const data = JSON.parse(event.data);

        if (data.message === "Join room Success") {

          navigate(`/lobby/${values.roomCode}`, {
            state: {
              roomId: values.roomCode,
              roomName: data.info.room_name,
              roomSize: data.info.room_size,
              players: data.info.users_info
            }
          });

        } else {

          if (data.message === "Join room failed: Room not found") {
            setAlertMsg("Room not found");

          } else if (data.message === "Join room failed: Room is full") {
            setAlertMsg("Room is full");

          } else if (data.message === "Join room failed: You have already joined a room") {
            setAlertMsg("You have already joined a room - but you are on the homepage?");

          } else {
            setAlertMsg(`Catastrophic error - please sev1 Ivan. Error: ${data.message}`);
          }
          setShowJoinRoomAlert(!showJoinRoomAlert);

        }

      });

      connection.addEventListener("close", (_event) => {
        setWebSocket(null);
      });

      connection.addEventListener("open", (_event) => {
        connection.send(JSON.stringify({
          type: "join_room",
          info: {
            room_id: values.roomCode,
            name: values.name
          }
        }))

      })
    }

  }

  return (
    <div className="flex flex-col items-center py-10">
      <img
        src={beanbagImage}
        className="w-64 mb-4"
        alt="Beanbag"
      />
      {showJoinRoomAlert && (<JoinLobbyAlert msg={alertMsg} />)}
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
