import { Router } from "express";
import { validate } from "../../middleware/validate.middleware";
import { updateUserRoleSchema, UpdateUserStatusSchema, userIdParamsSchema, UserListQuerySchema } from "./user.dto";
import { deleteUser, getAllUsers, getUserById, getUserStats, updateUserRole, updateUserStatus } from "./user.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { Role } from "../../shared/enums";


const router = Router();

router.use(authenticate)
router.use(authorize(Role.ADMIN))

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

router.patch('/:id/status',
    validate(UpdateUserStatusSchema, 'body'),
    updateUserStatus
)

router.patch('/:id/role',
    validate(updateUserRoleSchema, 'body'),
    updateUserRole
)

router.delete('/:id',
    deleteUser
)

export default router;