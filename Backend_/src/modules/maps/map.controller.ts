import { RequestHandler } from "express";
import { catchAsync } from "../../utils/catchAsync";
import * as mapService from './map.service.js';
import { MapSitesQueryDto, NearbySitesQueryDto } from "./map.dto";
import { sendSuccess } from "../../utils/response";
import { HTTP_STATUS, MAP_MESSAGES } from "../../shared/constants";


export const getMapSites: RequestHandler = catchAsync(
    async (req, res) => {
        const result = await mapService.getMapSites(
            req.query as unknown as MapSitesQueryDto
        )

        return sendSuccess(
            res,
            HTTP_STATUS.OK,
            MAP_MESSAGES.MAP_SITES_FETCHED,
            result,
            String(req.id)
        )
    }
)

export const getMapSiteById: RequestHandler = catchAsync(
    async (req, res) => {

        const result = await mapService.getMapSiteById(
            req.params.id,
            req.user!.userId,
            req.user!.role
        )
        return sendSuccess(
            res,
            HTTP_STATUS.OK,
            MAP_MESSAGES.MAP_SITE_FETCHED,
            result,
            String(req.id)
        )
    }
)

export const getNearbyMapSites: RequestHandler = catchAsync(
    async (req, res) => {
        
        const result = await mapService.getNearbyMapSites(req.query as unknown as NearbySitesQueryDto);

        return sendSuccess(
            res,
            HTTP_STATUS.OK,
            MAP_MESSAGES.NEARBY_SITES_FETCHED,
            result,
            String(req.id)
        )
    }
)


export const getCitiesSummary : RequestHandler = catchAsync(
    async (req, res) => {

        const result = await mapService.getCitySiteSummary();
        return sendSuccess(
            res, 
            HTTP_STATUS.OK,
            MAP_MESSAGES.CITY_SUMMARY_FETCHED,
            result,
            String(req.id)
        )
    }
)
