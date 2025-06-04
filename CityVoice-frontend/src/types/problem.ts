export interface ProblemDto {
    id: number;
    title: string;
    description: string;
    imageUrl: string | null;
    reportedAt: string; // ISO date string
    latitude: number;
    longitude: number;
    reporterUsername: string;
    problemTypeName: string;
    statusName: string;
    statusId: number;
}

export interface CreateProblemDto {
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    problemTypeId: number;
    image?: File; // Optional file for image upload
}

export interface ProblemFilter {
    statusId?: number | null;
    problemTypeId?: number | null;
    searchQuery?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    radiusKm?: number | null;
}

export interface NoteDto {
    id: number;
    content: string;
    createdAt: string;
    username: string;
}

export interface CreateNoteDto {
    content: string;
} 