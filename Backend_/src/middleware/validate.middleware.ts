
import type { RequestHandler } from "express";
import type { ZodType } from "zod";

import { ApiError } from "../utils/ApiError.js";
import { HTTP_STATUS } from "../shared/constants/httpStatus.constant.js";
import { ERROR_CODES } from "../shared/constants/errorCodes.constant.js";
import { GENERIC_MESSAGES } from "../shared/constants/messages.constant.js";

type RequestSource = "body" | "query" | "params";

export const validate = (
    schema: ZodType,
    source: RequestSource = "body",
): RequestHandler => {
    return (req, _res, next) => {
        const result = schema.safeParse(req[source]);

        if (!result.success) {
            return next(
                new ApiError({
                    statusCode: HTTP_STATUS.BAD_REQUEST,
                    message: GENERIC_MESSAGES.VALIDATION_ERROR,
                    errorCode: ERROR_CODES.VALIDATION_ERROR,
                }),
            );
        }

        if (source === "query") {
            Object.defineProperty(req, "query", {
                value: result.data,
                writable: true,
                configurable: true,
            });
        } else if (source === "params") {
            Object.defineProperty(req, "params", {
                value: result.data,
                writable: true,
                configurable: true,
            });
        } else {
            req.body = result.data;
        }

        next();
    };
};
