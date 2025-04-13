import Canvas from "@/components/create-quiz/Canvas";
import QuestionSidebar from "@/components/create-quiz/QuestionSidebar";
import { Question } from "@/types/Quiz";
import React from "react";

function CreateQuiz() {

    const [questions, setQuestions] = React.useState<Question[]>([{question: "new"}]);
    const [selectedQuestionIndex, setSelectedQuestionIndex] = React.useState(0);
    
    function onQuestionChange(question: string) {
      const newQuestions = [...questions];
      newQuestions[selectedQuestionIndex].question = question;
      setQuestions(newQuestions);
    }

    function onAddQuestion() {
        setQuestions([...questions, {question: "test"}])
    }

    function onSelectQuestion(index: number) {
        setSelectedQuestionIndex(index);
    }

  return (
    <div className="flex h-full">
      <QuestionSidebar questions={questions} onAddQuestion={onAddQuestion} onSelectQuestion={onSelectQuestion} selectedQuestionIndex={selectedQuestionIndex} />
      <div className="flex-1 flex justify-center items-center">
      <Canvas onQuestionChange={onQuestionChange} question={questions[selectedQuestionIndex].question} />
      </div>
    </div>
  );
}

export default CreateQuiz;
