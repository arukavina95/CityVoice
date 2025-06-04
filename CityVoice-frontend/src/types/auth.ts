export interface JwtPayload {
    userId: number;
    username: string;
    email: string;
    roles: string[];
}

export type UserRole = 'Građanin' | 'Administrator' | 'Službenik'; 