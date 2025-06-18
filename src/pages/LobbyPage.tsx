import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useWebSocket } from "@/context/WebSocketContext"
import avatarPlaceholder from "../assets/avatar_placeholder.png"
import {  useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Role from "@/enum/role"
import TitleScreen from "@/components/play-quiz/TitleScreen"; // Import TitleScreen
import SectionScreen from "@/components/play-quiz/SectionScreen"; // Import SectionScreen
import PlayScreen from "@/components/play-quiz/PlayScreen"; // Import PlayScreen
import { Answer, QuestionResultInfo } from "@/components/play-quiz/types"; // Import Answer and QuestionResultInfo types

function LobbyPage() {
  const navigate = useNavigate();
  const { roomDetails, userId, sendMessage, currentGameState } = useWebSocket(); // Destructure sendMessage and currentGameState
  const [currentQuestionAnswers, setCurrentQuestionAnswers] = useState<Answer[]>([]); // New state for current question answers
  const [currentQuestionResult, setCurrentQuestionResult] = useState<QuestionResultInfo | null>(null); // New state for question result
  const [previousQuestionInfo, setPreviousQuestionInfo] = useState<any>(null); // New state for previous question info

  // Effect to update player list when roomDetails changes
  useEffect(() => {
    if (roomDetails) {
      const updatedPlayers = new Map<number, { name: string, avatar: string }>();
      roomDetails.players.forEach((player) => {
        // Only add players who are not the host to the map
        if (player.role !== Role.CREATOR) {
          updatedPlayers.set(player.user_lobby_id, { name: player.user_name, avatar: avatarPlaceholder });
        }
      });
      setPlayerMap(updatedPlayers);
    } else {
      // If roomDetails become null, it means the user has left or been disconnected
      // Navigate to home page
      navigate("/");
    }
  }, [roomDetails, userId, navigate]);

  // Effect to update currentQuestionAnswers, currentQuestionResult, and previousQuestionInfo when currentGameState changes
  useEffect(() => {
    if (currentGameState?.type === "new_question" && currentGameState.info?.options) {
      const answers = currentGameState.info.options.map((option: string) => ({ text: option, isCorrect: false }));
      setCurrentQuestionAnswers(answers);
      setCurrentQuestionResult(null); // Clear previous result
      setPreviousQuestionInfo(currentGameState.info); // Store current question info as previous
    } else if (currentGameState?.type === "question_result" && currentGameState.info) {
      setCurrentQuestionResult(currentGameState.info);
    }
  }, [currentGameState]);

  const [playerMap, setPlayerMap] = useState<Map<number, { name: string, avatar: string }>>(new Map());

  const handleStartQuiz = () => {
    if (roomDetails) {
      sendMessage("start_quiz", { room_id: roomDetails.roomId });
    }
  };

  if (!roomDetails){
    console.log("Room details are not available.");
    return null;
  }

  // Conditionally render TitleScreen if currentGameState is "show_title"
  if (currentGameState?.type === "show_title" && roomDetails) {
    const hostPlayer = roomDetails.players.find(player => player.role === Role.HOST);
    const hostName = hostPlayer ? hostPlayer.user_name : "Unknown Host";
    return <TitleScreen title={currentGameState.info.title} description={currentGameState.info.description} hostName={hostName} isHost={roomDetails.isHost} />;
  }

  // Conditionally render SectionScreen if currentGameState is "show_section"
  if (currentGameState?.type === "show_section" && roomDetails) {
    return <SectionScreen title={currentGameState.info.title} sectionNumber={currentGameState.info.id} isHost={roomDetails.isHost} />;
  }

  // Conditionally render PlayScreen if currentGameState is "new_question" or "question_result"
  if ((currentGameState?.type === "new_question" || currentGameState?.type === "question_result") && roomDetails) {
    const questionText = currentGameState.type === "new_question" ? currentGameState.info.questionText : previousQuestionInfo?.questionText;
    const timer = currentGameState.type === "new_question" ? currentGameState.info.timeLimit : 0; // Timer stops on result
    
    // If it's a question_result, update the answers to mark the correct one
    let answersToPass = currentQuestionAnswers;
    if (currentGameState.type === "question_result" && currentQuestionResult) {
      answersToPass = currentQuestionAnswers.map((answer, index) => ({
        ...answer,
        isCorrect: index === currentQuestionResult.correctOptionIndex,
      }));
    }

    return (
      <PlayScreen
        questionText={questionText}
        answers={answersToPass}
        timer={timer}
        questionResultInfo={currentQuestionResult} // Pass the result info
        isHost={roomDetails.isHost} // Pass isHost for the forward button
      />
    );
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center pt-4">
        {roomDetails && (
          <>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-4">
              {roomDetails.roomId}
            </h1>
            <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-4">
              {roomDetails.roomName}
            </p>
            <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-4">
              Players: {playerMap.size} / {roomDetails.roomSize}
            </p>
            {roomDetails.isHost && (
              <div className="flex space-x-4 mb-4">
                <Button>Edit Config</Button>
                <Button onClick={handleStartQuiz}>Start Quiz</Button>
              </div>
            )}
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
          </>
        )}
      </div>
    </>
  )
}

export default LobbyPage
