import { FloorPlanStatus } from "../../shared/enums";


export interface CreateFloorPlanInput {
    fileUrl: string;
    thumbnailUrl?: string,
    notes?: string
}

export interface FloorPlanListQuery {
    page?: number;
    limit?: number;
    status?: FloorPlanStatus
}

export interface RejectedFloorPlanInput {
    notes: string
}

export interface UpdateFloorPlanInput {
    thumbnailUrl?: string;
    notes?: string;
}

export interface FloorPlanResponse {
    id: string;
    siteId: string;
    version: number;
    fileUrl: string;
    thumbnailUrl?: string;
    status: FloorPlanStatus;
    notes?: string;
    reviewedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}