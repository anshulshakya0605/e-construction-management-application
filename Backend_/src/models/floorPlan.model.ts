import { Document, model, Schema, Types } from "mongoose";
import { FloorPlanStatus } from "../shared/enums";


export interface IFloorPlan extends Document {
    _id: Types.ObjectId;
    siteId: Types.ObjectId;
    version: number;
    fileUrl: string;
    thumbnailUrl?: string;
    status: FloorPlanStatus;
    notes?: string;
    reviewedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const floorPlanSchema = new Schema<IFloorPlan>(
    {
        siteId: {
            type: Schema.Types.ObjectId,
            ref: 'Site',
            required: true,
            index: true
        },

        version: {
            type: Number,
            required: true,
            default: 1,
            min: 1
        },

        fileUrl: {
            type: String,
            trim: true,
            required: true,
        },

        thumbnailUrl: {
            type: String,
            trim: true
        },

        status: {
            type: String,
            enum: Object.values(FloorPlanStatus),
            required: true,
            index: true
        },

        notes: {
            type: String,
            trim: true
        },

        reviewedAt: {
            type: Date
        }
    },

    {
        timestamps: true,
        collection: 'floorplans'
    }
)

floorPlanSchema.index(
    {siteId: 1, version: 1},
    {unique: true}
)

export const FloorPlan = model<IFloorPlan>("FloorPlan", floorPlanSchema );