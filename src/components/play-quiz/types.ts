export type Answer = {
    id: number;
    text: string;
    isCorrect: boolean;
}

export interface LeaderboardEntry {
    ID: string;
    Name: string;
    Score: number;
}

export interface QuestionResultInfo {
    correctOptionIndex: number;
    explanation: string;
    leaderboard: { [key: string]: LeaderboardEntry };
}
