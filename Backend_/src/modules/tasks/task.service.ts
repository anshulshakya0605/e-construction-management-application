import { Types } from "mongoose"
import { CreateTaskData, CreateTaskInput, TaskListQuery, TaskResponse, TaskWithRelations, UpdateTaskInput } from "./task.types"
import { ApiError } from "../../utils/ApiError";
import { CONFIG, EMPLOYEE_MESSAGES, ERROR_CODES, HTTP_STATUS, SITE_MESSAGES, TASK_MESSAGES, USER_MESSAGES } from "../../shared/constants";
import * as siteRepository from '../sites/site.repository.js'
import * as employeeRepository from '../employees/employee.repository.js'
import * as taskRepository from './task.repository.js'
import * as clientRepository from '../clients/client.repository.js'
import { AccountStatus, Role, TaskStatus } from "../../shared/enums";


const mapTaskResponse = (task: TaskWithRelations): TaskResponse => {
    const getId = (value: Types.ObjectId | { _id: Types.ObjectId } | undefined) => {

        if (!value) return undefined;

        if (typeof value === 'object' && '_id' in value) {
            return String(value._id)
        }
        return String(value)
    }

    return {
        id: String(task._id),
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        siteId: getId(task.siteId)!,
        assignedToId: getId(task.assignedToId),
        assignedById: getId(task.assignedById)!,
        dueDate: task.dueDate,
        completedAt: task.completedAt,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
    }
}

const validateTaskReferences = async (
    siteId: string,
    assignedToId?: string
): Promise<void> => {

    if (!Types.ObjectId.isValid(siteId)) {
        throw new ApiError({
            statusCode: HTTP_STATUS.BAD_REQUEST,
            message: SITE_MESSAGES.INVALID_SITE_ID,
            errorCode: ERROR_CODES.INVALID_ID
        })
    }

    const site = await siteRepository.findSiteById(siteId);

    if (!site) {
        throw new ApiError({
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: SITE_MESSAGES.SITE_NOT_FOUND,
            errorCode: ERROR_CODES.SITE_NOT_FOUND
        })
    }

    if (!assignedToId) {
        return;
    }

    if (!Types.ObjectId.isValid(assignedToId)) {
        throw new ApiError({
            statusCode: HTTP_STATUS.BAD_REQUEST,
            message: EMPLOYEE_MESSAGES.EMPLOYEE_INVALID_ID,
            errorCode: ERROR_CODES.INVALID_ID
        })
    }

    const employee = await employeeRepository.findEmployeeById(assignedToId);

    if (!employee) {
        throw new ApiError({
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: EMPLOYEE_MESSAGES.EMPLOYEE_NOT_FOUND,
            errorCode: ERROR_CODES.EMP_NOT_FOUND
        })
    }

    const user = await employeeRepository.findUserById(String(employee.userId))

    if (!user || user.accountStatus !== AccountStatus.ACTIVE || !user.isActive) {
        throw new ApiError({
            statusCode: HTTP_STATUS.BAD_REQUEST,
            message: EMPLOYEE_MESSAGES.EMPLOYEE_NOT_ACTIVE,
            errorCode: ERROR_CODES.EMP_NOT_ACTIVE
        })
    }

}

const assertTaskAccess = async (
    taskId: string,
    userId: string,
    role: Role
) => {
    if (!Types.ObjectId.isValid(taskId)) {
        throw new ApiError({
            statusCode: HTTP_STATUS.BAD_REQUEST,
            message: TASK_MESSAGES.TASK_INVALID_ID,
            errorCode: ERROR_CODES.INVALID_ID
        });
    }

    const task = await taskRepository.findTaskById(taskId);

    if (!task) {
        throw new ApiError({
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: TASK_MESSAGES.TASK_NOT_FOUND,
            errorCode: ERROR_CODES.TASK_NOT_FOUND
        });
    }

    // Admin can access every task.
    if (role === Role.ADMIN) {
        return task;
    }

    if (role === Role.EMPLOYEE) {
        const employee =
            await employeeRepository.findEmployeeByUserId(userId);

        if (
            !employee ||
            !task.assignedToId ||
            String(
                typeof task.assignedToId === "object" &&
                    "_id" in task.assignedToId
                    ? task.assignedToId._id
                    : task.assignedToId
            ) !== String(employee._id)
        ) {
            throw new ApiError({
                statusCode: HTTP_STATUS.FORBIDDEN,
                message: TASK_MESSAGES.TASK_ACCESS_DENIED,
                errorCode: ERROR_CODES.TASK_ACCESS_DENIED
            });
        }

        return task;
    }

    if (role === Role.CLIENT) {
        const client =
            await clientRepository.findClientByUserId(userId);

        if (!client) {
            throw new ApiError({
                statusCode: HTTP_STATUS.FORBIDDEN,
                message: TASK_MESSAGES.TASK_ACCESS_DENIED,
                errorCode: ERROR_CODES.TASK_ACCESS_DENIED
            });
        }

        const site = task.siteId;

        const siteClientId =
            typeof site === "object" &&
                site !== null &&
                "clientId" in site
                ? site.clientId
                : undefined;

        const ownerId =
            typeof siteClientId === "object" &&
                siteClientId !== null &&
                "_id" in siteClientId
                ? siteClientId._id
                : siteClientId;

        if (String(ownerId) !== String(client._id)) {
            throw new ApiError({
                statusCode: HTTP_STATUS.FORBIDDEN,
                message: TASK_MESSAGES.TASK_ACCESS_DENIED,
                errorCode: ERROR_CODES.TASK_ACCESS_DENIED
            });
        }

        return task;
    }

    throw new ApiError({
        statusCode: HTTP_STATUS.FORBIDDEN,
        message: TASK_MESSAGES.TASK_ACCESS_DENIED,
        errorCode: ERROR_CODES.TASK_ACCESS_DENIED
    });
};

export const createTask = async (
    input: CreateTaskInput,
    assignedById: string
): Promise<TaskResponse> => {

    await validateTaskReferences(input.siteId, input.assignedToId)

    if (!Types.ObjectId.isValid(assignedById)) {
        throw new ApiError({
            statusCode: HTTP_STATUS.BAD_REQUEST,
            message: USER_MESSAGES.USER_ID_INVALID,
            errorCode: ERROR_CODES.INVALID_ID
        })
    }

    const data: CreateTaskData = {
        title: input.title,
        description: input.description,
        priority: input.priority ?? 1,
        siteId: new Types.ObjectId(input.siteId),
        assignedToId: input.assignedToId ? new Types.ObjectId(input.assignedToId) : undefined,
        assignedById: new Types.ObjectId(assignedById),
        status: TaskStatus.PENDING,
        dueDate: input.dueDate
    }

    const task = await taskRepository.createTask(data);

    return mapTaskResponse(task);

}

export const getTasks = async (
    query: TaskListQuery
) => {

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit

    const [tasks, total] = await Promise.all([
        taskRepository.findTasks(query, skip, limit),
        taskRepository.countTasks(query)
    ])

    return {
        data: tasks.map(mapTaskResponse),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    }

}

export const getMyTasks = async (
    userId: string,
    query: TaskListQuery
) => {

    const employee = await employeeRepository.findEmployeeByUserId(userId);

    if (!employee) {
        throw new ApiError({
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: EMPLOYEE_MESSAGES.EMPLOYEE_NOT_FOUND,
            errorCode: ERROR_CODES.EMP_NOT_FOUND
        })
    }

    const page = query.page ?? CONFIG.PAGINATION_DEFAULT_PAGE;

    const limit = Math.min(query.limit ?? CONFIG.PAGINATION_DEFAULT_LIMIT, CONFIG.PAGINATION_MAX_LIMIT);

    const skip = (page - 1) * limit;

    const myTaskQuery: TaskListQuery = { ...query, assignedToId: String(employee._id) };

    const [tasks, total] = await Promise.all([
        taskRepository.findTasks(myTaskQuery, skip, limit),
        taskRepository.countTasks(myTaskQuery)
    ])

    return {
        data: tasks.map(mapTaskResponse),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    }
}

export const getTaskById = async (
    taskId: string,
    userId: string,
    role: Role
): Promise<TaskResponse> => {

    const task = await assertTaskAccess(taskId, userId, role);

    return mapTaskResponse(task as TaskWithRelations);
}

export const updateTask = async (
    taskId: string,
    input: UpdateTaskInput,
    userId: string,
    role: Role
): Promise<TaskResponse> => {

    // first check task ownership access

    const currentTask = await assertTaskAccess(taskId, userId, role)

    //Validate references only if they are being changed.

    const currentSiteId = String(
        typeof currentTask.siteId === 'object' &&
            currentTask.siteId !== null &&
            "_id" in currentTask.siteId ? currentTask.siteId._id : currentTask.siteId
    );

    if (input.assignedToId !== undefined) {
    await validateTaskReferences(
        currentSiteId,
        input.assignedToId
    );
}

    const updatedData: Record<string, unknown> = { ...input };

    if (input.assignedToId !== undefined) {
        if (!Types.ObjectId.isValid(input.assignedToId)) {
            throw new ApiError({
                statusCode: HTTP_STATUS.BAD_REQUEST,
                message: EMPLOYEE_MESSAGES.EMPLOYEE_INVALID_ID,
                errorCode: ERROR_CODES.INVALID_ID
            })
        }

        const employee = await employeeRepository.findEmployeeById(input.assignedToId);

        if (!employee) {
            throw new ApiError({
                statusCode: HTTP_STATUS.NOT_FOUND,
                message: EMPLOYEE_MESSAGES.EMPLOYEE_NOT_FOUND,
                errorCode: ERROR_CODES.EMP_NOT_FOUND
            })
        }

        updatedData.assignedToId = new Types.ObjectId(input.assignedToId)
    }

    const updatedTask = await taskRepository.updateTask(taskId, updatedData);

    if (!updatedTask) {
        throw new ApiError({
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: TASK_MESSAGES.TASK_NOT_FOUND,
            errorCode: ERROR_CODES.TASK_NOT_FOUND
        })
    }

    return mapTaskResponse(updatedTask)

}


export const updateTaskStatus = async (
    taskId: string,
    status: TaskStatus,
    userId: string, 
    role: Role
): Promise<TaskResponse> => {

    const currentTask = await assertTaskAccess(taskId, userId, role);

    const allowedTransitions: Record<TaskStatus, TaskStatus[]> = {
        [TaskStatus.PENDING]: [
            TaskStatus.IN_PROGRESS,
            TaskStatus.BLOCKED,
        ],
        [TaskStatus.IN_PROGRESS]: [
            TaskStatus.REVIEW,
            TaskStatus.BLOCKED,
        ],
        [TaskStatus.REVIEW]: [
            TaskStatus.COMPLETED,
            TaskStatus.IN_PROGRESS,
        ],
        [TaskStatus.BLOCKED]: [
            TaskStatus.PENDING,
            TaskStatus.IN_PROGRESS,
        ],
        [TaskStatus.COMPLETED]: [],
    };

    if (
        currentTask.status !== status &&
        !allowedTransitions[currentTask.status].includes(status)
    ) {
        throw new ApiError({
            statusCode: HTTP_STATUS.BAD_REQUEST,
            message: TASK_MESSAGES.TASK_INVALID_TRANSITION,
            errorCode: ERROR_CODES.TASK_INVALID_TRANSITION,
        });
    }

    const updatedTask = await taskRepository.updateTaskStatus(
        taskId,
        status,
    );

    if (!updatedTask) {
        throw new ApiError({
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: TASK_MESSAGES.TASK_NOT_FOUND,
            errorCode: ERROR_CODES.TASK_NOT_FOUND,
        });
    }

    return mapTaskResponse(updatedTask);
};


export const deleteTask = async (taskId: string) => {
     if (!Types.ObjectId.isValid(taskId)) {
        throw new ApiError({
           statusCode: HTTP_STATUS.BAD_REQUEST,
           message: TASK_MESSAGES.TASK_INVALID_ID,
            errorCode: ERROR_CODES.INVALID_ID
        });
    }

    const task = await taskRepository.findTaskById(taskId);

    if (!task) {
        throw new ApiError({
            statusCode: HTTP_STATUS.NOT_FOUND,
           message: TASK_MESSAGES.TASK_NOT_FOUND,
           errorCode: ERROR_CODES.TASK_NOT_FOUND
        });
    }

     const deleted = await taskRepository.deleteTask(taskId);

     if (!deleted) {
        throw new ApiError({
           statusCode: HTTP_STATUS.NOT_FOUND,
           message: TASK_MESSAGES.TASK_NOT_FOUND,
           errorCode: ERROR_CODES.TASK_NOT_FOUND
        });
    }

    return deleted;
    
}

