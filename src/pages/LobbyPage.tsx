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
import TitleScreen from "@/components/play-quiz/TitleScreen";
import SectionScreen from "@/components/play-quiz/SectionScreen";
import PlayScreen from "@/components/play-quiz/PlayScreen";
import ResultsScreen from "@/components/play-quiz/ResultsScreen"; // Import ResultsScreen
import { Answer, QuestionResultInfo } from "@/components/play-quiz/types";

interface LeaderboardEntry {
  ID: string;
  Name: string;
  Score: number;
}

function LobbyPage() {
  const navigate = useNavigate();
  const { roomDetails, userId, sendMessage, currentGameState } = useWebSocket();
  const [currentQuestionAnswers, setCurrentQuestionAnswers] = useState<Answer[]>([]);
  const [currentQuestionResult, setCurrentQuestionResult] = useState<QuestionResultInfo | null>(null);
  const [previousQuestionInfo, setPreviousQuestionInfo] = useState<any>(null);
  const [finalLeaderboard, setFinalLeaderboard] = useState<LeaderboardEntry[] | null>(null); // New state for final leaderboard

  useEffect(() => {
    if (roomDetails) {
      const updatedPlayers = new Map<number, { name: string, avatar: string }>();
      roomDetails.players.forEach((player) => {
        if (player.role !== Role.CREATOR) {
          updatedPlayers.set(player.user_lobby_id, { name: player.user_name, avatar: avatarPlaceholder });
        }
      });
      setPlayerMap(updatedPlayers);
    } else {
      navigate("/");
    }
  }, [roomDetails, userId, navigate]);

  useEffect(() => {
    if (currentGameState?.type === "new_question" && currentGameState.info?.options) {
      const answers = currentGameState.info.options.map((option: string) => ({ text: option, isCorrect: false }));
      setCurrentQuestionAnswers(answers);
      setCurrentQuestionResult(null);
      setPreviousQuestionInfo(currentGameState.info);
      setFinalLeaderboard(null); // Clear final leaderboard when a new question starts
    } else if (currentGameState?.type === "question_result" && currentGameState.info) {
      setCurrentQuestionResult(currentGameState.info);
    } else if (currentGameState?.type === "game_over" && currentGameState.info?.leaderboard) {
      setFinalLeaderboard(currentGameState.info.leaderboard);
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

  // Conditionally render ResultsScreen if currentGameState is "game_over"
  if (currentGameState?.type === "game_over" && finalLeaderboard) {
    return <ResultsScreen leaderboard={finalLeaderboard} />;
  }

  if (currentGameState?.type === "show_title" && roomDetails) {
    const hostPlayer = roomDetails.players.find(player => player.role === Role.HOST);
    const hostName = hostPlayer ? hostPlayer.user_name : "Unknown Host";
    return <TitleScreen title={currentGameState.info.title} description={currentGameState.info.description} hostName={hostName} isHost={roomDetails.isHost} />;
  }

  if (currentGameState?.type === "show_section" && roomDetails) {
    return <SectionScreen title={currentGameState.info.title} sectionNumber={currentGameState.info.id} isHost={roomDetails.isHost} />;
  }

  if ((currentGameState?.type === "new_question" || currentGameState?.type === "question_result") && roomDetails) {
    const questionText = currentGameState.type === "new_question" ? currentGameState.info.questionText : previousQuestionInfo?.questionText;
    const timer = currentGameState.type === "new_question" ? currentGameState.info.timeLimit : 0;
    
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
        questionResultInfo={currentQuestionResult}
        isHost={roomDetails.isHost}
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
