import { City, SiteStatus, SiteType } from "../../shared/enums";


export interface MapSiteQuery {
    city?: City;
    status?: SiteStatus;
    siteType?: SiteType
}

export interface NearBySiteQuery {
    lat: number;
    lng: number;
    radiusKm: number;
}

export interface GeoPoint {
    type: "Point";
    coordinates: [number, number];
}

export interface MapSiteProperties {
    id: string;
    name: string;
    siteType: SiteType;
    status: SiteStatus;
    city: City;
    address: string;
}

export interface MapSiteFeature {
    type: "Feature";
    geometry: GeoPoint;
    properties: MapSiteProperties;
}

export interface MapSiteFeatureCollection {
    type: "FeatureCollection";
    features: MapSiteFeature[];
}

export interface CitySummary {
    city: City;
    totalSites: number;
}