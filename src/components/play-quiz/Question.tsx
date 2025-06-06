import { Card, CardHeader, CardTitle } from "../ui/card";

interface QuestionProps {
    questionText: string;
}

const Question = ({ questionText }: QuestionProps) => {
    return (
      <Card className="w-full max-w-3xl mx-auto shadow-2xl bg-slate-800 text-white border-slate-700">
        <CardHeader>
          <CardTitle className="text-center text-3xl md:text-4xl py-4">
            {questionText}
          </CardTitle>
        </CardHeader>
      </Card>
    );
  };
export default Question;