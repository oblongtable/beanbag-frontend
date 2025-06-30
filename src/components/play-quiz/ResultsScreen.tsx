import React from 'react';
import { useWebSocket } from '../../context/WebSocketContext';
import { Button } from '../ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

interface LeaderboardEntry {
  ID: string;
  Name: string;
  Score: number;
}

interface ResultsScreenProps {
  leaderboard: LeaderboardEntry[];
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ leaderboard }) => {
  const { sendMessage, disconnect } = useWebSocket();

  const handleDisconnect = () => {
    sendMessage('leave_room', {});
    disconnect(); // Call the disconnect function from WebSocketContext
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-indigo-700 to-blue-800 flex flex-col items-center justify-center p-2 sm:p-4 text-white">
      <div className="w-full max-w-3xl text-center">
        <h1 className="text-5xl sm:text-6xl font-bold mb-4">Game Over!</h1>
        <h2 className="text-3xl sm:text-4xl font-semibold mb-6">Leaderboard</h2>

        <div className="w-full max-w-md bg-slate-800 rounded-lg shadow-xl p-6 mx-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-700">
                <TableHead className="w-[100px] text-white">Rank</TableHead>
                <TableHead className="text-white">Player</TableHead>
                <TableHead className="text-right text-white">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard.map((entry, index) => (
                <TableRow key={entry.ID} className={index % 2 === 0 ? 'bg-slate-800' : 'bg-slate-700'}>
                  <TableCell className="font-medium text-white">{index + 1}</TableCell>
                  <TableCell className="text-white">{entry.Name}</TableCell>
                  <TableCell className="text-right text-white">{entry.Score}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Button onClick={handleDisconnect} className="mt-8 px-6 py-3 text-lg bg-green-600 hover:bg-green-700">
          Disconnect and Leave Room
        </Button>
      </div>
    </div>
  );
};

export default ResultsScreen;
