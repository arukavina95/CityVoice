import { JwtPayload } from '../types/auth';

export const decodeJwtToken = (token: string): JwtPayload | null => {
    try {
        // JWT tokens are in format: header.payload.signature
        const base64Url = token.split('.')[1];
        if (!base64Url) {
            return null;
        }

        // Convert base64url to base64
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        
        // Decode base64 and parse JSON
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        const payload = JSON.parse(jsonPayload);

        // Mapiraj claimove na ono što frontend očekuje
        return {
            userId: payload.nameid, // ili parseInt(payload.nameid)
            username: payload.unique_name,
            email: payload.email,
            roles: Array.isArray(payload.role) ? payload.role : [payload.role], // uvijek array!
        };


        
    } catch (error) {
        console.error('Error decoding JWT token:', error);
        return null;
    }
}; 