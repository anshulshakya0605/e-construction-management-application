import { RequestHandler } from "express";
import { catchAsync } from "../../utils/catchAsync";
import * as userService from './user.service.js'
import { UpdateUserRoleInput, UpdateUserStatusInput, UserListQuery } from "./user.types";
import { sendListSuccess, sendSuccess } from "../../utils/response";
import { HTTP_STATUS, USER_MESSAGES } from "../../shared/constants";


export const getAllUsers: RequestHandler = catchAsync(
    async (req, res) => {
       
        const result = await userService.getAllUsers(req.query as unknown as UserListQuery);
       
        return sendListSuccess(
            res,
            HTTP_STATUS.OK,
            USER_MESSAGES.USERS_FETCHED,
            result.users,
            result.pagination,
            String(req.id)
        )
    }
)

export const getUserById: RequestHandler = catchAsync(
    async (req, res) => {
        
        const result = await userService.getUserById(req.params.id);
        
        return sendSuccess(
            res,
            HTTP_STATUS.OK,
            USER_MESSAGES.USER_FETCHED,
            result,
            String(req.id)
        )
    }
)


export const getUserStats: RequestHandler = catchAsync(
    async (req, res) => {
       
        const result = await userService.getUserStats();

        return sendSuccess(
            res,
            HTTP_STATUS.OK,
            USER_MESSAGES.USERS_FETCHED,
            result,
            String(req.id)
        )
    }
)

export const updateUserStatus: RequestHandler = catchAsync(
    async (req, res) => {
        const input = req.body as unknown as UpdateUserStatusInput
        console.log("req.params.id: ", req.params.id);
        console.log("isActive: ", input.isActive);
        console.log("userId: ", req.user!.userId);
        
        const result = await userService.updateUserStatus(
            req.params.id,
            input.isActive,
            req.user!.userId
        );

        const message = input.isActive ? USER_MESSAGES.USER_ACTIVATED : USER_MESSAGES.USER_DEACTIVATED
        
        return sendSuccess(
            res,
            HTTP_STATUS.OK,
            message,
            result,
            String(req.id)
        )
    }
)

export const updateUserRole: RequestHandler = catchAsync(
    async (req, res) => {

        const result = await userService.updateUserRole(
            req.params.id,
            req.body.role,
            req.user!.userId
        );

        return sendSuccess(
            res,
            HTTP_STATUS.OK,
            USER_MESSAGES.USER_ROLE_UPDATED,
            result,
            String(req.id)
        )
    }
)

export const deleteUser: RequestHandler = catchAsync(
    async (req, res) => {

        const result = await userService.deleteUser(req.params.id, req.user!.userId);
        
        return sendSuccess(
            res,
            HTTP_STATUS.OK,
            USER_MESSAGES.USER_DELETED,
            null,
            String(req.id)
        )
    }
)