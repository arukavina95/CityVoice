import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { authApi } from '../../api/authApi';

interface RegisterFormData {
    username: string;
    email: string;
    password: string;
}

interface ValidationErrors {
    username?: string;
    email?: string;
    password?: string;
}

export const RegisterForm: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

    const [form, setForm] = useState<RegisterFormData>({
        username: '',
        email: '',
        password: '',
    });

    const validateForm = (): boolean => {
        const errors: ValidationErrors = {};

        // Username validation
        if (!form.username.trim()) {
            errors.username = 'Username is required';
        } else if (form.username.length < 3) {
            errors.username = 'Username must be at least 3 characters long';
        }

        // Email validation
        if (!form.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(form.email)) {
            errors.email = 'Email is not valid';
        }

        // Password validation
        if (!form.password) {
            errors.password = 'Password is required';
        } else if (form.password.length < 6) {
            errors.password = 'Password must be at least 6 characters long';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        // Clear validation error when user starts typing
        if (validationErrors[e.target.name as keyof ValidationErrors]) {
            setValidationErrors(prev => ({
                ...prev,
                [e.target.name]: undefined
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setServerError(null);
        setIsSuccess(false);

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            await authApi.register(form);
            setIsSuccess(true);
            // Clear form
            setForm({
                username: '',
                email: '',
                password: '',
            });
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 400) {
                    // Handle validation errors from the server
                    const serverValidationErrors = error.response.data.errors;
                    if (serverValidationErrors) {
                        setValidationErrors(serverValidationErrors);
                    } else {
                        setServerError(error.response.data.message || 'Registration failed');
                    }
                } else {
                    setServerError('An error occurred during registration. Please try again.');
                }
            } else {
                setServerError('An unexpected error occurred');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4">
                <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
                    <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
                        <div className="flex items-center">
                            <svg className="h-5 w-5 text-green-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-green-800 font-semibold">Registracija uspješna! Možete se prijaviti.</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="mt-4 w-full px-4 py-2 rounded-md bg-green-100 text-green-700 font-medium hover:bg-green-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400"
                        >
                            Prijavi se
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
                <h2 className="text-2xl font-bold text-center mb-6">Registracija</h2>
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
                            value={form.username}
                            onChange={handleChange}
                            required
                            placeholder="Unesite korisničko ime"
                        />
                        {validationErrors.username && <p className="text-red-500 text-xs mt-1">{validationErrors.username}</p>}
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                            Email
                        </label>
                        <input
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-300 ${validationErrors.email ? 'border-red-300' : 'border-gray-300'}`}
                            id="email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            placeholder="Unesite email"
                        />
                        {validationErrors.email && <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>}
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            Lozinka
                        </label>
                        <input
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-300 ${validationErrors.password ? 'border-red-300' : 'border-gray-300'}`}
                            id="password"
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            placeholder="Unesite lozinku"
                        />
                        {validationErrors.password && <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>}
                    </div>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Registriranje...' : 'Registriraj se'}
                    </button>
                    <div className="mt-4 text-center">
                        <span className="text-gray-600 text-sm">Već imaš račun? </span>
                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="text-blue-500 hover:text-blue-800 font-semibold text-sm"
                        >
                            Prijavi se
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}; 