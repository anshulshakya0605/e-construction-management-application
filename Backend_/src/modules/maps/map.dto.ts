
import z from "zod";
import { City, SiteStatus, SiteType } from "../../shared/enums";

export const mapSitesQuerySchema = z.object({
    city: z.enum(
        Object.values(City) as [City, ...City[]]
    ).optional(),

    status: z.enum(
        Object.values(SiteStatus) as [SiteStatus, ...SiteStatus[]]
    ).optional(),

    siteType: z.enum(
        Object.values(SiteType) as [SiteType, ...SiteType[]]
    ).optional(),
}).strict();

export const nearbySitesQuerySchema = z.object({
    lat: z.coerce.number().min(-90).max(90),

    lng: z.coerce.number().min(-180).max(180),

    radiusKm: z.coerce.number().positive().max(500).default(10),
}).strict();

export const mapSiteIdParamsSchema = z.object({
    id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid site ID"),
}).strict();

export type MapSitesQueryDto = z.infer<typeof mapSitesQuerySchema>;
export type NearbySitesQueryDto = z.infer<typeof nearbySitesQuerySchema>;
export type MapSiteIdParamsDto = z.infer<typeof mapSiteIdParamsSchema>;