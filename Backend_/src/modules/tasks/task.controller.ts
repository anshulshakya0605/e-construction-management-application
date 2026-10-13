import { RequestHandler } from "express";
import { catchAsync } from "../../utils/catchAsync";
import * as taskService from './task.service.js'
import { sendListSuccess, sendSuccess } from "../../utils/response";
import { HTTP_STATUS, TASK_MESSAGES } from "../../shared/constants";


export const createTask: RequestHandler = catchAsync(
    async (req, res) => {
        const task = await taskService.createTask(req.body, req.user!.userId);

        return sendSuccess(
            res,
            HTTP_STATUS.CREATED,
            TASK_MESSAGES.TASK_CREATED,
            task,
            String(req.id)
        )
    }
)

export const getTasks: RequestHandler = catchAsync(
    async (req, res) => {
        const result = await taskService.getTasks(req.query);

        return sendListSuccess(
            res,
            HTTP_STATUS.OK,
            TASK_MESSAGES.TASKS_FETCHED,
            result.data,
            result.pagination,
            String(req.id)
        )
    }
)

export const getTaskById: RequestHandler = catchAsync(
    async (req, res) => {
        const task = await taskService.getTaskById(req.params.id, String(req.user!.userId), req.user!.role);

        return sendSuccess(
            res,
            HTTP_STATUS.OK,
            TASK_MESSAGES.TASK_FETCHED,
            task,
            String(req.id)
        )
    }
)

export const updateTask: RequestHandler = catchAsync(
    async (req, res) => {
        const task = await taskService.
        updateTask(
            req.params.id!, 
            req.body,
            String(req.user!.userId),
            req.user!.role
        )

        return sendSuccess(
            res, 
            HTTP_STATUS.OK,
            TASK_MESSAGES.TASK_UPDATED,
            task,
            String(req.id)
        )
    }
)

export const updateTaskStatus: RequestHandler = catchAsync(
    async (req, res) => {
        const task = await taskService
        .updateTaskStatus(
            req.params.id!, 
            req.body.status,
            String(req.user!.userId),
            req.user!.role
        );

        return sendSuccess(
            res, 
            HTTP_STATUS.OK,
            TASK_MESSAGES.TASK_STATUS_UPDATED,
            task,
            String(req.id)
        )
    }
)

export const deleteTask: RequestHandler = catchAsync(
    async (req, res) => {
        const task = await taskService.deleteTask(req.params.id!);
        
        return sendSuccess(
            res,
            HTTP_STATUS.OK,
            TASK_MESSAGES.TASK_DELETED,
            null,
            String(req.id)
        )
    }
)

export const getMyTasks: RequestHandler = catchAsync(
    async (req, res) => {
        const result = await taskService.getMyTasks(req.user!.userId, req.query);

        return sendListSuccess(
            res, 
            HTTP_STATUS.OK,
            TASK_MESSAGES.TASKS_FETCHED,
            result.data,
            result.pagination,
            String(req.id)
        )
    }
) 