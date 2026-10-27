
import { CONFIG, ERROR_CODES, FLOOR_PLAN_MESSAGES, HTTP_STATUS, SITE_MESSAGES } from "../../shared/constants";
import { FloorPlanStatus, Role, Trade } from "../../shared/enums";
import { ApiError } from "../../utils/ApiError";
import { CreateFloorPlanInput, FloorPlanListQuery, FloorPlanResponse, RejectedFloorPlanInput, UpdateFloorPlanInput } from "./floorPlan.types";
import * as floorPlanRepository from './floorPlan.repository.js'
import * as clientRepository from '../clients/client.repository.js'
import * as employeeRepository from '../employees/employee.repository.js'
import * as taskRepository from '../tasks/task.repository.js'
import { IFloorPlan, Task } from "../../models";

const mapFloorPlanResponse = (floorPlan: IFloorPlan): FloorPlanResponse => {
    return {
        id: String(floorPlan._id),
        siteId: String(floorPlan.siteId),
        version: floorPlan.version,
        fileUrl: floorPlan.fileUrl,
        thumbnailUrl: floorPlan.thumbnailUrl,
        status: floorPlan.status,
        notes: floorPlan.notes,
        reviewedAt: floorPlan.reviewedAt,
        createdAt: floorPlan.createdAt,
        updatedAt: floorPlan.updatedAt
    }
}


const siteAccess = async (
    siteId: string,
    userId: string,
    role: Role
): Promise<void> => {
    const site = await floorPlanRepository.findSiteById(siteId);

    if (!site) {
        throw new ApiError({
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: SITE_MESSAGES.SITE_NOT_FOUND,
            errorCode: ERROR_CODES.SITE_NOT_FOUND
        })
    }

    if (role === Role.ADMIN) {
        return
    }

    if (role === Role.CLIENT) {
        const client = await clientRepository.findClientByUserId(userId);
        if (!client || String(site?.clientId) !== String(client._id)) {
            throw new ApiError({
                statusCode: HTTP_STATUS.FORBIDDEN,
                message: SITE_MESSAGES.SITE_ACCESS_DENIED,
                errorCode: ERROR_CODES.SITE_ACCESS_DENIED
            })
        }
        return;
    }

    if (role === Role.EMPLOYEE) {
        const employee = await employeeRepository.findEmployeeByUserId(userId);

        if (!employee || employee.trade !== Trade.ARCHITECT) {

            throw new ApiError({
                statusCode: HTTP_STATUS.FORBIDDEN,
                message: SITE_MESSAGES.SITE_ACCESS_DENIED,
                errorCode: ERROR_CODES.SITE_ACCESS_DENIED
            })
        }

        const assignedTask = await Task.exists({
            siteId,
            assignedToId: employee._id
        })

        if (!assignedTask) {
            throw new ApiError({
                statusCode: HTTP_STATUS.FORBIDDEN,
                message: SITE_MESSAGES.SITE_ACCESS_DENIED,
                errorCode: ERROR_CODES.SITE_ACCESS_DENIED
            })
        }
        return
    }
    throw new ApiError({
        statusCode: HTTP_STATUS.FORBIDDEN,
        message: SITE_MESSAGES.SITE_ACCESS_DENIED,
        errorCode: ERROR_CODES.SITE_ACCESS_DENIED
    })
}

export const getFloorPlansBySiteId = async (
    siteId: string,
    filters: FloorPlanListQuery,
    userId: string,
    role: Role
) => {

    const site = await floorPlanRepository.findSiteById(siteId);

    if (!site) {
        throw new ApiError({
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: SITE_MESSAGES.SITE_NOT_FOUND,
            errorCode: ERROR_CODES.SITE_NOT_FOUND
        })
    }

    await siteAccess(siteId, userId, role);

    const [floorPlan, total] = await Promise.all([
        floorPlanRepository.findFloorPlansBySiteId(siteId, filters),
        floorPlanRepository.countFloorPlansBySiteId(siteId, {
            status: filters.status
        })
    ])

    const page = filters.page ?? CONFIG.PAGINATION_DEFAULT_PAGE
    const limit = filters.limit ?? CONFIG.PAGINATION_DEFAULT_LIMIT

    return {
        data: floorPlan.map(mapFloorPlanResponse),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    }
}

export const createFloorPlan = async (
    siteId: string,
    input: CreateFloorPlanInput,
    userId: string,
    role: Role
): Promise<FloorPlanResponse> => {

    const site = await floorPlanRepository.findSiteById(siteId);

    if (!site) {
        throw new ApiError({
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: SITE_MESSAGES.SITE_NOT_FOUND,
            errorCode: ERROR_CODES.SITE_NOT_FOUND
        })
    }

    if (role === Role.ADMIN) {
        // admin can create floorPlan
    } else if (role === Role.EMPLOYEE) {
        const employee = await employeeRepository.findEmployeeByUserId(userId);

        if (!employee || employee.trade !== Trade.ARCHITECT) {
            throw new ApiError({
                statusCode: HTTP_STATUS.FORBIDDEN,
                message: SITE_MESSAGES.SITE_ACCESS_DENIED,
                errorCode: ERROR_CODES.SITE_ACCESS_DENIED
            })
        }

        await siteAccess(siteId, userId, role);

        const assignedTask = await Task.exists({
            siteId,
            assignedToId: employee?._id
        })

        if (!assignedTask) {
            throw new ApiError({
                statusCode: HTTP_STATUS.FORBIDDEN,
                message: SITE_MESSAGES.SITE_ACCESS_DENIED,
                errorCode: ERROR_CODES.SITE_ACCESS_DENIED
            })
        }
    } else {
        throw new ApiError({
            statusCode: HTTP_STATUS.FORBIDDEN,
            message: SITE_MESSAGES.SITE_ACCESS_DENIED,
            errorCode: ERROR_CODES.SITE_ACCESS_DENIED
        })
    }

    const latestFloorPlan = await floorPlanRepository.findLatestFloorPlanBySiteId(siteId);
    const nextVersion = latestFloorPlan ? latestFloorPlan.version + 1 : 1;

    const floorPlan = await floorPlanRepository.createFloorPlan({
        ...input,
        siteId,
        version: nextVersion,
        status: FloorPlanStatus.PENDING_APPROVAL
    })

    return mapFloorPlanResponse(floorPlan);
}

export const getFloorPlanById = async (
    floorPlanId: string,
    userId: string,
    role: Role
): Promise<FloorPlanResponse> => {

    const floorPlan = await floorPlanRepository.findFloorPlanById(floorPlanId);

    console.log("FloorPlan: ", floorPlan)
    console.log("floorPlanId: ", floorPlanId);
    

    if (!floorPlan) {
        throw new ApiError({
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: FLOOR_PLAN_MESSAGES.FP_NOT_FOUND,
            errorCode: ERROR_CODES.FP_NOT_FOUND
        })
    }

    await siteAccess(String(floorPlan?.siteId), userId, role);

    return mapFloorPlanResponse(floorPlan);
}

export const updateFloorPlan = async (
    floorPlanId: string,
    data: UpdateFloorPlanInput,
    userId: string,
    role: Role
): Promise <FloorPlanResponse> => {

    const floorPlan = await floorPlanRepository.findFloorPlanById(floorPlanId);

    if (!floorPlan) {
        throw new ApiError({
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: FLOOR_PLAN_MESSAGES.FP_NOT_FOUND,
            errorCode: ERROR_CODES.FP_NOT_FOUND
        })
    }

    if (role !== Role.ADMIN && role !== Role.EMPLOYEE) {
        throw new ApiError({
            statusCode: HTTP_STATUS.FORBIDDEN,
            message: SITE_MESSAGES.SITE_ACCESS_DENIED,
            errorCode: ERROR_CODES.SITE_ACCESS_DENIED
        })
    }

    await siteAccess(String(floorPlan.siteId), userId, role);

    if (floorPlan.status === FloorPlanStatus.APPROVED) {
        throw new ApiError({
            statusCode: HTTP_STATUS.BAD_REQUEST,
            message: FLOOR_PLAN_MESSAGES.FP_ALREADY_APPROVED,
            errorCode: ERROR_CODES.FP_ALREADY_REVIEWED
        })
    }

    const updatedFloorPlan = await floorPlanRepository.updateFloorPlanMetadata(floorPlanId, data);

    if (!updatedFloorPlan) {
        throw new ApiError({
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: FLOOR_PLAN_MESSAGES.FP_NOT_FOUND,
            errorCode: ERROR_CODES.FP_NOT_FOUND
        })
    }

    return mapFloorPlanResponse(updatedFloorPlan);

}

export const approveFloorPlan = async (
    floorPlanId: string,
    userId: string,
    role: Role
): Promise<FloorPlanResponse> => {

    const floorPlan = await floorPlanRepository.findFloorPlanById(floorPlanId);

    if (!floorPlan) {
        throw new ApiError({
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: FLOOR_PLAN_MESSAGES.FP_NOT_FOUND,
            errorCode: ERROR_CODES.FP_NOT_FOUND
        })
    }

    if (role !== Role.CLIENT) {
        throw new ApiError({
            statusCode: HTTP_STATUS.FORBIDDEN,
            message: SITE_MESSAGES.SITE_ACCESS_DENIED,
            errorCode: ERROR_CODES.SITE_ACCESS_DENIED
        })
    }

    await siteAccess(String(floorPlan?.siteId), userId, role);

    if (floorPlan?.status !== FloorPlanStatus.PENDING_APPROVAL) {
        throw new ApiError({
            statusCode: HTTP_STATUS.CONFLICT,
            message: FLOOR_PLAN_MESSAGES.FP_ALREADY_REVIEWED,
            errorCode: ERROR_CODES.FP_ALREADY_REVIEWED
        })
    }

    const approvedFloorPlan = await floorPlanRepository.approveFloorPlan(floorPlanId);

    if (!approvedFloorPlan) {
        throw new ApiError({
            statusCode: HTTP_STATUS.CONFLICT,
            message: FLOOR_PLAN_MESSAGES.FP_ALREADY_REVIEWED,
            errorCode: ERROR_CODES.FP_ALREADY_REVIEWED
        })
    }

    return mapFloorPlanResponse(approvedFloorPlan)
}

export const rejectFloorPlan = async (
    floorPlanId: string,
    data: RejectedFloorPlanInput,
    userId: string,
    role: Role,
): Promise<FloorPlanResponse> => {
    const floorPlan =
        await floorPlanRepository.findFloorPlanById(floorPlanId);

    if (!floorPlan) {
        throw new ApiError({
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: FLOOR_PLAN_MESSAGES.FP_NOT_FOUND,
            errorCode: ERROR_CODES.FP_NOT_FOUND
        })
    }

    if (role !== Role.CLIENT) {
        throw new ApiError({
            statusCode: HTTP_STATUS.FORBIDDEN,
            message: SITE_MESSAGES.SITE_ACCESS_DENIED,
            errorCode: ERROR_CODES.SITE_ACCESS_DENIED
        })
    }

    await siteAccess(String(floorPlan.siteId), userId, role);

    if (floorPlan.status !== FloorPlanStatus.PENDING_APPROVAL) {
        throw new ApiError({
            statusCode: HTTP_STATUS.CONFLICT,
            message: FLOOR_PLAN_MESSAGES.FP_ALREADY_REVIEWED,
            errorCode: ERROR_CODES.FP_ALREADY_REVIEWED
        })
    }

    const rejectedFloorPlan =
        await floorPlanRepository.rejectFloorPlan(
            floorPlanId,
            data.notes,
        );

    if (!rejectedFloorPlan) {
        throw new ApiError({
            statusCode: HTTP_STATUS.CONFLICT,
            message: FLOOR_PLAN_MESSAGES.FP_ALREADY_REVIEWED,
            errorCode: ERROR_CODES.FP_ALREADY_REVIEWED
        })
    }

    return mapFloorPlanResponse(rejectedFloorPlan);
};

export const deleteFloorPlan = async (
    floorPlanId: string,
    role: Role,
): Promise<void> => {
    if (role !== Role.ADMIN) {
        throw new ApiError({
            statusCode: HTTP_STATUS.FORBIDDEN,
            message: SITE_MESSAGES.SITE_ACCESS_DENIED,
            errorCode: ERROR_CODES.SITE_ACCESS_DENIED
        })
    }

    const deletedFloorPlan =
        await floorPlanRepository.deleteFloorPlan(floorPlanId);

    if (!deletedFloorPlan) {
        throw new ApiError({
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: FLOOR_PLAN_MESSAGES.FP_NOT_FOUND,
            errorCode: ERROR_CODES.FP_NOT_FOUND
        })
    }
};

