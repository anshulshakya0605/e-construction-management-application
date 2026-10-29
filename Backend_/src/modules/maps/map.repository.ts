import { FilterQuery, Types } from "mongoose";
import { ISite, Site } from "../../models";
import { MapSitesQueryDto, NearbySitesQueryDto } from "./map.dto";
import { City } from "../../shared/enums";


export const findSitesForMap = async (filters: MapSitesQueryDto) => {
    
    const sitesFilter: FilterQuery<ISite> = {
        location: {$exists: true},
        "location.type": "Point",
        "location.coordinates.0": {$exists: true},
        "location.coordinates.1": {$exists: true},
    }

    if (filters.city) {
        sitesFilter.city = filters.city
    }

    if (filters.status) {
        sitesFilter.status = filters.status
    }

    if (filters.siteType) {
        sitesFilter.siteType = filters.siteType
    }

    return Site.find(sitesFilter).select("_id name siteType status city address location").lean();
}

export const findSiteWithLocationById = async (siteId: string) => {

    if (!Types.ObjectId.isValid(siteId)) {
        return null;
    }

    return Site.findOne({
        _id: new Types.ObjectId(siteId),
        location: {$exists: true},
        "location.type": "Point",
        "location.coordinates.0": { $exists: true},
        "location.coordinates.1": { $exists: true},
    }).select("_id name siteType status city address location").lean();

}

export const findNearbySites = async (filters: NearbySitesQueryDto) => {

    const maxDistanceMeter = filters.radiusKm * 1000;

    return Site.find({
        location: {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [filters.lng, filters.lat],
                },
                $maxDistance: maxDistanceMeter
            }
        }
    }).select("_id name siteType status city address location").lean()
}

export const getCitySiteSummary = async () => {
    return Site.aggregate<{
        _id: City;
        totalSites: number;
    }>([
        {
            $group: {
                _id: "$city",
                totalSites: {$sum: 1},
            }
        },
        {
            $sort: {_id: 1},
        }
    ])
}

