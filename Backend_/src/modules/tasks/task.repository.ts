import { FilterQuery, Types } from "mongoose";
import { ITask, Task } from "../../models";
import { TaskStatus } from "../../shared/enums";
import { CreateTaskData, TaskListQuery, TaskWithRelations, UpdateTaskInput } from "./task.types";



export const createTask = async (
    data: CreateTaskData
): Promise<TaskWithRelations> => {

    const task = await Task.create(data);

    const populatedTask = await Task.findById(task._id)
        .populate({
            path: "siteId",
            select: "name"
        })
        .populate({
            path: "assignedToId",
            select: "userId employeeCode"
        })
        .populate({
            path: "assignedById",
            select: "fullName email"
        }).lean<TaskWithRelations>();

    return populatedTask as TaskWithRelations;
}

export const findTasks = async (
    query: TaskListQuery,
    skip: number,
    limit: number
): Promise<TaskWithRelations[]> => {

    const filter: FilterQuery<ITask> = {};
    if (query.status) {
        filter.status = query.status;
    }

    if (query.siteId) {
        filter.siteId = new Types.ObjectId(query.siteId);
    }

    if (query.assignedToId) {
        filter.assignedToId = new Types.ObjectId(query.assignedToId);
    }

    return Task.find(filter)
        .populate({
            path: "siteId",
            select: "name",
        })
        .populate({
            path: "assignedToId",
            select: "userId employeeCode",
        })
        .populate({
            path: "assignedById",
            select: "fullName email",
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<TaskWithRelations[]>();
};


export const countTasks = async (
    query: TaskListQuery
): Promise<number> => {

    const filter: FilterQuery<ITask> = {};

    if (query.status) {
        filter.status = query.status
    }

    if (query.siteId) {
        filter.siteId = new Types.ObjectId(query.siteId)
    }

    if (query.assignedToId) {
        filter.assignedToId = new Types.ObjectId(query.assignedToId)
    }

    return Task.countDocuments(filter);
}

export const findTaskById = async (
    taskId: string
): Promise<TaskWithRelations | null> => {

    return Task.findById(taskId)
        .populate({
            path: "siteId",
            select: "name clientId",
        })
        .populate({
            path: "assignedToId",
            select: "userId employeeCode"
        })
        .populate({
            path: "assignedById",
            select: "fullName email"
        }).lean<TaskWithRelations>();
}

export const hasEmployeeTaskOnSite = async (
    siteId: string,
    employeeId: string
): Promise<boolean> => {

    const task = await Task.exists({
        siteId: new Types.ObjectId(siteId),
        assignedToId: new Types.ObjectId(employeeId)
    })

    return Boolean(task);
}

export const findTasksBySiteId = async (
    siteId: string,
    query: TaskListQuery,
    skip: number,
    limit: number,
    assignedToId?: string
): Promise<TaskWithRelations[]> => {

    const filter: FilterQuery<ITask> = { siteId: new Types.ObjectId(siteId)}

    if (query.status) {
        filter.status = query.status
    }

    if (assignedToId) {
        filter.assignedToId = new Types.ObjectId(assignedToId)
    }

    return Task.find(filter)
            .populate({
                path: "siteId",
                select: "name"
            })
            .populate({
                path: "assignedToId",
                select: "userId employeeCode"
            })
            .populate({
                path: "assignedById",
                select: "fullName email"
            })
            .sort({ createdAt: -1})
            .skip(skip)
            .limit(limit)
            .lean<TaskWithRelations[]>();
}

export const countTasksBySiteId = async (
    siteId: string,
    query: TaskListQuery,
    assignedToId?: string
 ): Promise<number> => {

    const filter: FilterQuery<ITask> = {siteId: new Types.ObjectId(siteId)};

    if (query.status) {
        filter.status = query.status
    }

    if (assignedToId) {
        filter.assignedToId = new Types.ObjectId(assignedToId);
    }

    return Task.countDocuments(filter);

 }

export const getSiteTaskStatusCounts = async (siteId: string): Promise<{
    _id: TaskStatus; count: number
}[]> => {
    return Task.aggregate<{_id: TaskStatus; count: number}>([
        {
            $match: {
                siteId: new Types.ObjectId(siteId)
            }
        },
        {
            $group: {
                _id: "$status",
                count: {
                    $sum : 1
                }
            }
        }
    ])
}

export const updateTask = async (
    siteId: string,
    data: UpdateTaskInput
): Promise<TaskWithRelations | null> => {

    await Task.findByIdAndUpdate(siteId, {
        $set: data
    }, {
        new: true,
        runValidators: true
    })

    return findTaskById(siteId);

}

export const updateTaskStatus = async (
    siteId: string,
    status: TaskStatus,
    completedAt?: Date
): Promise<TaskWithRelations | null> => {

    const updateData: {
        status: TaskStatus,
        completedAt?: Date | null
    } = {
        status
    }

    if (status === TaskStatus.COMPLETED) {
        updateData.completedAt = completedAt ?? new Date();
    } else {
        updateData.completedAt = null;
    }

    await Task.findByIdAndUpdate(siteId,
        {
            $set: updateData
        },
        {
            new: true,
            runValidators: true
        }
    )

    return findTaskById(siteId);

}


export const deleteTask = async (
    siteId: string
): Promise<TaskWithRelations | null> => {
    return Task.findByIdAndDelete(siteId).lean<TaskWithRelations>();
}


export const deleteTasksBySiteId = async (
    siteId: string
): Promise<number> => {
    const result = await Task.deleteMany({
        siteId: new Types.ObjectId(siteId)
    })

    return result.deletedCount;
}