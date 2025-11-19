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

        if (!form.username.trim()) {
            errors.username = 'Korisničko ime je obavezno';
        } else if (form.username.length < 3) {
            errors.username = 'Korisničko ime mora imati barem 3 znaka';
        }

        if (!form.email.trim()) {
            errors.email = 'Email je obavezan';
        } else if (!/\S+@\S+\.\S+/.test(form.email)) {
            errors.email = 'Email nije ispravan';
        }

        if (!form.password) {
            errors.password = 'Lozinka je obavezna';
        } else if (form.password.length < 6) {
            errors.password = 'Lozinka mora imati najmanje 6 znakova';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
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
            setForm({
                username: '',
                email: '',
                password: '',
            });
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 400) {
                    const serverValidationErrors = error.response.data?.errors as ValidationErrors | undefined;
                    if (serverValidationErrors) {
                        setValidationErrors(serverValidationErrors);
                    } else {
                        setServerError(error.response?.data?.message || 'Registracija nije uspjela.');
                    }
                } else {
                    setServerError('Došlo je do pogreške tijekom registracije. Pokušajte ponovno.');
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

    if (isSuccess) {
        return (
            <section className="mx-auto flex w-full max-w-4xl items-center justify-center rounded-3xl bg-white/80 p-10 text-center shadow-soft-xl backdrop-blur">
                <div className="w-full max-w-md">
                    <div className="flex items-center justify-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none">
                                <path d="M5 12L10 17L19 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>
                    <h2 className="mt-6 text-2xl font-semibold text-slate-900">Registracija uspješna!</h2>
                    <p className="mt-3 text-sm text-slate-500">
                        Vaš račun je spreman. Možete se prijaviti i početi koristiti City Voice platformu.
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="mt-6 w-full rounded-full bg-emerald-500 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-600"
                    >
                        Prijavi se
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className="mx-auto flex w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white/80 shadow-soft-xl backdrop-blur lg:flex-row">
            <div className="flex flex-1 flex-col justify-between bg-gradient-to-br from-blue-600 via-sky-500 to-cyan-500 p-10 text-white">
                <div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
                        Kreirajte račun
                    </span>
                    <h2 className="mt-6 text-3xl font-semibold leading-snug">
                        Pridružite se mreži građana koji čine grad boljim mjestom.
                    </h2>
                    <p className="mt-3 text-sm text-white/70">
                        S prijavljenim računom možete pratiti status svojih prijava, dodavati bilješke i surađivati s timom.
                    </p>
                </div>
                <div className="mt-12 grid grid-cols-1 gap-4 text-xs font-medium uppercase tracking-widest text-white/70">
                    <span>Transparentno</span>
                    <span>Sigurno</span>
                    <span>Orijentirano na zajednicu</span>
                </div>
            </div>
            <div className="flex flex-1 items-center justify-center bg-white/80 p-10">
                <div className="w-full max-w-sm">
                    <h3 className="text-2xl font-semibold text-slate-900">Registracija</h3>
                    <p className="mt-2 text-sm text-slate-500">Unesite svoje podatke kako biste kreirali račun.</p>
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
                                value={form.username}
                                onChange={handleChange}
                                required
                                placeholder="Unesite korisničko ime"
                            />
                            {validationErrors.username && (
                                <p className="mt-2 text-xs text-red-500">{validationErrors.username}</p>
                            )}
                        </div>
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="email">
                                Email
                            </label>
                            <input
                                className={`mt-2 w-full rounded-2xl border bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-sm transition focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                                    validationErrors.email ? 'border-red-300' : 'border-slate-200'
                                }`}
                                id="email"
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                placeholder="Unesite email adresu"
                            />
                            {validationErrors.email && (
                                <p className="mt-2 text-xs text-red-500">{validationErrors.email}</p>
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
                                value={form.password}
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
                            {isLoading ? 'Registriranje...' : 'Kreiraj račun'}
                        </button>
                    </form>
                    <div className="mt-6 text-center text-sm text-slate-500">
                        Već imate račun?{' '}
                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="font-semibold text-blue-600 hover:text-blue-700"
                        >
                            Prijavite se
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};