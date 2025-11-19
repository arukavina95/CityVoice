import { useState, useCallback, useEffect } from 'react';
import api from '../api/axios';

interface ProblemType {
    id: number;
    name: string;
}

interface UseProblemTypesResult {
    problemTypes: ProblemType[];
    isLoading: boolean;
    error: string | null;
}

export const useProblemTypes = (): UseProblemTypesResult => {
    const [problemTypes, setProblemTypes] = useState<ProblemType[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProblemTypes = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await api.get<ProblemType[]>('/ProblemTypes');
            setProblemTypes(response.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while fetching problem types');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProblemTypes();
    }, [fetchProblemTypes]);

    return { problemTypes, isLoading, error };
}; 