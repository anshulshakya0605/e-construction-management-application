import z from "zod";
import { FloorPlanStatus } from "../../shared/enums";



export const createFloorPlanSchema = z.object({
    fileUrl: z.string().trim().url(),
    thumbnailUrl: z.string().trim().url().optional(),
    notes: z.string().trim().max(1000).optional()
}).strict()

export const floorPlanListQuerySchema = z.object({
    status: z.enum(Object.values(FloorPlanStatus) as [FloorPlanStatus, ...FloorPlanStatus[]]).optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().optional()
}).strict()

export const rejectFloorPlanSchema = z.object({
    notes: z.string().trim().min(1).max(1000),
}).strict();

export const UpdateFloorPlanSchema = z.object({
    thumbnailUrl: z.string().trim().url().optional(),
    notes: z.string().trim().max(1000).optional()
}).strict().refine((data) => data.thumbnailUrl !== undefined || data.notes !== undefined, {
    message: "At least one field is required"
})