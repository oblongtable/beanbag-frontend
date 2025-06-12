import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MessageType, useWebSocket } from '@/context/WebSocketContext';
import LobbyPage from './LobbyPage';

const GamePage = () => {
    const { lobbyId } = useParams();

    const { lastMessage, webSocket } = useWebSocket();

    const renderGameState = () => {
        switch (lastMessage?.type) {
            case MessageType.CREATE_ROOM_SUCESS:
            case MessageType.JOIN_ROOM_SUCESS:
                return <LobbyPage />;
            case MessageType.START_GAME:
                return <QuestionView />;
            default:
                return <div>Game is loading!</div>;
        }
    };

    return <div>{renderGameState()}</div>;
};

export default GamePage;
