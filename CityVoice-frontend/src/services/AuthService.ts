import { JwtPayload, UserRole } from '../types/auth';
import { decodeJwtToken } from '../utils/jwt';

const TOKEN_KEY = 'auth_token';

class AuthService {
    private static instance: AuthService;
    private currentUser: JwtPayload | null = null;

    private constructor() {
        // Initialize currentUser from localStorage if token exists
        const token = this.getToken();
        if (token) {
            this.currentUser = decodeJwtToken(token);
        }
    }

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    public setToken(token: string): void {
        try {
            localStorage.setItem(TOKEN_KEY, token);
            this.currentUser = decodeJwtToken(token);
        } catch (error) {
            console.error('Error storing token:', error);
            throw new Error('Failed to store authentication token');
        }
    }

    public getToken(): string | null {
        try {
            return localStorage.getItem(TOKEN_KEY);
        } catch (error) {
            console.error('Error retrieving token:', error);
            return null;
        }
    }

    public removeToken(): void {
        try {
            localStorage.removeItem(TOKEN_KEY);
            this.currentUser = null;
        } catch (error) {
            console.error('Error removing token:', error);
            throw new Error('Failed to remove authentication token');
        }
    }

    public getCurrentUser(): JwtPayload | null {
        if (!this.currentUser) {
            const token = this.getToken();
            if (token) {
                this.currentUser = decodeJwtToken(token);
            }
        }
        return this.currentUser;
    }

    public isAuthenticated(): boolean {
        const token = this.getToken();
        if (!token) return false;

        const user = this.getCurrentUser();
        return user !== null;
    }

    public hasRole(role: UserRole): boolean {
        const user = this.getCurrentUser();
        return user?.roles.includes(role) ?? false;
    }

    public hasAnyRole(roles: UserRole[]): boolean {
        const user = this.getCurrentUser();
        return user?.roles.some(role => roles.includes(role as UserRole)) ?? false;
    }
}

// Export a singleton instance
export const authService = AuthService.getInstance(); 