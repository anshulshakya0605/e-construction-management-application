import { IUser } from "../../models";
import { UserListQuery, UserResponse, UserStats } from "./user.types";
import * as userRepository from './user.repository.js'
import { CONFIG, ERROR_CODES, HTTP_STATUS, USER_MESSAGES } from "../../shared/constants";
import { Types } from "mongoose";
import { ApiError } from "../../utils/ApiError";
import { Role } from "../../shared/enums";


const mapUserResponse = (user: any): UserResponse => {
    return {
        id: String(user._id),
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        city: user.city,
        role: user.role,
        accountStatus: user.accountStatus,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    }
}

export const getAllUsers = async (query: UserListQuery) => {
    const {users, total} = await userRepository.findUsers(query);
    const page = query.page ?? CONFIG.PAGINATION_DEFAULT_PAGE;
    const limit = query.page ?? CONFIG.PAGINATION_DEFAULT_LIMIT;

    return {
        users: users.map(mapUserResponse),
        pagination: {
            page, 
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    }
}

export const getUserById = async (userId: string): Promise<UserResponse> => {
    if (!Types.ObjectId.isValid(userId)) {
        throw new ApiError({
            statusCode: HTTP_STATUS.BAD_REQUEST,
            message: USER_MESSAGES.USER_ID_INVALID,
            errorCode: ERROR_CODES.INVALID_ID
        })
    }

    const user = await userRepository.findUserById(userId);
    if (!user) {
        throw new ApiError({
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: USER_MESSAGES.USER_NOT_FOUND,
            errorCode: ERROR_CODES.USER_NOT_FOUND
        })
    }
    return mapUserResponse(user);
}

export const updateUserStatus = async(
    userId: string,
    isActive: boolean,
    adminId: string
): Promise<UserResponse> => {

    if (!Types.ObjectId.isValid(userId)) {
        throw new ApiError({
            statusCode: HTTP_STATUS.BAD_REQUEST,
            message: USER_MESSAGES.USER_ID_INVALID,
            errorCode: ERROR_CODES.INVALID_ID
        })
    }

    if (userId === adminId && !isActive) {
        throw new ApiError({
            statusCode: HTTP_STATUS.BAD_REQUEST,
            message: USER_MESSAGES.USER_DEACTIVATED,
            errorCode: ERROR_CODES.USER_INACTIVE
        })
    }

    const user = await userRepository.updateUserStatus(userId, isActive);
    if (!user) {
        throw new ApiError({
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: USER_MESSAGES.USER_NOT_FOUND,
            errorCode: ERROR_CODES.USER_NOT_FOUND
        })
    }

    return mapUserResponse(user);
}

export const updateUserRole = async(
    userId: string,
    role: Role,
    adminId: string,
): Promise<UserResponse> => {

    // give an error when pass the wrong id

    if (!Types.ObjectId.isValid(userId)) {
        throw new ApiError({
            statusCode: HTTP_STATUS.BAD_REQUEST,
            message: USER_MESSAGES.USER_ID_INVALID,
            errorCode: ERROR_CODES.INVALID_ID
        })
    }

    // admin cannot change own role
    if (userId === adminId) {
        throw new ApiError({
            statusCode: HTTP_STATUS.FORBIDDEN,
            message: USER_MESSAGES.CANNOT_CHANGE_OWN_ROLE,
            errorCode: ERROR_CODES.AUTH_FORBIDDEN
        })
    }

    // find existing user
    const existingUser = await userRepository.findUserById(userId);
    if (!existingUser) {
        throw new ApiError({
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: USER_MESSAGES.USER_NOT_FOUND,
            errorCode: ERROR_CODES.USER_NOT_FOUND
        })
    }

    if (role === Role.ADMIN) {
        throw new ApiError({
            statusCode: HTTP_STATUS.FORBIDDEN,
            message: USER_MESSAGES.ADMIN_ROLE_ASSIGNMENT_NOT_ALLOWED,
            errorCode: ERROR_CODES.AUTH_FORBIDDEN
        })
    }

    // update user role 
    const user = await userRepository.updateUserRole(userId, role);
    if (!user) {
        throw new ApiError({
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: USER_MESSAGES.USER_NOT_FOUND,
            errorCode: ERROR_CODES.USER_NOT_FOUND
        })
    }

    return mapUserResponse(user);
}

export const getUserStats = async(): Promise<UserStats> => {
    return userRepository.findUserStats();
}


export const deleteUser = async (userId: string): Promise<UserResponse> => {

    if (!Types.ObjectId.isValid(userId)) {
        throw new ApiError({
            statusCode: HTTP_STATUS.BAD_REQUEST,
            message: USER_MESSAGES.USER_ID_INVALID,
            errorCode: ERROR_CODES.INVALID_ID
        })
    }

    const user = await userRepository.findUserById(userId);
    if (!user) {
        throw new ApiError({
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: USER_MESSAGES.USER_NOT_FOUND,
            errorCode: ERROR_CODES.USER_NOT_FOUND
        })
    }

    const deleteUser = await userRepository.deleteUser(userId);
    
    return mapUserResponse(deleteUser);
}