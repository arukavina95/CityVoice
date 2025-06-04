import api from './axios';
import { ProblemDto, ProblemFilter } from '../types/problem';
import { authService } from '../services/AuthService';

export const problemsApi = {
    getAllProblems: async (filters?: ProblemFilter): Promise<ProblemDto[]> => {
        const token = authService.getToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        // Log request details
        console.log('Request URL:', '/api/problems');
        console.log('Request headers:', headers);
        console.log('Request params:', filters);
        
        try {
            const response = await api.get<ProblemDto[]>('/api/problems', {
                headers,
                params: filters,
            });
            return response.data;
        } catch (error: any) {
            // Enhanced error logging
            console.error('Error fetching problems:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    headers: error.config?.headers,
                    params: error.config?.params
                }
            });
            
            // Log the full error response
            if (error.response) {
                console.error('Error response data:', JSON.stringify(error.response.data, null, 2));
                console.error('Error response headers:', error.response.headers);
            }
            
            throw error;
        }
    },
    createProblem: async (data: FormData): Promise<void> => {
        const token = authService.getToken();
        const headers = {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            'Content-Type': 'multipart/form-data'
        };
        await api.post('/api/problems', data, { headers });
    },
    getAllProblemTypes: async (): Promise<{ id: number; name: string }[]> => {
        const response = await api.get('/api/problemtypes');
        return response.data;
    },
    getProblemById: async (id: number) => {
        const token = authService.getToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await api.get(`/api/problems/${id}`, { headers });
        return response.data;
    },
    getNotesForProblem: async (problemId: number) => {
        const token = authService.getToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await api.get(`/api/problems/${problemId}/Notes`, { headers });
        return response.data;
    },
    addNoteToProblem: async (problemId: number, content: string) => {
        const token = authService.getToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await api.post(`/api/problems/${problemId}/Notes`, { content }, { headers });
        return response.data;
    },
    updateProblemStatus: async (id: number, statusId: number) => {
        const token = authService.getToken();
        const headers = {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            'Content-Type': 'application/json'
        };
        await api.put(`/api/problems/${id}/status`, statusId, { headers });
    },
    deleteProblem: async (id: number) => {
        const token = authService.getToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        await api.delete(`/api/problems/${id}`, { headers });
    },
    // ...other methods (getById, create, etc.)
}; 