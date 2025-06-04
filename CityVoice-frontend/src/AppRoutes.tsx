import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
            <h1 className="text-6xl font-bold text-gray-900">404</h1>
            <p className="mt-4 text-xl text-gray-600">Page not found</p>
            <p className="mt-2 text-gray-500">The page you're looking for doesn't exist or has been moved.</p>
        </div>
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
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Karta prijavljenih problema</h1>
            <div className="w-full max-w-5xl">
                {/* Prikazuj mapu samo ako nije otvoren modal */}
                {!selectedProblemId && (
                    <ProblemsMap problems={problems} onSelectProblem={setSelectedProblemId} />
                )}
            </div>
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