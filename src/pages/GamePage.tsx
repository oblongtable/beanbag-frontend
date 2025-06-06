import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useWebSocket } from '@/context/WebSocketContext';
// ... other views

const GamePage = () => {
    const { lobbyId } = useParams();
    const username = "Player1";

    // Get everything we need from our custom hook
    const { gameState, connect, sendMessage } = useWebSocket();

    useEffect(() => {
        connect(lobbyId, username);
    }, [lobbyId, username, connect]);


    // Function to start the game, can be passed to LobbyView
    const handleStartGame = () => {
        sendMessage({ type: 'start_game', payload: {} });
    };

    // Render the correct UI based on the gameState from the context
    const renderGameState = () => {
        switch (gameState) {
            case 'lobby':
                return <LobbyView onStartGame={handleStartGame} />;
            case 'question':
                return <QuestionView />;
            // ... cases for 'answer', 'leaderboard', 'game_over'
            case 'connecting':
                return <div>Connecting to lobby {lobbyId}...</div>;
            case 'disconnected':
                return <div>You have been disconnected.</div>;
            case 'error':
                 return <div>Connection error. Please try again.</div>;
            default:
                return <div>Welcome!</div>;
        }
    };

    return <div>{renderGameState()}</div>;
};

export default GamePage;
