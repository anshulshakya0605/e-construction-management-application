import { Document, model, Schema, Types } from "mongoose";
import { TaskStatus } from "../shared/enums";


export interface ITask extends Document {
    _id: Types.ObjectId;
    
    title: string;
    description?: string;

    status: TaskStatus;
    priority: number;

    siteId: Types.ObjectId;
    assignedToId?: Types.ObjectId;
    assignedById?: Types.ObjectId;

    dueDate?: Date;
    completedAt?: Date;
}

const taskSchema = new Schema<ITask>(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            trim: true
        },

        status: {
            type: String,
            enum: Object.values(TaskStatus),
            default: TaskStatus.PENDING,
            required: true,
            index: true
        },

        priority: {
            type: Number,
            min: 1,
            max: 5,
            default: 1,
            required: true
        },

        siteId: {
            type: Schema.Types.ObjectId,
            ref: "Site",
            required: true,
            index: true
        },

        assignedToId: {
            type: Schema.Types.ObjectId,
            ref: "Employee",
            index: true
        },

        assignedById: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        dueDate: {
            type: Date
        },

        completedAt: {
            type: Date
        }
    },
    {
        timestamps: true,
        collection: "tasks"
    }
);

taskSchema.index({
    siteId: 1,
    status: 1
});

export const Task = model<ITask>("Task", taskSchema);