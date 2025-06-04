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
    const [darkMode, setDarkMode] = useState(false); // Za dark mode toggle
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    const { problems } = useProblems(); // Dohvati probleme iz hooka
    const problemCount = problems.length; // Koristi stvarni broj problema

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

    // Zatvori dropdown klikom izvan
    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // On mount, set dark mode from localStorage
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
        <nav className="bg-gray-900 shadow-md w-full sticky top-0 z-50 dark:bg-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-wrap md:flex-nowrap justify-between items-center h-16">
                    {/* Logo i ime */}
                    <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-8 w-8 text-blue-400 hidden md:block">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
                        </svg>
                        <Link to="/" className="text-2xl font-bold text-white tracking-tight hover:text-blue-300 transition-colors">
                            City Voice
                        </Link>
                        {/* Badge s brojem problema */}
                        {isAuthenticated && (
                            <span className="ml-3 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full animate-pulse">
                                {problemCount} aktivna
                            </span>
                        )}
                    </div>
                    {/* Linkovi */}
                    <div className="hidden md:flex items-center gap-6 ml-8">
                        <Link to="/app/problems" className="text-white hover:text-blue-400 transition font-medium">Problemi</Link>
                        <Link to="/map" className="text-white hover:text-blue-400 transition font-medium">Karta</Link>
                        <Link to="/about" className="text-white hover:text-blue-400 transition font-medium">O aplikaciji</Link>
                        <Link to="/contact" className="text-white hover:text-blue-400 transition font-medium">Kontakt</Link>
                    </div>
                    <div className="flex items-center space-x-4 mt-2 md:mt-0">
                        {/* Dark mode toggle */}
                        <button onClick={handleDarkModeToggle} className="text-white hover:text-yellow-400 transition text-xl mr-2" title="Dark mode toggle">
                            {darkMode ? <FaSun /> : <FaMoon />}
                        </button>
                        {isAuthenticated ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setDropdownOpen((v) => !v)}
                                    className="flex items-center gap-2 text-white hover:text-blue-300 transition focus:outline-none"
                                >
                                    <FaUserCircle className="text-2xl" />
                                    <span className="font-semibold text-lg">{currentUser?.username}</span>
                                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                </button>
                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-900 rounded shadow-lg py-2 z-50 animate-fade-in">
                                        <Link to="/profile" className="block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition">Profil</Link>
                                        <button onClick={() => setShowLogoutConfirm(true)} className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 transition">Odjava</button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-4 py-2 rounded-md border border-blue-500 text-blue-500 bg-white font-medium hover:bg-blue-50 hover:text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
            {/* Logout confirm modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg text-center">
                        <div className="mb-4 text-lg font-semibold">Jeste li sigurni da se želite odjaviti?</div>
                        <div className="flex gap-4 justify-center">
                            <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition">Da, odjavi me</button>
                            <button onClick={() => setShowLogoutConfirm(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded transition">Odustani</button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}; 