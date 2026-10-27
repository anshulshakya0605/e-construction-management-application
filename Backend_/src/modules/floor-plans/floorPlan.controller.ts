import { RequestHandler } from "express";
import { catchAsync } from "../../utils/catchAsync";
import * as floorPlanService from './floorPlan.service.js';
import { CreateFloorPlanInput, FloorPlanListQuery, RejectedFloorPlanInput, UpdateFloorPlanInput } from "./floorPlan.types";
import { FLOOR_PLAN_MESSAGES, HTTP_STATUS, SITE_MESSAGES } from "../../shared/constants";
import { sendSuccess } from "../../utils/response";


export const getFloorPlansBySiteId : RequestHandler = catchAsync(
   async (req, res) => {

    const result = await floorPlanService.getFloorPlansBySiteId(
        req.params.siteId,
        req.query as unknown as FloorPlanListQuery,
        req.user!.userId,
        req.user!.role
    )

    return sendSuccess(
        res, 
        HTTP_STATUS.OK,
        FLOOR_PLAN_MESSAGES.FPS_FETCHED,
        result,
        String(req.id)
    )
    }
);

export const createFloorPlan : RequestHandler = catchAsync(
    async (req, res) => {

        const result = await floorPlanService.createFloorPlan(
            req.params.siteId,
            req.body as CreateFloorPlanInput,
            req.user!.userId,
            req.user!.role
        );

        return sendSuccess(
            res,
            HTTP_STATUS.CREATED,
            FLOOR_PLAN_MESSAGES.FP_CREATED,
            result,
            String(req.id)
        )
    }
)

export const getFloorPlanById : RequestHandler = catchAsync(
    async (req, res) => {
        
        const result = await floorPlanService.getFloorPlanById(
            req.params.id,
            req.user!.userId,
            req.user!.role
        )

        return sendSuccess(
            res,
            HTTP_STATUS.OK,
            FLOOR_PLAN_MESSAGES.FP_FETCHED,
            result,
            String(req.id)
        )
    }
)

export const updateFloorPlan : RequestHandler = catchAsync(
    async (req, res) => {
        
        const result = await floorPlanService.updateFloorPlan(
            req.params.id,
            req.body as UpdateFloorPlanInput,
            req.user!.userId,
            req.user!.role
        );
        
        return sendSuccess (
            res, 
            HTTP_STATUS.OK,
            FLOOR_PLAN_MESSAGES.FP_UPDATED,
            result, 
            String(req.id)
        )
    }
)

export const approveFloorPlan : RequestHandler = catchAsync(
    async (req, res) => {

        const result = await floorPlanService.approveFloorPlan(
            req.params.id,
            req.user!.userId,
            req.user!.role
        )

        return sendSuccess(
            res,
            HTTP_STATUS.OK,
            FLOOR_PLAN_MESSAGES.FP_APPROVED,
            result,
            String(req.id)
        )
    }
)

export const rejectFloorPlan : RequestHandler = catchAsync(
    async (req, res) => {

        const result = await floorPlanService.rejectFloorPlan(
            req.params.id,
            req.body as RejectedFloorPlanInput,
            req.user!.userId,
            req.user!.role
        )

        return sendSuccess(
            res, 
            HTTP_STATUS.OK,
            FLOOR_PLAN_MESSAGES.FP_REJECTED,
            result,
            String(req.id)
        )
    }
)

export const deleteFloorPlan : RequestHandler = catchAsync(
    async (req, res) => {

        const result = await floorPlanService.deleteFloorPlan(
            req.params.id,
            req.user!.role
        )

        return sendSuccess(
            res,
            HTTP_STATUS.OK,
            FLOOR_PLAN_MESSAGES.FP_DELETED,
            null,
            String(req.id)
        )
    }
)