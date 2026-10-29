import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { getCitiesSummary, getMapSiteById, getMapSites, getNearbyMapSites } from "./map.controller";
import { validate } from "../../middleware/validate.middleware";
import { mapSitesQuerySchema, nearbySitesQuerySchema } from "./map.dto";
import { Role } from "../../shared/enums";


const router = Router();


router.get('/sites',
    authenticate,
    validate(mapSitesQuerySchema),
    getMapSites
)

router.get("/nearby",
    authenticate,
    validate(nearbySitesQuerySchema, "query"),
    getNearbyMapSites  
)

router.get("/cities/summary", 
    authenticate,
    authorize(Role.ADMIN),
    getCitiesSummary
)

router.get("/sites/:id", 
    authenticate,
    getMapSiteById
)

export default router;