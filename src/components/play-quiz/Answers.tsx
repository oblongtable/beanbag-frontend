import { CheckCircle, Circle, Diamond, Square, Triangle, XCircle } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import { Answer } from "./types";



interface AnswersProps {
    answers: Answer[];
    onAnswerSelect: (answer: Answer, index: number) => void;
    selectedAnswerId: number | null;
    showResult: boolean;
}

const Answers = ({ answers, onAnswerSelect, selectedAnswerId, showResult }: AnswersProps) => {
    const answerItems = [
      { icon: <Triangle className="mr-2 h-5 w-5 md:h-6 md:w-6" fill="currentColor" />, color: "bg-red-600 hover:bg-red-700", iconBaseColor: "text-red-300" },
      { icon: <Diamond className="mr-2 h-5 w-5 md:h-6 md:w-6" fill="currentColor" />, color: "bg-blue-600 hover:bg-blue-700", iconBaseColor: "text-blue-300" },
      { icon: <Circle className="mr-2 h-5 w-5 md:h-6 md:w-6" fill="currentColor" />, color: "bg-yellow-500 hover:bg-yellow-600", iconBaseColor: "text-yellow-200" },
      { icon: <Square className="mr-2 h-5 w-5 md:h-6 md:w-6" fill="currentColor" />, color: "bg-green-600 hover:bg-green-700", iconBaseColor: "text-green-300" },
    ];
  
    if (!answers || answers.length < 2 || answers.length > 8) {
      console.error("Number of answers must be between 2 and 8. Received:", answers);
      return <div className="text-red-500 text-center p-4">Error: Invalid number of answers provided for this question. Please check console.</div>;
    }
  
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 w-full max-w-3xl mx-auto mt-4 md:mt-6">
        {answers.map((answer, index) => {
          const itemStyle = answerItems[index % answerItems.length];
          let buttonClass = `${itemStyle.color} text-white text-base md:text-lg font-semibold py-4 md:py-5 rounded-lg shadow-md transition-transform duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50`;
          let resultIcon = null;
          let iconColorClass = itemStyle.iconBaseColor;
  
          if (showResult) {
            if (answer.isCorrect) {
              buttonClass = `bg-green-500 text-white text-base md:text-lg font-semibold py-4 md:py-5 rounded-lg shadow-md`;
              resultIcon = <CheckCircle className="ml-auto h-6 w-6 md:h-7 md:w-7 text-white" />;
              iconColorClass = "text-white"; 
          } else if (selectedAnswerId !== null && answer.id === selectedAnswerId && !answer.isCorrect) {
            buttonClass = `bg-purple-500 text-white text-base md:text-lg font-semibold py-4 md:py-5 rounded-lg shadow-md`;
            resultIcon = <XCircle className="ml-auto h-6 w-6 md:h-7 md:w-7 text-white" />;
            iconColorClass = "text-white"; 
            } else {
               buttonClass = `bg-slate-700 text-slate-400 text-base md:text-lg font-semibold py-4 md:py-5 rounded-lg shadow-md opacity-70`;
            }
          }
  
          return (
            <Button
              key={index}
              onClick={() => !showResult && onAnswerSelect(answer, index)}
              className={`${buttonClass} flex items-center justify-start p-3 md:p-4`}
              disabled={showResult}
              aria-label={`Answer ${index + 1}: ${answer.text}${showResult ? (answer.isCorrect ? ' (Correct)' : (selectedAnswerId !== null && answer.id === selectedAnswerId ? ' (Incorrect)' : '')) : ''}`}
            >
              <div className="flex items-center w-full">
                <div className={`p-1 md:p-2 rounded-md bg-black bg-opacity-20 ${iconColorClass}`}>
                   {React.cloneElement(itemStyle.icon)}
                </div>
                <span className="ml-2 md:ml-3 flex-grow text-left">{answer.text}</span>
                {resultIcon}
              </div>
            </Button>
          );
        })}
      </div>
    );
  };

export default Answers;
