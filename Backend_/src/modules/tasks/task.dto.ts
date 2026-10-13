import z from "zod";
import { TaskStatus } from "../../shared/enums";


export const createTaskSchema = z.object({
    title: z
        .string()
        .trim()
        .min(2),

    description: z.
        string()
        .trim()
        .optional(),

    priority: z
        .number()
        .int()
        .min(1)
        .max(5)
        .optional(),

    siteId: z
        .string()
        .trim()
        .min(1),

    assignedToId: z
        .string()
        .trim()
        .min(1)
        .optional(),

    dueDate: z
        .coerce
        .date()
        .optional(),
})

export const updateTaskSchema = z.object({
    title: z
        .string()
        .trim()
        .min(2)
        .optional(),

    description: z
        .string()
        .trim()
        .optional(),

    priority: z
        .number()
        .int()
        .min(1)
        .max(5)
        .optional(),

    assignedToId: z
        .string()
        .trim()
        .min(1)
        .optional(),

    dueDate: z
        .coerce
        .date()
        .optional(),
})

export const updateTaskStatusSchema = z.object({
    status: z.nativeEnum(TaskStatus)
})

export const taskListQuerySchema = z.object({
    page: z.
        coerce.
        number()
        .int()
        .positive()
        .optional(),

    limit: z
        .coerce
        .number()
        .int()
        .positive()
        .optional(),

    status: z
        .nativeEnum(TaskStatus)
        .optional(),

    siteId: z
        .string()
        .trim()
        .min(1)
        .optional(),

    assignedToId: z
        .string()
        .trim()
        .min(1)
        .optional(),
})

export const taskIdParamSchema = z.object({
    id: z
        .string()
        .trim()
        .min(1),
});