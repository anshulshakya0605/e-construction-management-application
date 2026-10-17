import { RequestHandler } from "express";
import { catchAsync } from "../../utils/catchAsync";
import * as clientService from './client.service'
import { sendListSuccess, sendSuccess } from "../../utils/response";
import { CLIENT_MESSAGES, HTTP_STATUS, SITE_MESSAGES } from "../../shared/constants";


export const getClients: RequestHandler = catchAsync(
    async (req, res) => {
        const query = {
            page : req.query.page ? Number(req.query.page) : undefined,
            limit : req.query.limit ? Number(req.query.limit) : undefined,
        }

        const result = await clientService.getClients(query);

        return sendListSuccess(
            res, 
            HTTP_STATUS.OK,
            CLIENT_MESSAGES.CLIENTS_FETCHED,
            result.data,
            result.pagination,
            String(req.id)
        )
    }
)

export const getClientById: RequestHandler = catchAsync(
    async (req, res) => {
        const client = await clientService.getClientById(req.params.id);

        return sendSuccess(
            res,
            HTTP_STATUS.OK,
            CLIENT_MESSAGES.CLIENT_FETCHED,
            client,
            String(req.id)
        )
    }
)


export const getClientSites: RequestHandler = catchAsync(
    async (req, res) => {
        const sites = await clientService.getClientSites(req.params.id, String(req.user!.userId), req.user!.role)
        return sendSuccess(
            res, 
            HTTP_STATUS.OK,
            SITE_MESSAGES.SITES_FETCHED,
            sites,
            String(req.id)
        )
    }
)