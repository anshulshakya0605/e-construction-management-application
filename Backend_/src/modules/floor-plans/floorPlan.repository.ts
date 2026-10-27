import { FilterQuery, Types } from "mongoose";
import { FloorPlan, IFloorPlan, Site } from "../../models"
import { CreateFloorPlanInput, FloorPlanListQuery, UpdateFloorPlanInput } from "./floorPlan.types";
import { FloorPlanStatus } from "../../shared/enums";


export const findSiteById = async (siteId: string) => {
    return Site.findById(siteId);
}

export const findFloorPlanById = async (floorPlanId: string): Promise<IFloorPlan | null> => {
    return FloorPlan.findById(floorPlanId);
}

export const findFloorPlansBySiteId = async (
    siteId: string,
    filters: FloorPlanListQuery
): Promise<IFloorPlan[]> => {

    const floorPlanFilter: FilterQuery<IFloorPlan> = { siteId: new Types.ObjectId(siteId)}

    if (filters.status) {
        floorPlanFilter.status = filters.status
    }

    return FloorPlan.find(floorPlanFilter)
        .sort({ version: -1 })
        .skip(((filters.page ?? 1) - 1) * (filters.limit ?? 20))
        .limit(filters.limit ?? 20)
}

export const countFloorPlansBySiteId = async (
    siteId: string,
    filters: Pick<FloorPlanListQuery, "status">,
): Promise<number> => {

    const floorPlanFilter: FilterQuery<IFloorPlan> = { siteId: new Types.ObjectId(siteId) };

     if (filters.status) {
        floorPlanFilter.status = filters.status;
    }

    return FloorPlan.countDocuments(floorPlanFilter);
}

export const findLatestFloorPlanBySiteId = async (
    siteId: string,
): Promise<IFloorPlan | null> => {
    return FloorPlan.findOne({ siteId: new Types.ObjectId(siteId) }).sort({ version: -1 });
};

export const createFloorPlan = async (
    data: CreateFloorPlanInput & {
        siteId: string,
        version: number,
        status: FloorPlanStatus
    }

): Promise<IFloorPlan> => {
    return FloorPlan.create(data)
}

export const approveFloorPlan = async (floorPlanId: string): Promise<IFloorPlan | null> => {
    return FloorPlan.findOneAndUpdate(
        {
            _id: floorPlanId,
            status: FloorPlanStatus.PENDING_APPROVAL
        },

        {
            $set: {
                status: FloorPlanStatus.APPROVED,
                reviewedAt: new Date()
            }
        },

        {
            new: true,
            runValidators: true
        }
    )
}

export const rejectFloorPlan = async (
    floorPlanId: string,
    notes: string
): Promise<IFloorPlan | null> => {
    return FloorPlan.findOneAndUpdate(
        {
            _id: floorPlanId,
            status: FloorPlanStatus.PENDING_APPROVAL
        },

        {
            $set: {
                status: FloorPlanStatus.REJECTED,
                notes,
                reviewedAt: new Date()
            }
        },

        {
            new: true,
            runValidators: true
        }
    )
}

export const updateFloorPlanMetadata = async(
    floorPlanId: string,
    data: UpdateFloorPlanInput
): Promise<IFloorPlan | null> => {

    return FloorPlan.findByIdAndUpdate(
        floorPlanId,
        {
            $set: data
        },
        {
            new: true,
            runValidators: true
        }
    )
}


export const deleteFloorPlan = async (floorPlanId: string): Promise<IFloorPlan | null> => {
    return FloorPlan.findByIdAndDelete(floorPlanId);
}