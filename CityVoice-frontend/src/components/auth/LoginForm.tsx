import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

interface LoginFormData {
    username: string;
    password: string;
}

interface ValidationErrors {
    username?: string;
    password?: string;
}

export const LoginForm: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

    const [formData, setFormData] = useState<LoginFormData>({
        username: '',
        password: ''
    });

    const validateForm = (): boolean => {
        const errors: ValidationErrors = {};

        if (!formData.username.trim()) {
            errors.username = 'Username is required';
        }

        if (!formData.password) {
            errors.password = 'Password is required';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear validation error when user starts typing
        if (validationErrors[name as keyof ValidationErrors]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setServerError(null);

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await api.post('/api/Auth/Login', {
                username: formData.username,
                password: formData.password
            });
            login(response.data.token);
            navigate('/app/problems');
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 400 || error.response?.status === 401) {
                    setServerError('Invalid username or password');
                } else {
                    setServerError('An error occurred during login. Please try again.');
                }
            } else {
                setServerError('An unexpected error occurred');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
                <h2 className="text-2xl font-bold text-center mb-6">Prijava</h2>
                <form onSubmit={handleSubmit}>
                    {serverError && <p className="text-red-500 text-sm mb-4">{serverError}</p>}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                            Korisničko ime
                        </label>
                        <input
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-300 ${validationErrors.username ? 'border-red-300' : 'border-gray-300'}`}
                            id="username"
                            name="username"
                            type="text"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            placeholder="Unesite korisničko ime"
                        />
                        {validationErrors.username && <p className="text-red-500 text-xs mt-1">{validationErrors.username}</p>}
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            Lozinka
                        </label>
                        <input
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-300 ${validationErrors.password ? 'border-red-300' : 'border-gray-300'}`}
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Unesite lozinku"
                        />
                        {validationErrors.password && <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>}
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Prijavljivanje...' : 'Prijavi se'}
                        </button>
                    </div>
                    <div className="mt-4 text-center">
                        <span className="text-gray-600 text-sm">Nemaš račun? </span>
                        <button
                            type="button"
                            onClick={() => navigate('/register')}
                            className="text-blue-500 hover:text-blue-800 font-semibold text-sm"
                        >
                            Registriraj se
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}; 