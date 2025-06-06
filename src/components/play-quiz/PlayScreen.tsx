import { useState, useEffect } from "react";
import Answers from "./Answers";
import Question from "./Question";
import { Answer } from "./types";

interface PlayScreenProps {
    questionText: string;
    answers: Answer[];
    timer: number;
}

const PlayScreen = ({questionText, answers, timer}: PlayScreenProps) => {
    const [timeLeft, setTimeLeft] = useState(timer); 
    const [selectedAnswer, setSelectedAnswer] = useState<Answer | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
        
    useEffect(() => {
      if (timeLeft === 0 && !showResult) {
        setShowResult(true); 
      }

      if (timeLeft > 0 && !showResult) {
        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timer);
      }
    }, [timeLeft, showResult]);
  
  
    const handleAnswerSelect = (answer: Answer) => {
      if (showResult) return;
      setSelectedAnswer(answer);
      setShowResult(true); 
      if (answer.isCorrect) {
        setScore(score + 1000 + (timeLeft * 10)); 
      }
    };
       
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-700 via-indigo-700 to-blue-800 flex flex-col items-center justify-center p-2 sm:p-4 text-white">
        <div className="w-full max-w-3xl mb-4 md:mb-6">
          <div className="flex justify-between items-center mb-3 md:mb-4 px-1">
            <div className="text-lg sm:text-xl font-bold bg-slate-800 px-3 py-1 sm:px-4 sm:py-2 rounded-lg shadow-md">Score: {score}</div>
              <div className="text-2xl sm:text-3xl font-bold bg-red-500 px-4 py-2 sm:px-6 sm:py-3 rounded-full shadow-lg">
                {timeLeft}
              </div>
          </div>
           <Question questionText={questionText} />
        </div>
           <Answers
            answers={answers}
            onAnswerSelect={handleAnswerSelect}
            selectedAnswer={selectedAnswer}
            showResult={showResult}
          />
    
      </div>
    );
  };

export default PlayScreen;