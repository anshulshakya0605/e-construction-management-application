import {ipKeyGenerator, rateLimit} from "express-rate-limit";
import { CONFIG, ERROR_CODES, GENERIC_MESSAGES } from "../shared/constants";
import { createHash } from "node:crypto";
import { Request } from "express";


//  generate a privacy-friendly account key
// each email get its own rate-limiter counter
const getEmailKey = (req: Request) => {
    const email = req.body?.email;

        if (typeof email === 'string' && email.trim()) {
            const normalizedEmail = email.trim().toLowerCase();

            // hash email to avoid storing raw email in rate-limit keys
            const hashEmail = createHash('sha256').update(normalizedEmail).digest('hex')
            return `login:${hashEmail}`
        }

        // fallback when email is missing
        return `ip:${ipKeyGenerator(req.ip ?? "0.0.0.0")}`
}

// global rate limiter
export const globalRateLimiter = rateLimit({
    windowMs: CONFIG.GLOBAL_WINDOW_MS,
    limit: CONFIG.GLOBAL_MAX_REQUESTS,

    standardHeaders: 'draft-8',
    legacyHeaders: false,

    message: {
        success: false,
        message: GENERIC_MESSAGES.RATE_LIMIT_EXCEEDED,
        errorCode: ERROR_CODES.RATE_LIMIT_EXCEEDED
    }
})

// auth rate limiter

export const authLimiter= rateLimit({
    windowMs: CONFIG.AUTH_WINDOW_MS,
    limit: CONFIG.AUTH_MAX_REQUESTS,

    standardHeaders: 'draft-8',
    legacyHeaders: false,

    message: {
        success: false,
        message: GENERIC_MESSAGES.RATE_LIMIT_EXCEEDED,
        errorCode: ERROR_CODES.RATE_LIMIT_EXCEEDED
    }
})

/// account based login rate limiter

export const loginRateLimiter = rateLimit({
    windowMs: CONFIG.AUTH_WINDOW_MS,
    limit: CONFIG.AUTH_MAX_REQUESTS,

    // each email get its own rate-limiter counter;
    keyGenerator: (req) => {
        const email = req.body?.email;

        if (typeof email === 'string' && email.trim()) {
            const normalizedEmail = email.trim().toLowerCase();

            // hash email to avoid storing raw email in rate-limit keys
            const hashEmail = createHash('sha256').update(normalizedEmail).digest('hex')
            return `login:${hashEmail}`
        }

        // fallback when email is missing
        return `ip:${ipKeyGenerator(req.ip ?? "0.0.0.0")}`
    },

    skipSuccessfulRequests: true,
    
    standardHeaders: 'draft-8',
    legacyHeaders: false,

    message: {
        success: false,
        message: GENERIC_MESSAGES.RATE_LIMIT_EXCEEDED,
        errorCode: ERROR_CODES.RATE_LIMIT_EXCEEDED
    }

})


/// public inquiry rate limiter 
export const inquiryRateLimiter = rateLimit({
    windowMs: CONFIG.INQUIRY_WINDOW_MS,
    limit: CONFIG.INQUIRY_MAX_REQUESTS,

    standardHeaders: 'draft-8',
    legacyHeaders: false,

    message: {
        success: false,
        message: GENERIC_MESSAGES.RATE_LIMIT_EXCEEDED,
        errorCode: ERROR_CODES.RATE_LIMIT_EXCEEDED
    }
})