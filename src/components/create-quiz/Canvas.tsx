import { AspectRatio } from "@radix-ui/react-aspect-ratio";
import { Input } from "../ui/input";

interface CanvasProps {
    question: string;
    onQuestionChange: (question: string) => void;
}


function Canvas(props: CanvasProps) {    

    return (
        <div className="w-full max-w-5xl">
            <AspectRatio ratio={16 / 9} className="bg-white rounded-1g shadow-x1 border border-gray-300 overflow-hidden">
                <div id="canvas-area" className="w-full h-full relative">
                <div
                     className="absolute inset-0 pointer-events-none"
                     style={{
                         backgroundImage: 'linear-gradient(to right, rgba(200, 200, 200, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(200, 200, 200, 0.1) 1px, transparent 1px)',
                         backgroundSize: '20px 20px',
                     }}
                 ></div>
                 <Input placeholder="Enter your question" value={props.question} onChange={(e) => props.onQuestionChange(e.target.value)} />
                </div>
            </AspectRatio>
        </div>
    )
}

export default Canvas;