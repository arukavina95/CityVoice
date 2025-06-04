import React from 'react';
import { ProblemDto } from '../types/problem';

interface ProblemCardProps {
  problem: ProblemDto;
  onDetails: (id: number) => void;
}

const statusStyles: Record<string, string> = {
  'Nova': 'bg-red-100 text-red-800',
  'U Rješavanju': 'bg-yellow-100 text-yellow-800',
  'Riješena': 'bg-green-100 text-green-800',
  'Odbijena': 'bg-gray-200 text-gray-700',
};

export const ProblemCard: React.FC<ProblemCardProps> = ({ problem, onDetails }) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:scale-[1.03] flex flex-col overflow-hidden">
      {problem.imageUrl && (
        <img
          src={problem.imageUrl.startsWith('http') ? problem.imageUrl : `http://192.168.1.74:5088${problem.imageUrl}`}
          alt={problem.title}
          className="w-full h-48 object-cover rounded-t-lg"
        />
      )}
      <div className="flex-1 flex flex-col p-5">
        <h2 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1">{problem.title}</h2>
        <p className="text-gray-600 mb-3 line-clamp-2 flex-1">{problem.description}</p>
        <div className="flex flex-wrap gap-2 text-xs mb-2">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{problem.problemTypeName}</span>
          <span className={`px-2 py-1 rounded-full font-semibold ${statusStyles[problem.statusName] || 'bg-gray-100 text-gray-700'}`}>{problem.statusName}</span>
        </div>
        <div className="mt-auto text-xs text-gray-500 space-y-1">
          <p><span className="font-medium">Reporter:</span> {problem.reporterUsername}</p>
          <p><span className="font-medium">Reported At:</span> {new Date(problem.reportedAt).toLocaleDateString()} {new Date(problem.reportedAt).toLocaleTimeString()}</p>
        </div>
        <button
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition"
          onClick={() => onDetails(problem.id)}
        >
          Vidi Detalje
        </button>
      </div>
    </div>
  );
}; 