import { Types } from "mongoose";
import { CreateSiteInput, SiteListQuery, SiteResponse, SiteWithRelations, UpdateSiteInput } from "./site.types";
import { ApiError } from "../../utils/ApiError";
import { CLIENT_MESSAGES, CONFIG, ERROR_CODES, HTTP_STATUS, SITE_MESSAGES, USER_MESSAGES } from "../../shared/constants";
import { Role, SiteStatus, TaskStatus } from "../../shared/enums";
import * as siteRepository from './site.repository.js'
import * as clientRepository from '../clients/client.repository.js'
import * as employeeRepository from '../employees/employee.repository.js'
import * as taskRepository from '../tasks/task.repository.js'
import { TaskListQuery } from "../tasks/task.types";
import { mapTaskResponse } from "../tasks/task.service";


const mapSiteResponse = (site: SiteWithRelations): SiteResponse => {

    const createdById = typeof site.createdById === "object" &&
        "_id" in site.createdById ? site.createdById._id : site.createdById;

    const clientId = typeof site.clientId === "object" &&
        "_id" in site.clientId ? site.clientId._id : site.clientId

    return {
        id: String(site._id),
        name: site.name,
        description: site.description,
        siteType: site.siteType,
        status: site.status,
        city: site.city,
        address: site.address,
        location: site.location,
        plotAreaSqFt: site.plotAreaSqFt,
        budget: site.budget,
        startDate: site.startDate,
        expectedEndDate: site.expectedEndDate,
        actualEndDate: site.actualEndDate,
        createdById: String(createdById),
        clientId: String(clientId),
        createdAt: site.createdAt,
        updatedAt: site.updatedAt
    }
}

/// helper to verify site access

const assertSiteAccess = async (
    siteId: string,
    userId: string,
    role: Role
) => {

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

    if (role === Role.ADMIN) {
        return site
    }

    if (role === Role.CLIENT) {
        const client = await clientRepository.findClientByUserId(userId);
       
        const siteClientId = typeof site.clientId === 'object' && site.clientId !== null &&
        '_id' in site.clientId ? String(site.clientId._id) : String(site.clientId)
        
        if (!client || siteClientId !== String(client._id)) {
            throw new ApiError({
                statusCode: HTTP_STATUS.FORBIDDEN,
                message: SITE_MESSAGES.SITE_ACCESS_DENIED,
                errorCode: ERROR_CODES.SITE_ACCESS_DENIED
            })
        }
        return site
    }

    if (role === Role.EMPLOYEE) {
        const employee = await employeeRepository.findEmployeeByUserId(userId);

        if (!employee) {
            throw new ApiError({
                statusCode: HTTP_STATUS.FORBIDDEN,
                message: SITE_MESSAGES.SITE_ACCESS_DENIED,
                errorCode: ERROR_CODES.SITE_ACCESS_DENIED
            })
        }

        const hasAssignedTask = await taskRepository.hasEmployeeTaskOnSite(siteId, String(employee._id))

        if (!hasAssignedTask) {
            throw new ApiError({
                statusCode: HTTP_STATUS.FORBIDDEN,
                message: SITE_MESSAGES.SITE_ACCESS_DENIED,
                errorCode: ERROR_CODES.SITE_ACCESS_DENIED
            })
        }

        return site;
    }

    throw new ApiError({
        statusCode: HTTP_STATUS.FORBIDDEN,
        message: SITE_MESSAGES.SITE_ACCESS_DENIED,
        errorCode: ERROR_CODES.SITE_ACCESS_DENIED
    })

}

export const createSite = async (
    input: CreateSiteInput,
    createdById: string
): Promise<SiteResponse> => {

    if (!Types.ObjectId.isValid(createdById)) {
        throw new ApiError({
            statusCode: HTTP_STATUS.BAD_REQUEST,
            message: USER_MESSAGES.USER_ID_INVALID,
            errorCode: ERROR_CODES.INVALID_ID
        })
    }

    if (!Types.ObjectId.isValid(input.clientId)) {
        throw new ApiError({
            statusCode: HTTP_STATUS.BAD_REQUEST,
            message: CLIENT_MESSAGES.INVALID_CLIENT_ID,
            errorCode: ERROR_CODES.INVALID_ID
        })
    }

    const site = await siteRepository.createSite({
        name: input.name,
        description: input.description,
        siteType: input.siteType,
        city: input.city,
        address: input.address,
        location: input.location,
        plotAreaSqFt: input.plotAreaSqFt,
        budget: input.budget,
        startDate: input.startDate,
        expectedEndDate: input.expectedEndDate,

        clientId: new Types.ObjectId(input.clientId),
        createdById: new Types.ObjectId(createdById),
        status: SiteStatus.PLANNING
    })

    const populatedSite = await siteRepository.findSiteById(String(site._id));

    if (!populatedSite) {
        throw new ApiError({
            statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
            message: "Site could not be fetched after creation",
            errorCode: ERROR_CODES.INTERNAL_ERROR
        });
    }

    return mapSiteResponse(
        populatedSite as unknown as SiteWithRelations
    )

}

export const getSites = async (query: SiteListQuery) => {

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const [sites, total] = await Promise.all([
        siteRepository.findSites(query),
        siteRepository.countSites(query)
    ])

    const data = sites.map((site) => mapSiteResponse(
        site as unknown as SiteWithRelations
    ));

    return {
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    }
}

export const getSiteTasks = async (
    siteId: string,
    query: TaskListQuery,
    userId: string,
    role: Role
) => {

    await assertSiteAccess(siteId, userId, role);

    const page = query.page ?? CONFIG.PAGINATION_DEFAULT_PAGE;
    const limit = Math.min(query.limit ?? CONFIG.PAGINATION_DEFAULT_LIMIT, CONFIG.PAGINATION_MAX_LIMIT);

    const skip = (page - 1) * limit;

    let assignedToId: string | undefined;

    // Employees can see only their own assigned tasks on this site.

    if (role === Role.EMPLOYEE) {
        const employee = await employeeRepository.findEmployeeByUserId(userId);
        if (!employee) {
            throw new ApiError({
                statusCode: HTTP_STATUS.FORBIDDEN,
                message: SITE_MESSAGES.SITE_ACCESS_DENIED,
                errorCode: ERROR_CODES.SITE_ACCESS_DENIED
            })
        }
        assignedToId = String(employee._id)
    }

    const [tasks, total] = await Promise.all([
        taskRepository.findTasksBySiteId(
            siteId, query, skip, limit, assignedToId
        ),
        taskRepository.countTasksBySiteId(
            siteId, query, assignedToId
        )
    ]);

    return {
        data: tasks.map(task => mapTaskResponse(task)),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    }

}

export const getSiteById = async (siteId: string): Promise<SiteResponse> => {
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

    return mapSiteResponse(
        site as unknown as SiteWithRelations
    )
}


export const getSiteProgress = async (
    siteId: string,
    userId: string,
    role: Role
) => {

    await assertSiteAccess(siteId, userId, role);

    const statusCounts = await taskRepository.getSiteTaskStatusCounts(siteId);

    const statusSummary: Record<TaskStatus, number> = {
        [TaskStatus.PENDING]: 0,
        [TaskStatus.IN_PROGRESS]: 0,
        [TaskStatus.REVIEW]: 0,
        [TaskStatus.COMPLETED]: 0,
        [TaskStatus.BLOCKED]: 0,
    }

     for (const item of statusCounts) {
        statusSummary[item._id] = item.count;
    }

    const totalTasks = statusCounts.reduce(
        (sum, item) => sum + item.count,
        0
    );

    const completedTask = statusSummary[TaskStatus.COMPLETED];

    const progressPercentage = totalTasks === 0 ? 0 : Math.round((completedTask / totalTasks) * 100)
    
    return {
        siteId,
        totalTasks,
        completedTask,
        progressPercentage,
        statusSummary
    }
}


export const updateSite = async (
    siteId: string,
    input: UpdateSiteInput
): Promise<SiteResponse> => {

    if (!Types.ObjectId.isValid(siteId)) {
        throw new ApiError({
            statusCode: HTTP_STATUS.BAD_REQUEST,
            message: SITE_MESSAGES.INVALID_SITE_ID,
            errorCode: ERROR_CODES.INVALID_ID
        })
    }

    const existingSite = await siteRepository.findSiteById(siteId);

    if (!existingSite) {
        throw new ApiError({
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: SITE_MESSAGES.SITE_NOT_FOUND,
            errorCode: ERROR_CODES.SITE_NOT_FOUND
        })
    }

    const updateData: Record<string, unknown> = { ...input };

    if (input.clientId) {
        if (!Types.ObjectId.isValid(input.clientId)) {
            throw new ApiError({
                statusCode: HTTP_STATUS.BAD_REQUEST,
                message: CLIENT_MESSAGES.INVALID_CLIENT_ID,
                errorCode: ERROR_CODES.INVALID_ID
            })
        }
        updateData.clientId = new Types.ObjectId(input.clientId);
    }

    const updatedSite = await siteRepository.updateSite(siteId, updateData);

    if (!updatedSite) {
        throw new ApiError({
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: SITE_MESSAGES.SITE_NOT_FOUND,
            errorCode: ERROR_CODES.SITE_NOT_FOUND
        })
    }

    return mapSiteResponse(updatedSite as unknown as SiteWithRelations)
}

export const deleteSite = async (siteId: string): Promise<SiteResponse> => {
    const site = await siteRepository.findSiteById(siteId)
    if (!site) {
        throw new ApiError({
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: SITE_MESSAGES.SITE_NOT_FOUND,
            errorCode: ERROR_CODES.SITE_NOT_FOUND
        })
    }

    const deletedSite = await siteRepository.deleteSite(siteId);

    return mapSiteResponse(deleteSite as unknown as SiteWithRelations)
}

