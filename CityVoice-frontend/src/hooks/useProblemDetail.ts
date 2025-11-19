import { useState, useCallback, useEffect } from 'react';
import api from '../api/axios';
import type { ProblemDto } from '../types/problem';

interface Note {
    id: number;
    content: string;
    createdAt: string;
    createdBy: string;
}

interface UseProblemDetailResult {
    problem: ProblemDto | null;
    notes: Note[];
    isLoading: boolean;
    error: string | null;
    addNote: (content: string) => Promise<void>;
}

export const useProblemDetail = (problemId: number): UseProblemDetailResult => {
    const [problem, setProblem] = useState<ProblemDto | null>(null);
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProblemDetails = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const [problemResponse, notesResponse] = await Promise.all([
                api.get<ProblemDto>(`/problems/${problemId}`),
                api.get<Note[]>(`/problems/${problemId}/notes`)
            ]);
            setProblem(problemResponse.data);
            setNotes(notesResponse.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while fetching problem details');
        } finally {
            setIsLoading(false);
        }
    }, [problemId]);

    const addNote = useCallback(async (content: string) => {
        try {
            const response = await api.post<Note>(`/problems/${problemId}/notes`, { content });
            setNotes(prev => [...prev, response.data]);
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Failed to add note');
        }
    }, [problemId]);

    useEffect(() => {
        fetchProblemDetails();
    }, [fetchProblemDetails]);

    return { problem, notes, isLoading, error, addNote };
}; 