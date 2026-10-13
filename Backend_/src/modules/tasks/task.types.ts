import { Types } from "mongoose";
import { TaskStatus } from "../../shared/enums";


export interface CreateTaskInput {
    title: string;
    description?: string;

    priority?: number;

    siteId: string,
    assignedToId?: string;

    dueDate?: Date;
}

export interface CreateTaskData {
    title: string;
    description?: string;

    status: TaskStatus;
    priority: number;

    siteId: Types.ObjectId;
    assignedToId?: Types.ObjectId;
    assignedById: Types.ObjectId;

    dueDate?: Date;
}


export interface UpdateTaskInput {
    title?: string;
    description?: string;

    priority?: number;

    assignedToId?: string;

    dueDate?: Date;
}

export interface UpdateTaskStatusInput {
    status: TaskStatus;
}

export interface TaskListQuery {
    page?: number;
    limit?: number;

    status?: TaskStatus;

    siteId?: string;

    assignedToId?: string;
}

export interface TaskResponse {
    id: string;

    title: string;
    description?: string;

    status: TaskStatus;
    priority: number;

    siteId: string;
    assignedToId?: string;
    assignedById: string;

    dueDate?: Date;
    completedAt?: Date;

    createdAt: Date;
    updatedAt: Date;
}

export interface TaskWithRelations {
    _id: Types.ObjectId;

    title: string;
    description?: string;

    status: TaskStatus;
    priority: number;

    siteId: | Types.ObjectId
    | {
        _id: Types.ObjectId;
        name: string;
    };

    assignedToId?: | Types.ObjectId
    | {
        _id: Types.ObjectId;
        userId: Types.ObjectId;
        employeeCode: string
    };

    assignedById?: | Types.ObjectId
    | {
        _id: Types.ObjectId;
        fullName: string;
        email: string
    };

    dueDate?: Date;
    completedAt?: Date;

    createdAt: Date;
    updatedAt: Date;
}