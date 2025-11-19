import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useRef } from 'react';
import { FaUserCircle, FaMoon, FaSun } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useProblems } from '../../hooks/useProblems';


export const Navbar: React.FC = () => {
    const { isAuthenticated, currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { problems } = useProblems();
    const problemCount = problems.length;

    const handleLogout = () => {
        setShowLogoutConfirm(false);
        logout();
        toast.success('Uspješno ste se odjavili!');
        navigate('/login');
    };

    const handleDarkModeToggle = () => {
        setDarkMode((prev) => {
            const next = !prev;
            if (next) {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            }
            return next;
        });
    };

    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    React.useEffect(() => {
        const saved = localStorage.getItem('theme');
        if (saved === 'dark') {
            setDarkMode(true);
            document.documentElement.classList.add('dark');
        } else {
            setDarkMode(false);
            document.documentElement.classList.remove('dark');
        }
    }, []);

    return (
        <header className="sticky top-0 z-50 mb-2">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <nav className="mt-6 flex h-20 items-center justify-between rounded-3xl border border-white/40 bg-white/70 px-5 shadow-soft-xl backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/70">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="flex items-center gap-3">
                            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-sky-500 text-white shadow-brand">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                                    <path
                                        d="M3 21V5.6C3 4.71634 3 4.27451 3.16349 3.91301C3.3073 3.59842 3.53111 3.34818 3.80473 3.20152C4.11587 3.03564 4.51712 3.03564 5.31963 3.03564H18.6804C19.4829 3.03564 19.8841 3.03564 20.1953 3.20152C20.4689 3.34818 20.6927 3.59842 20.8365 3.91301C21 4.27451 21 4.71634 21 5.6V21"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                    />
                                    <path
                                        d="M6.5 9.5H9.5M6.5 13H10.5M14 9.5H17.5M14 13H17.5M9 21V17C9 16.0681 9 15.6022 9.20101 15.2346C9.37827 14.9103 9.65138 14.655 9.97101 14.517C10.3352 14.3636 10.8065 14.4155 11.749 14.519L13.249 14.685C14.1915 14.7895 14.6628 14.8412 15.027 14.9946C15.3466 15.1326 15.6217 15.351 15.799 15.6754C16 16.043 16 16.5089 16 17.4408V21"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </span>
                            <div className="flex flex-col">
                                <span className="text-xl font-semibold text-slate-900">City Voice</span>
                               
                            </div>
                        </Link>
                        {isAuthenticated && (
                            <span className="hidden rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-600 md:inline-flex">
                                {problemCount} aktivna slučaja
                            </span>
                        )}
                    </div>
                    <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
                        <Link to="/app/problems" className="hover:text-slate-900">
                            Problemi
                        </Link>
                        <Link to="/map" className="hover:text-slate-900">
                            Karta
                        </Link>
                        <Link to="/about" className="hover:text-slate-900">
                            O aplikaciji
                        </Link>
                        <Link to="/contact" className="hover:text-slate-900">
                            Kontakt
                        </Link>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleDarkModeToggle}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:scale-105 hover:border-blue-200 hover:text-blue-600 dark:border-slate-600 dark:text-slate-300"
                            title="Promijeni temu"
                        >
                            {darkMode ? <FaSun /> : <FaMoon />}
                        </button>
                        {isAuthenticated ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setDropdownOpen((v) => !v)}
                                    className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                                >
                                    <FaUserCircle className="text-xl text-blue-500" />
                                    <span>{currentUser?.username}</span>
                                    <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-3 w-48 overflow-hidden rounded-2xl border border-slate-100 bg-white/95 shadow-lg backdrop-blur">
                                        <Link
                                            to="/profile"
                                            className="block px-4 py-2.5 text-sm text-slate-700 transition hover:bg-blue-50 hover:text-blue-600"
                                        >
                                            Profil
                                        </Link>
                                        <button
                                            onClick={() => setShowLogoutConfirm(true)}
                                            className="block w-full px-4 py-2.5 text-left text-sm font-medium text-red-500 transition hover:bg-red-50"
                                        >
                                            Odjava
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    to="/login"
                                    className="rounded-full border border-transparent bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700"
                                >
                                    Prijava
                                </Link>
                                <Link
                                    to="/register"
                                    className="rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-sm font-semibold text-blue-600 shadow-sm transition hover:border-blue-400 hover:text-blue-700"
                                >
                                    Registracija
                                </Link>
                            </div>
                        )}
                    </div>
                </nav>
            </div>
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-soft-xl">
                        <div className="mb-4 text-lg font-semibold text-slate-900">
                            Jeste li sigurni da se želite odjaviti?
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="rounded-full border border-slate-200 px-5 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
                            >
                                Odustani
                            </button>
                            <button
                                onClick={handleLogout}
                                className="rounded-full bg-red-500 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-red-600"
                            >
                                Da, odjavi me
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}; 