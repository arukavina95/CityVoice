import { useState, useCallback, useEffect } from 'react';
import api from '../api/axios';
import type { ProblemDto } from '../types/problem';

interface UseProblemsResult {
    problems: ProblemDto[];
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export const useProblems = (): UseProblemsResult => {
    const [problems, setProblems] = useState<ProblemDto[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProblems = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await api.get<ProblemDto[]>('/problems');
            // Ensure response.data is an array
            const problemsData = Array.isArray(response.data) ? response.data : [];
            setProblems(problemsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while fetching problems');
            setProblems([]); // Reset to empty array on error
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchProblems();
    }, [fetchProblems]);

    return {
        problems,
        isLoading,
        error,
        refetch: fetchProblems
    };
}; 