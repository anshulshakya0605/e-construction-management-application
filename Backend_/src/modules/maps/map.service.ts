import { Role } from "../../shared/enums";
import { MapSiteFeature, MapSiteFeatureCollection, MapSiteProperties } from "./map.types";
import * as siteRepository from '../sites/site.repository.js'
import * as clientRepository from '../clients/client.repository.js'
import * as employeeRepository from '../employees/employee.repository.js'
import * as mapRepository from './map.repository.js'
import { ApiError } from "../../utils/ApiError";
import { EMPLOYEE_MESSAGES, ERROR_CODES, HTTP_STATUS, SITE_MESSAGES } from "../../shared/constants";
import { Task } from "../../models";
import { MapSitesQueryDto, NearbySitesQueryDto } from "./map.dto";
import { Types } from "mongoose";


/// // Convert a site document into a GeoJSON Feature.
export const mapSiteToFeature = (site: any) : MapSiteFeature => {

    const properties: MapSiteProperties = {
        id: String(site._id),
        name: site.name,
        siteType: site.siteType,
        status: site.status,
        city: site.city,
        address: site.address
    }

    return {
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: [
            site.location.coordinates[0],
            site.location.coordinates[1]
            ]
        },
        properties
    }
}


//// Convert site records into a GeoJSON FeatureCollection.

const mapSitesToFeaturesCollection = (sites: any[]): MapSiteFeatureCollection => ({
    type: "FeatureCollection",
    features: sites.map(mapSiteToFeature)
});


// Check whether a user is allowed to access a particular site.

const checkSiteAccess = async(
    siteId: string,
    userId: string,
    role: Role
): Promise<void> => {
    const site = await siteRepository.findSiteById(siteId);

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

        if (!client || String(site.clientId) !== String(client._id)) {
            throw new ApiError({
                statusCode: HTTP_STATUS.FORBIDDEN,
                message: SITE_MESSAGES.SITE_ACCESS_DENIED,
                errorCode: ERROR_CODES.SITE_ACCESS_DENIED
            })
        }
        return
    }

    if (role === Role.EMPLOYEE) {
        
        const employee = await employeeRepository.findEmployeeByUserId(userId);

        if (!employee) {
            throw new ApiError({
                statusCode: HTTP_STATUS.NOT_FOUND,
                message: EMPLOYEE_MESSAGES.EMPLOYEE_NOT_FOUND,
                errorCode: ERROR_CODES.EMP_NOT_FOUND
            })
        }

        const assignedTask = await Task.exists({
            siteId: site._id,
            assignedToId: employee._id
        });

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


/// GET api/maps/sites

export const getMapSites = async(filters: MapSitesQueryDto): Promise<MapSiteFeatureCollection> => {

    const mapSites = await mapRepository.findSitesForMap(filters);
    return mapSitesToFeaturesCollection(mapSites);
}


export const getMapSiteById = async(
    siteId: string,
    userId: string,
    role: Role
): Promise<MapSiteFeature> => {

    if (!Types.ObjectId.isValid(siteId)) {
        throw new ApiError({
            statusCode: HTTP_STATUS.BAD_REQUEST,
            message: SITE_MESSAGES.INVALID_SITE_ID,
            errorCode: ERROR_CODES.INVALID_ID
        })
    }

    await checkSiteAccess(siteId, userId, role);

    const mapSite = await mapRepository.findSiteWithLocationById(siteId);
    console.log("siteId: ", siteId);
    
    console.log("mapSites: ", mapSite)

    if (!mapSite) {
        throw new ApiError({
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: SITE_MESSAGES.SITE_NOT_FOUND,
            errorCode: ERROR_CODES.SITE_NOT_FOUND
        })
    }
    
    return mapSiteToFeature(mapSite);
}

export const getNearbyMapSites = async(filters: NearbySitesQueryDto): Promise<MapSiteFeatureCollection> => {

    const mapSites = await mapRepository.findNearbySites(filters);

    if (!mapSites) {
        throw new ApiError({
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: SITE_MESSAGES.SITE_NOT_FOUND,
            errorCode: ERROR_CODES.SITE_NOT_FOUND
        })
    }

    return mapSitesToFeaturesCollection(mapSites);
}

export const getCitySiteSummary = async () => {

    const summary = await mapRepository.getCitySiteSummary();

    return summary.map((item) => ({
        city: item._id,
        totalSites: item.totalSites,
    }))
}