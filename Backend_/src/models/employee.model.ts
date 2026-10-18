import { HydratedDocument, model, Schema, Types } from "mongoose";
import { Trade } from "../shared/enums/index";


export interface IEmployee {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    trade: Trade;
    employeeCode: string;
    joiningDate: Date;
    isAvailable: boolean;
    approvedById?: Types.ObjectId;
    approvedAt?: Date;
    rejectionReason?: string;
}

const employeeSchema = new Schema<IEmployee>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true,
        },

        trade: {
            type: String,
            enum: Object.values(Trade),
            required: true,
            index: true,
        },

        employeeCode: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        joiningDate: {
            type: Date,
            default: Date.now,
        },

        isAvailable: {
            type: Boolean,
            default: true,
        },

        approvedById: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },

        approvedAt: {
            type: Date,
        },              

        rejectionReason: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
        collection: "employees",
    },
);

export type EmployeeDocument = HydratedDocument<IEmployee>;

export const Employee = model<IEmployee>("Employee", employeeSchema)
