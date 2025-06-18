import { useState, useEffect } from "react";
import Answers from "./Answers";
import Question from "./Question";
import { Answer } from "./types";
import { useWebSocket } from "../../context/WebSocketContext"; // Import useWebSocket
import { QuestionResultInfo, LeaderboardEntry } from "./types"; // Import types
import { Button } from "@/components/ui/button"; // Import Button
import { TableHead, TableCell } from "@/components/ui/table"; // Import TableHead and TableCell

interface PlayScreenProps {
    questionText: string;
    answers: Answer[];
    timer: number;
    questionResultInfo?: QuestionResultInfo | null; // New prop for result info
    isHost: boolean; // New prop for host status
}

const PlayScreen = ({questionText, answers, timer, questionResultInfo, isHost}: PlayScreenProps) => {
    const { sendMessage } = useWebSocket(); // Destructure sendMessage
    const [timeLeft, setTimeLeft] = useState(timer);
    const [selectedAnswerId, setSelectedAnswerId] = useState<number | null>(null); // Use ID for selected answer
    const [showResult, setShowResult] = useState(false);

    // Effect to reset state when a new question arrives
    useEffect(() => {
        setTimeLeft(timer); // Reset timer
        setSelectedAnswerId(null); // Clear selected answer ID
        setShowResult(false); // Hide results
    }, [questionText, timer]); // Depend on questionText and timer to detect new question

    useEffect(() => {
        if (timeLeft === 0 && !showResult && !questionResultInfo) {
            setShowResult(true);
        }

        if (timeLeft > 0 && !showResult && !questionResultInfo) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft, showResult, questionResultInfo]);

    useEffect(() => {
        if (questionResultInfo) {
            setShowResult(true);
        }
    }, [questionResultInfo]);

    const handleAnswerSelect = (answer: Answer, index: number) => {
        if (showResult || questionResultInfo) return;
        setSelectedAnswerId(answer.id); // Store the ID of the selected answer
        setShowResult(true);
        sendMessage("submit_answer", { answer_index: index });
    };

    const handleForward = () => {
      sendMessage("quiz_forward", {});
    };
       
    // Convert leaderboard object to an array and sort by score
    const sortedLeaderboard = questionResultInfo ? Object.values(questionResultInfo.leaderboard).sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.Score - a.Score) : [];

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-700 via-indigo-700 to-blue-800 flex flex-col items-center justify-center p-2 sm:p-4 text-white">
        <div className="w-full max-w-3xl mb-4 md:mb-6">
            {!questionResultInfo && ( // Hide timer if question results are shown
              <div className="flex justify-center mb-3 md:mb-4">
                <div className={`text-2xl sm:text-3xl font-bold ${timeLeft > 0 ? 'bg-red-500' : 'bg-gray-500'} px-4 py-2 sm:px-6 sm:py-3 rounded-full shadow-lg`}>
                  {timeLeft > 0 ? timeLeft : '-'}
                </div>
              </div>
            )}
           <Question questionText={questionText} />
        </div>
           <Answers
            answers={answers}
            onAnswerSelect={handleAnswerSelect}
            selectedAnswerId={selectedAnswerId}
            showResult={showResult}
          />

        {questionResultInfo && (
          <div className="w-full max-w-3xl mt-6">
            {/* Explanation Box */}
            <div className="bg-indigo-900 p-6 rounded-lg shadow-xl mb-6">
              <h2 className="text-2xl sm:text-3xl font-semibold mb-4 text-center">Explanation:</h2>
              <p className="text-lg sm:text-xl text-center">{questionResultInfo.explanation}</p>
            </div>

            {/* Leaderboard Box */}
            <div className="bg-slate-800 p-6 rounded-lg shadow-xl mb-6 mx-auto max-w-md"> {/* Changed background color */}
              <h2 className="text-2xl sm:text-3xl font-semibold mb-4 text-center">Leaderboard</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-slate-700 rounded-lg overflow-hidden"><thead><tr className="bg-slate-600"><TableHead>Rank</TableHead><TableHead>Player</TableHead><TableHead>Score</TableHead></tr></thead><tbody>{sortedLeaderboard.map((entry, index) => (<tr key={entry.ID} className={index % 2 === 0 ? 'bg-slate-700' : 'bg-slate-600'}><TableCell>{index + 1}</TableCell><TableCell>{entry.Name}</TableCell><TableCell>{entry.Score}</TableCell></tr>))}</tbody></table>
              </div>
              {isHost && (
                <Button onClick={handleForward} className="mt-6 text-lg px-8 py-4 bg-green-600 hover:bg-green-700 w-full">
                  Next Question / End Quiz
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    );
};

export default PlayScreen;
