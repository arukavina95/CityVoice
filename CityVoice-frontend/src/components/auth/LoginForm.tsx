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
            errors.username = 'Unesite korisničko ime';
        }

        if (!formData.password) {
            errors.password = 'Unesite lozinku';
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
            const response = await api.post('/Auth/Login', {
                username: formData.username,
                password: formData.password
            });
            login(response.data.token);
            navigate('/app/problems');
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 400 || error.response?.status === 401) {
                    setServerError('Korisničko ime ili lozinka nisu ispravni.');
                } else {
                    setServerError('Došlo je do pogreške tijekom prijave. Pokušajte ponovno.');
                }
            } else if (error instanceof Error) {
                setServerError(error.message);
            } else {
                setServerError('Dogodila se neočekivana pogreška.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="mx-auto flex w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white/80 shadow-soft-xl backdrop-blur lg:flex-row">
            <div className="flex flex-1 flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-800 to-blue-700 p-10 text-white">
                <div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
                        Dobrodošli natrag
                    </span>
                    <h2 className="mt-6 text-3xl font-semibold leading-tight">
                        Prijavite se i nastavite pratiti stanje u vašem gradu.
                    </h2>
                    <p className="mt-3 text-sm text-white/70">
                        Upravljajte prijavama, ostavite bilješke i surađujte s timom na rješavanju komunalnih problema.
                    </p>
                </div>
                <div className="mt-12 flex items-center gap-4 text-xs font-medium uppercase tracking-widest text-white/70">
                    Sigurna prijava • Proziran nadzor • Brza reakcija
                </div>
            </div>
            <div className="flex flex-1 items-center justify-center bg-white/80 p-10">
                <div className="w-full max-w-sm">
                    <h3 className="text-2xl font-semibold text-slate-900">Prijava</h3>
                    <p className="mt-2 text-sm text-slate-500">
                        Unesite svoje pristupne podatke kako biste nastavili.
                    </p>
                    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                        {serverError && (
                            <div className="rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-600">
                                {serverError}
                            </div>
                        )}
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="username">
                                Korisničko ime
                            </label>
                            <input
                                className={`mt-2 w-full rounded-2xl border bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-sm transition focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                                    validationErrors.username ? 'border-red-300' : 'border-slate-200'
                                }`}
                                id="username"
                                name="username"
                                type="text"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                placeholder="Unesite korisničko ime"
                            />
                            {validationErrors.username && (
                                <p className="mt-2 text-xs text-red-500">{validationErrors.username}</p>
                            )}
                        </div>
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="password">
                                Lozinka
                            </label>
                            <input
                                className={`mt-2 w-full rounded-2xl border bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-sm transition focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                                    validationErrors.password ? 'border-red-300' : 'border-slate-200'
                                }`}
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="Unesite lozinku"
                            />
                            {validationErrors.password && (
                                <p className="mt-2 text-xs text-red-500">{validationErrors.password}</p>
                            )}
                        </div>
                        <button
                            className="w-full rounded-full bg-slate-900 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-slate-700"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Prijavljivanje...' : 'Prijavi se'}
                        </button>
                    </form>
                    <div className="mt-6 text-center text-sm text-slate-500">
                        Nemaš račun?{' '}
                        <button
                            type="button"
                            onClick={() => navigate('/register')}
                            className="font-semibold text-blue-600 hover:text-blue-700"
                        >
                            Registriraj se
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};