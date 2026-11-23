import { Router } from "express";
import { validate } from "../../middleware/validate.middleware";
import { assignInquiryInputSchema, createInquirySchema, inquiryListQuerySchema, updateInquiryStatusInputSchema } from "./inquiry.dto";
import { assignInquiry, convertInquiryToClient, createInquiry, deleteInquiry, getInquiries, getInquiryById, updateInquiryStatus } from "./inquiry.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { Role } from "../../shared/enums";
import { inquiryRateLimiter } from "../../middleware/rateLimit.middleware";


const router = Router();


router.post('/',
    inquiryRateLimiter,
    validate(createInquirySchema),
    createInquiry
)

router.get('/',
    authenticate,
    authorize(Role.ADMIN),
    validate(inquiryListQuerySchema),
    getInquiries
)

router.get('/:id',
    authenticate,
    authorize(Role.ADMIN),
    getInquiryById
)

router.patch('/:id/status',
    authenticate,
    authorize(Role.ADMIN),
    validate(updateInquiryStatusInputSchema),
    updateInquiryStatus
)

router.patch('/:id/assign',
    authenticate,
    authorize(Role.ADMIN),
    validate(assignInquiryInputSchema),
    assignInquiry
)

router.post('/:id/convert',
    authenticate,
    authorize(Role.ADMIN),
    convertInquiryToClient
)

router.delete('/:id',
    authenticate,
    authorize(Role.ADMIN),
    deleteInquiry
)

export default router;