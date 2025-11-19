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

const rawMediaBase =
  (import.meta.env.VITE_FILES_BASE_URL ?? import.meta.env.VITE_API_ORIGIN ?? '').trim();
const mediaBase = rawMediaBase.endsWith('/') ? rawMediaBase.slice(0, -1) : rawMediaBase;

const resolveImageUrl = (imageUrl: string): string => {
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }

  const normalizedPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  return mediaBase ? `${mediaBase}${normalizedPath}` : normalizedPath;
};

export const ProblemCard: React.FC<ProblemCardProps> = ({ problem, onDetails }) => {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-lg shadow-slate-900/5 transition hover:-translate-y-1 hover:shadow-soft-xl dark:border-slate-700/70 dark:bg-slate-900/70">
      <div className="relative h-48 overflow-hidden">
        {problem.imageUrl ? (
          <img
            src={resolveImageUrl(problem.imageUrl)}
            alt={problem.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
            Nema fotografije
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/65 via-slate-900/10 to-transparent" />
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700">
            {problem.problemTypeName}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${
              statusStyles[problem.statusName] || 'bg-gray-100 text-gray-700'
            }`}
          >
            {problem.statusName}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 line-clamp-1">{problem.title}</h2>
          <p className="mt-2 text-sm text-slate-600 line-clamp-3">{problem.description}</p>
        </div>

        <div className="mt-auto space-y-2 text-xs text-slate-500">
          <p>
            <span className="font-semibold text-slate-600">Prijavio:</span> {problem.reporterUsername}
          </p>
          <p>
            <span className="font-semibold text-slate-600">Prijavljeno:</span>{' '}
            {new Date(problem.reportedAt).toLocaleDateString('hr-HR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}{' '}
            {new Date(problem.reportedAt).toLocaleTimeString('hr-HR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        <button
          className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-slate-700"
          onClick={() => onDetails(problem.id)}
        >
          Vidi detalje
        </button>
      </div>
    </article>
  );
};