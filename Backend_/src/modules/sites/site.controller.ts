import { RequestHandler } from "express";
import { catchAsync } from "../../utils/catchAsync";
import * as siteService from './site.service.js'
import { sendListSuccess, sendSuccess } from "../../utils/response";
import { HTTP_STATUS, SITE_MESSAGES, TASK_MESSAGES } from "../../shared/constants";
import { City, SiteStatus, SiteType } from "../../shared/enums";
import { TaskListQuery } from "../tasks/task.types";



export const createSite: RequestHandler = catchAsync(
    async (req, res) => {
        const site = await siteService.createSite(req.body, String(req.user!.userId))
        
        return sendSuccess(
            res,
            HTTP_STATUS.CREATED,
            SITE_MESSAGES.SITE_CREATED,
            site,
            String(req.id)
        )
    }
)

export const getSites: RequestHandler = catchAsync(
    async (req, res) => {
        const query = {
            page: req.query.page ? Number(req.query.page) : undefined,
            limit: req.query.limit ? Number(req.query.limit) : undefined,

            status: req.query.status as SiteStatus,
            city: req.query.city as City,
            siteType: req.query.siteType as SiteType,

            clientId: req.query.clientId ? String(req.query.clientId) : undefined
        }

        const result = await siteService.getSites(query);
        
        return sendListSuccess(
            res,
            HTTP_STATUS.OK,
            SITE_MESSAGES.SITES_FETCHED,
            result.data,
            result.pagination,
            String(req.id)
        )
    }
)

export const getSiteTasks: RequestHandler = catchAsync(
    async (req, res) => {
        const result = await siteService.getSiteTasks(
            req.params.id,
            req.query as unknown as TaskListQuery,
            String(req.user!.userId),
            req.user!.role
        )

        return sendListSuccess(
            res,
            HTTP_STATUS.OK,
            TASK_MESSAGES.TASKS_FETCHED,
            result.data,
            result.pagination,
            String(req.id)
        );
    }
)

export const getSiteProgress: RequestHandler = catchAsync(
    async (req, res) => {
        const result = await siteService.getSiteProgress(
            req.params.id,
            String(req.user!.userId),
            req.user!.role
        )

        return sendSuccess(
            res,
            HTTP_STATUS.OK,
            SITE_MESSAGES.SITE_PROGRESS_FETCHED,
            result,
            String(req.id)
        )
    }
)

export const getSiteById: RequestHandler = catchAsync(
    async (req, res) => {
        const site = await siteService.getSiteById(req.params.id);
        return sendSuccess(
            res,
            HTTP_STATUS.OK,
            SITE_MESSAGES.SITE_FETCHED,
            site,
            String(req.id)
        )
    }
)

export const updateSite: RequestHandler = catchAsync(
    async (req, res) => {
        const updatedSite = await siteService.updateSite(req.params.id, req.body)

        return sendSuccess(
            res,
            HTTP_STATUS.OK,
            SITE_MESSAGES.SITE_UPDATED,
            updatedSite,
            String(req.id)
        )
    }
)

export const deleteSite: RequestHandler = catchAsync(
    async (req, res) => {
        const site = await siteService.deleteSite(req.params.id);

        return sendSuccess(
            res,
            HTTP_STATUS.OK,
            SITE_MESSAGES.SITE_DELETED,
            null,
            String(req.id)
        )
    }
)