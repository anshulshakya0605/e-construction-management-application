import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { createFloorPlanSchema, floorPlanListQuerySchema, rejectFloorPlanSchema, UpdateFloorPlanSchema } from "./floorPlan.dto";
import { approveFloorPlan, createFloorPlan, deleteFloorPlan, getFloorPlanById, getFloorPlansBySiteId, rejectFloorPlan, updateFloorPlan } from "./floorPlan.controller";
import { Role } from "../../shared/enums";



const router = Router();


//  list floor plans of a site
router.get('/site/:siteId',
    authenticate,
    validate(floorPlanListQuerySchema),
    getFloorPlansBySiteId
);


// create floor plan version for a site
router.post('/site/:siteId',
    authenticate,
    authorize(Role.ADMIN, Role.EMPLOYEE),
    validate(createFloorPlanSchema),
    createFloorPlan,
)


// 
router.patch('/:id/approve',
    authenticate,
    authorize(Role.CLIENT),
    approveFloorPlan
)


router.patch('/:id/reject',
    authenticate,
    authorize(Role.CLIENT),
    validate(rejectFloorPlanSchema),
    rejectFloorPlan
)

/// update floorPlan metadata 
router.patch('/:id', 
    authenticate,
    authorize(Role.ADMIN, Role.EMPLOYEE),
    validate(UpdateFloorPlanSchema),
    updateFloorPlan
)

router.delete('/:id',
    authenticate,
    authorize(Role.ADMIN),
    deleteFloorPlan
)

router.get('/:id',
    authenticate,
    getFloorPlanById
)

export default router