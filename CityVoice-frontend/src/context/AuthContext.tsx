import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { JwtPayload, UserRole } from '../types/auth';
import { authService } from '../services/AuthService';

interface AuthContextType {
    currentUser: JwtPayload | null;
    isAuthenticated: boolean;
    hasRole: (role: UserRole) => boolean;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<JwtPayload | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Initialize auth state from localStorage
    useEffect(() => {
        const user = authService.getCurrentUser();
        setCurrentUser(user);
        setIsAuthenticated(!!user);
    }, []);

    const login = (token: string) => {
        authService.setToken(token);
        const user = authService.getCurrentUser();
        setCurrentUser(user);
        setIsAuthenticated(true);
    };

    const logout = () => {
        authService.removeToken();
        setCurrentUser(null);
        setIsAuthenticated(false);
    };

    const hasRole = (role: UserRole): boolean => {
        return authService.hasRole(role);
    };

    const value = {
        currentUser,
        isAuthenticated,
        hasRole,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 