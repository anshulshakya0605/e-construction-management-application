import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { Role } from "../../shared/enums";
import { validate } from "../../middleware/validate.middleware";
import { createTaskSchema, taskIdParamSchema, taskListQuerySchema, updateTaskSchema, updateTaskStatusSchema,  } from "./task.dto";
import { createTask, deleteTask, getMyTasks, getTaskById, getTasks, updateTask, updateTaskStatus } from "./task.controller";


const router = Router()

router.post('/',
    authenticate,
    authorize(Role.ADMIN),
    validate(createTaskSchema),
    createTask
)

router.get('/',
    authenticate,
    authorize(Role.ADMIN, Role.EMPLOYEE),
    validate(taskListQuerySchema),
    getTasks
)

router.get('/my-tasks',
    authenticate,
    authorize(Role.EMPLOYEE),
    validate(taskListQuerySchema, 'query'),
    getMyTasks
)

router.get('/:id',
    authenticate,
    validate(taskIdParamSchema, 'params'),
    getTaskById
)

router.patch('/:id',
    authenticate,
    authorize(Role.ADMIN, Role.EMPLOYEE),
    validate(taskIdParamSchema, 'params'),
    validate(updateTaskSchema),
    updateTask
)

router.patch('/:id/status',
    authenticate,
    authorize(Role.ADMIN, Role.EMPLOYEE),
    validate(taskIdParamSchema, 'params'),
    validate(updateTaskStatusSchema),
    updateTaskStatus
)

router.delete('/:id',
    authenticate,
    authorize(Role.ADMIN),
    validate(taskIdParamSchema, 'params'),
    deleteTask
)

export default router;