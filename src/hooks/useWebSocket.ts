import { useEffect, useState } from "react";

function useWebSocket(): WebSocket {

    const [socket, setSocket] = useState<WebSocket | null>(null);
    useEffect(() => {

        if (socket === null) {
            const newSocket = new WebSocket("ws://localhost:8080/api/ws");
            setSocket(newSocket);

        }

        if (socket !== null) {

            socket.addEventListener("closed", (_) => {
                setSocket(null);

            })

        }

    }, []);

    return socket!;
}

export default useWebSocket;
