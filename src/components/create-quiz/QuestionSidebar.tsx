import { Question } from "@/types/Quiz";
import { Button } from "../ui/button";

interface QuestionSidebarProps {
    questions: Question[];
    selectedQuestionIndex: number;
    onSelectQuestion: (index: number) => void;
    onAddQuestion: () => void;
}


const QuestionSidebar = ({
    questions,
    selectedQuestionIndex,
    onSelectQuestion,
    onAddQuestion
}: QuestionSidebarProps) => {
    return (
        <aside className="w-72 bg-white border-r border-gray-200 flex flex-col overflow-y-auto h-full">
            <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-700">Questions</h2>
            </div>

            <div className="flex-1 p-2 space-y-1">
                {questions.map((question, index) => (
                    <Button
                        key={index}
                        variant={index === selectedQuestionIndex ? 'outline' : 'ghost'}
                        className="w-full justify-start text-left h-auto py-2 px-2 shadow-none"
                        onClick={() => onSelectQuestion(index)}
                    >
                        <div className="flex items-center space-x-2 w-full">
                             <span className="text-xs font-medium text-gray-500 w-5 text-right">{index + 1}.</span>

                            <div className="w-16 h-9 bg-gray-200 rounded-sm flex-shrink-0 border border-gray-300">
                            </div>

                            <span className="flex-1 text-sm font-medium truncate overflow-hidden whitespace-nowrap">
                                {question.question}
                            </span>
                        </div>
                    </Button>
                ))}
            </div>

            <div className="p-4 border-t border-gray-200 mt-auto"> {/* Added mt-auto to push footer down */}
                <Button
                    onClick={onAddQuestion} // Use prop callback
                    variant="default" // Use the primary button style
                    className="w-full"
                >
                    Add Question
                </Button>
            </div>
        </aside>
    );
};

export default QuestionSidebar;