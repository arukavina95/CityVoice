import React from 'react';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { ProblemList } from './components/ProblemList';
import { useAuth } from './context/AuthContext';
import ProfilePage from './components/profile/ProfilePage';
import ProblemsMap from './components/ProblemsMap';
import { useState, useEffect } from 'react';
import { problemsApi } from './api/problemsApi';
import { ProblemDetailsModal } from './components/modals/ProblemDetailsModal';
import { ProblemDto } from './types/problem';

// Protected Route wrapper component
interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        // Redirect to login page but save the attempted url
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

// 404 Not Found component
const NotFound: React.FC = () => (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-5xl flex-col items-center justify-center rounded-3xl bg-white/80 px-10 py-16 text-center shadow-soft-xl backdrop-blur">
        <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-600">
            404 Greška
        </span>
        <h1 className="mt-6 text-5xl font-semibold text-slate-900">Stranica nije pronađena</h1>
        <p className="mt-4 max-w-lg text-sm text-slate-500">
            Čini se da stranica koju tražite ne postoji ili je premještena. Provjerite URL ili se vratite na početnu stranicu.
        </p>
        <Link
            to="/app/problems"
            className="mt-6 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-slate-700"
        >
            Povratak na pregled problema
        </Link>
    </div>
);

export const AppRoutes: React.FC = () => {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />

            {/* Protected problems page */}
            <Route
                path="/app/problems"
                element={
                    <ProtectedRoute>
                        <ProblemList />
                    </ProtectedRoute>
                }
            />
            {/* Redirect /app to /app/problems */}
            <Route path="/app" element={<Navigate to="/app/problems" replace />} />
            {/* Redirect root / to /app/problems */}
            <Route path="/" element={<Navigate to="/app/problems" replace />} />

            {/* Protected profile page */}
            <Route path="/profile" element={
                <ProtectedRoute>
                    <ProfilePage />
                </ProtectedRoute>
            } />

            {/* Public map page */}
            <Route path="/map" element={<MapPage />} />

            {/* Catch all route - 404 */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

const MapPage: React.FC = () => {
    const [problems, setProblems] = useState<ProblemDto[]>([]);
    const [selectedProblemId, setSelectedProblemId] = useState<number | null>(null);
    useEffect(() => {
        problemsApi.getAllProblems().then(setProblems);
    }, []);
    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
            <section className="rounded-3xl bg-white/80 px-6 py-8 shadow-soft-xl backdrop-blur lg:px-12">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-600">
                            Prostorni uvid
                        </span>
                        <h1 className="mt-4 font-display text-3xl font-semibold text-slate-900 sm:text-4xl">
                            Karta prijavljenih problema
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm text-slate-600">
                            Pregled svih aktivnih lokacija s prijavljenim problemima. Kliknite marker za kratak sažetak
                            i otvaranje detaljnog pregleda slučaja.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-white/50 bg-white/70 px-6 py-4 text-sm text-slate-600 shadow-inner">
                        Ukupno prijava na karti:{' '}
                        <span className="text-lg font-semibold text-slate-900">{problems.length}</span>
                    </div>
                </div>
            </section>

            <section className="rounded-3xl bg-white/80 p-4 shadow-soft-xl backdrop-blur">
                {!selectedProblemId && <ProblemsMap problems={problems} onSelectProblem={setSelectedProblemId} />}
            </section>

            {selectedProblemId && (
                <ProblemDetailsModal
                    problemId={selectedProblemId}
                    onClose={() => setSelectedProblemId(null)}
                    onUpdated={() => problemsApi.getAllProblems().then(setProblems)}
                />
            )}
        </div>
    );
}; 