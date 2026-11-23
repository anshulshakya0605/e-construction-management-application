import { Router } from "express";

import {
    authenticate,
} from "../../middleware/auth.middleware.js";

import {
    validate,
} from "../../middleware/validate.middleware.js";

import {
    catchAsync,
} from "../../utils/catchAsync.js";

import {
    API_ENDPOINTS,
} from "../../shared/constants/endpoint.constant.js";

import {
    registerEmployeeSchema,
    registerClientSchema,
    verifyEmailSchema,
    resendVerificationSchema,
    loginSchema,
    forgotPasswordSchema,
    verifyResetOtpSchema,
    resetPasswordSchema,
    changePasswordSchema,
} from "./auth.dto.js";

import {
    registerEmployee,
    registerClient,
    verifyEmail,
    resendVerification,
    login,
    forgotPassword,
    verifyResetOtp,
    resetPassword,
    changePassword,
    getMe,
    logout,
} from "./auth.controller.js";
import { authLimiter, loginRateLimiter } from "../../middleware/rateLimit.middleware.js";


const router = Router();


// ============================================================
// PUBLIC AUTH ROUTES
// ============================================================

router.post(
    API_ENDPOINTS.AUTH.REGISTER_EMPLOYEE,
    validate(registerEmployeeSchema),
    catchAsync(registerEmployee),
);


router.post(
    API_ENDPOINTS.AUTH.REGISTER_CLIENT,
    validate(registerClientSchema),
    catchAsync(registerClient),
);


router.post(
    API_ENDPOINTS.AUTH.VERIFY_EMAIL,
    authLimiter,
    validate(verifyEmailSchema),
    catchAsync(verifyEmail),
);


router.post(
    API_ENDPOINTS.AUTH.RESEND_VERIFICATION,
    authLimiter,
    validate(resendVerificationSchema),
    catchAsync(resendVerification),
);


router.post(
    API_ENDPOINTS.AUTH.LOGIN,
    loginRateLimiter,
    validate(loginSchema),
    catchAsync(login),
);


router.post(
    API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
    authLimiter,
    validate(forgotPasswordSchema),
    catchAsync(forgotPassword),
);


router.post(
    API_ENDPOINTS.AUTH.VERIFY_RESET_OTP,
    authLimiter,
    validate(verifyResetOtpSchema),
    catchAsync(verifyResetOtp),
);


router.post(
    API_ENDPOINTS.AUTH.RESET_PASSWORD,
    authLimiter,
    validate(resetPasswordSchema),
    catchAsync(resetPassword),
);


// ============================================================
// PROTECTED AUTH ROUTES
// ============================================================

router.patch(
    API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
    authLimiter,
    authenticate,
    validate(changePasswordSchema),
    catchAsync(changePassword),
);


router.get(
    API_ENDPOINTS.AUTH.ME,
    authenticate,
    catchAsync(getMe),
);


router.post(
    API_ENDPOINTS.AUTH.LOGOUT,
    authenticate,
    catchAsync(logout),
);


export default router;