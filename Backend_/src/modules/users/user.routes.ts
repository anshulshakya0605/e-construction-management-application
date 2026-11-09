import { Router } from "express";
import { validate } from "../../middleware/validate.middleware";
import { updateUserRoleSchema, UpdateUserStatusSchema, userIdParamsSchema, UserListQuerySchema } from "./user.dto";
import { deleteUser, getAllUsers, getUserById, getUserStats, updateUserRole, updateUserStatus } from "./user.controller";


const router = Router();

router.get('/', 
    validate(UserListQuerySchema),
    getAllUsers
)

router.get('/stats',
    getUserStats
)

router.get('/:id',
    getUserById
)

router.patch('/id:/status',
    validate(UpdateUserStatusSchema),
    updateUserStatus
)

router.patch('/:id/role',
    validate(updateUserRoleSchema),
    updateUserRole
)

router.delete('/:id',
    deleteUser
)

export default router;