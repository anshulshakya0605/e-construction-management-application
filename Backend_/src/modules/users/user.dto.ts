import z from "zod";
import { AccountStatus, City, Role } from "../../shared/enums";

export const UserListQuerySchema = z.object({
    page: z.coerce.number().int().positive().min(1).default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),

    search: z.string().trim().optional(),
    role: z.nativeEnum(Role).optional(),
    city: z.nativeEnum(City).optional(),
    accountStatus: z.nativeEnum(AccountStatus).optional(),

    emailVerified: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
    isActive: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),

})

export const UpdateUserStatusSchema = z.object({
    isActive: z.boolean()
})

export const updateUserRoleSchema = z.object({
    role: z.nativeEnum(Role),
})

export const userIdParamsSchema = z.object({
    id: z.string().regex(/^[0-9a-fA-f]{24}$/, "Invalid user ID.")
})