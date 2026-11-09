import { AccountStatus, City, Role } from "../../shared/enums";


export interface UserListQuery {
    page?: number;
    limit?: number;
    search?: string;
    role?: Role;
    city?: City;
    accountStatus?: AccountStatus;
    emailVerified?: boolean;
    isActive?: boolean;
}


export interface UpdateUserStatusInput {
    isActive: boolean
}

export interface UpdateUserRoleInput {
    role: Role;
}


export interface UserResponse {
    id: string;
    email: string;
    fullName: string;
    phone?: string;
    city?: City;
    
    role: Role;
    accountStatus: AccountStatus;
    isActive: boolean;
    emailVerified: boolean;

    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserStats {
    totalUsers: number;
    totalAdmins: number;
    totalEmployees: number;
    totalClients: number;
    activeUsers: number;
    inActiveUsers: number;
}