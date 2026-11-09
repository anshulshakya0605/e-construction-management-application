import {
    Client,
    Employee,
    IUser,
} from "../../models/index.js";

import {
    AccountStatus,
    City,
    Role,
    TokenPurpose,
} from "../../shared/enums/index.js";

import {
    CONFIG,
} from "../../shared/constants/config.constant.js";

import {
    AUTH_MESSAGES,
    PASSWORD_MESSAGES,
    REGISTER_MESSAGES,
    USER_MESSAGES,
    VERIFICATION_MESSAGES,
} from "../../shared/constants/messages.constant.js";

import {
    ERROR_CODES,
} from "../../shared/constants/errorCodes.constant.js";

import {
    HTTP_STATUS
} from "../../shared/constants/httpStatus.constant.js";



import { ApiError } from "../../utils/ApiError.js";

import {
    comparePassword,
    hashPassword,
} from "../../utils/password.js";

import {
    compareOtp,
    generateOtp,
    getOtpExpiryDate,
    hashOtp,
} from "../../utils/otp.js";

import {
    generateAccessToken,
    generateResetTicket,
    verifyResetTicket,
} from "../../utils/jwt.js";

import * as authRepository from "./auth.repository.js";

import type {
    AuthUserResponse,
    ChangePasswordInput,
    ForgotPasswordInput,
    LoginInput,
    LoginResponse,
    RegisterClientInput,
    RegisterEmployeeInput,
    ResendVerificationInput,
    ResetPasswordInput,
    VerifyEmailInput,
    VerifyResetOtpInput,
    VerifyResetOtpResponse,
} from "./auth.types.js";
import { Types } from "mongoose";
import { sendPasswordChangedEmail, sendPasswordResetOtpEmail, sendVerificationOtpEmail, sendWelcomeEmail } from "../email/email.service.js";


/**
 * Convert User document into a safe API response.
 *
 * passwordHash must never be returned to the client.
 */
const mapUserResponse = (
    user: IUser
): AuthUserResponse => {
    return {
        id: String(user._id),
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        city: user.city,
        accountStatus: user.accountStatus,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
};


/**
 * Register Employee
 *
 * User
 *   ↓
 * Employee profile
 *   ↓
 * Verification OTP
 */
export const registerEmployee = async (
    input: RegisterEmployeeInput,
): Promise<void> => {
    const existingUser = await authRepository.findUserByEmail(
        input.email,
    );

    if (existingUser) {
        throw new ApiError({
            statusCode: HTTP_STATUS.CONFLICT,
            message: REGISTER_MESSAGES.EMAIL_EXISTS,
            errorCode: ERROR_CODES.REG_EMAIL_EXISTS,
        });
    }

    if (input.phone) {
        const existingPhone =
            await authRepository.findUserByPhone(input.phone);

        if (existingPhone) {
            throw new ApiError({
                statusCode: HTTP_STATUS.CONFLICT,
                message: REGISTER_MESSAGES.PHONE_EXISTS,
                errorCode: ERROR_CODES.REG_PHONE_EXISTS,
            });
        }
    }

    const passwordHash = await hashPassword(input.password);

    const user = await authRepository.createUser({
        email: input.email,
        passwordHash,
        fullName: input.fullName,
        phone: input.phone,
        city: input.city,
        role: Role.EMPLOYEE,
        accountStatus: AccountStatus.PENDING_VERIFICATION,
        isActive: true,
        emailVerified: false,
    });

    try {
        await authRepository.createEmployee({
            userId: user._id,
            trade: input.trade,
            employeeCode:
                await authRepository.generateEmployeeCode(),
        });

        const otp = generateOtp();
        const otpHash = await hashOtp(otp);

        await authRepository.invalidateActiveOtps(
            String(user._id),
            TokenPurpose.EMAIL_VERIFICATION,
        );

        await authRepository.createOtp({
            userId: user._id,
            otpHash,
            purpose: TokenPurpose.EMAIL_VERIFICATION,
            expiresAt: getOtpExpiryDate(),
            attempts: 0,
            usedAt: null,
        });

        await sendVerificationOtpEmail({
            to: user.email,
            fullName: user.fullName,
            otp,
        });
    } catch (error) {
        await authRepository.deleteUser(String(user._id));
        throw error;
    }
};


/**
 * Register Client
 */
export const registerClient = async (
    input: RegisterClientInput,
): Promise<void> => {
    const existingUser = await authRepository.findUserByEmail(
        input.email,
    );

    if (existingUser) {
        throw new ApiError({
            statusCode: HTTP_STATUS.CONFLICT,
            message: REGISTER_MESSAGES.EMAIL_EXISTS,
            errorCode: ERROR_CODES.REG_EMAIL_EXISTS,
        });
    }

    if (input.phone) {
        const existingPhone =
            await authRepository.findUserByPhone(input.phone);

        if (existingPhone) {
            throw new ApiError({
                statusCode: HTTP_STATUS.CONFLICT,
                message: REGISTER_MESSAGES.PHONE_EXISTS,
                errorCode: ERROR_CODES.REG_PHONE_EXISTS,
            });
        }
    }

    const passwordHash = await hashPassword(input.password);

    const user = await authRepository.createUser({
        email: input.email,
        passwordHash,
        fullName: input.fullName,
        phone: input.phone,
        role: Role.CLIENT,
        accountStatus: AccountStatus.PENDING_VERIFICATION,
        isActive: true,
        emailVerified: false,
    });

    try {
        await authRepository.createClient({
            userId: user._id,
            companyName: input.companyName,
            gstNumber: input.gstNumber,
        });

        const otp = generateOtp();
        const otpHash = await hashOtp(otp);

        await authRepository.invalidateActiveOtps(
            String(user._id),
            TokenPurpose.EMAIL_VERIFICATION,
        );

        await authRepository.createOtp({
            userId: user._id,
            otpHash,
            purpose: TokenPurpose.EMAIL_VERIFICATION,
            expiresAt: getOtpExpiryDate(),
            attempts: 0,
            usedAt: null,
        });

        await sendVerificationOtpEmail({
            to: user.email,
            fullName: user.fullName,
            otp,
        });
    } catch (error) {
        await authRepository.deleteUser(String(user._id));
        throw error;
    }
};


/**
 * Verify email using OTP.
 */
export const verifyEmail = async (
    input: VerifyEmailInput,
): Promise<void> => {
    const user = await authRepository.findUserByEmail(
        input.email,
    );

    if (!user) {
        throw new ApiError({
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: USER_MESSAGES.USER_NOT_FOUND,
            errorCode: ERROR_CODES.USER_NOT_FOUND,
        });
    }

    if (user.emailVerified) {
        throw new ApiError({
            statusCode: HTTP_STATUS.CONFLICT,
            message: VERIFICATION_MESSAGES.EMAIL_VERIFIED_SUCCESS,
            errorCode: ERROR_CODES.AUTH_EMAIL_NOT_VERIFIED,
        });
    }

    const otp = await authRepository.findLatestActiveOtp(
        String(user._id),
        TokenPurpose.EMAIL_VERIFICATION,
    );

    if (!otp) {
        throw new ApiError({
            statusCode: HTTP_STATUS.GONE,
            message: VERIFICATION_MESSAGES.OTP_EXPIRED,
            errorCode: ERROR_CODES.OTP_EXPIRED,
        });
    }

    if (otp.attempts >= CONFIG.OTP_MAX_ATTEMPTS) {
        throw new ApiError({
            statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
            message: VERIFICATION_MESSAGES.OTP_MAX_ATTEMPTS,
            errorCode: ERROR_CODES.OTP_MAX_ATTEMPTS,
        });
    }

    const isOtpValid = await compareOtp(
        input.otp,
        otp.otpHash,
    );

    if (!isOtpValid) {
        const updatedOtp =
            await authRepository.incrementOtpAttempts(
                String(otp._id),
            );

        if (
            updatedOtp &&
            updatedOtp.attempts >= CONFIG.OTP_MAX_ATTEMPTS
        ) {
            throw new ApiError({
                statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
                message: VERIFICATION_MESSAGES.OTP_MAX_ATTEMPTS,
                errorCode: ERROR_CODES.OTP_MAX_ATTEMPTS,
            });
        }

        throw new ApiError({
            statusCode: HTTP_STATUS.BAD_REQUEST,
            message: VERIFICATION_MESSAGES.OTP_INVALID,
            errorCode: ERROR_CODES.OTP_INVALID,
        });
    }

    await authRepository.markOtpUsed(
        String(otp._id),
    );

    const nextAccountStatus =
        user.role === Role.EMPLOYEE
            ? AccountStatus.PENDING_APPROVAL
            : AccountStatus.ACTIVE;

    await authRepository.updateUser(
        String(user._id),
        {
            emailVerified: true,
            accountStatus: nextAccountStatus,
        },
    );

    await sendWelcomeEmail({
        to: user.email,
        fullName: user.fullName,
    });
};


/**
 * Resend email verification OTP.
 */
export const resendVerification = async (
    input: ResendVerificationInput,
): Promise<void> => {
    console.log("1. RESEND START");
    const user = await authRepository.findUserByEmail(
        input.email,
    );
    console.log(
        "2. USER FOUND:",
        user ? user.email : null,
    );

    if (!user) {
        throw new ApiError({
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: USER_MESSAGES.USER_NOT_FOUND,
            errorCode: ERROR_CODES.USER_NOT_FOUND,
        });
    }
     console.log("3. EMAIL VERIFIED:", user.emailVerified);


    if (user.emailVerified) {
        throw new ApiError({
            statusCode: HTTP_STATUS.CONFLICT,
            message: VERIFICATION_MESSAGES.EMAIL_VERIFIED_SUCCESS,
            errorCode: ERROR_CODES.AUTH_EMAIL_NOT_VERIFIED,
        });
    }
    console.log("4. INVALIDATING OLD OTP");

    await authRepository.invalidateActiveOtps(
        String(user._id),
        TokenPurpose.EMAIL_VERIFICATION,
    );
 console.log("5. OLD OTP INVALIDATED");
    const otp = generateOtp();
    console.log("6. OTP GENERATED");
    const otpHash = await hashOtp(otp);

    await authRepository.createOtp({
        userId: user._id,
        otpHash,
        purpose: TokenPurpose.EMAIL_VERIFICATION,
        expiresAt: getOtpExpiryDate(),
        attempts: 0,
        usedAt: null,
    });
     console.log("8. OTP SAVED");

    await sendVerificationOtpEmail({
        to: user.email,
        fullName: user.fullName,
        otp,
    });
     console.log("9. EMAIL SENT");
};


/**
 * Login
 */
export const login = async (
    input: LoginInput,
): Promise<LoginResponse> => {
    const user = await authRepository.findUserByEmail(
        input.email,
    );

    if (!user) {
        throw new ApiError({
            statusCode: HTTP_STATUS.UNAUTHORIZED,
            message: AUTH_MESSAGES.INVALID_CREDENTIALS,
            errorCode: ERROR_CODES.AUTH_INVALID_CREDENTIALS,
        });
    }

    if (!user.isActive) {
        throw new ApiError({
            statusCode: HTTP_STATUS.FORBIDDEN,
            message: AUTH_MESSAGES.ACCOUNT_INACTIVE,
            errorCode: ERROR_CODES.AUTH_ACCOUNT_INACTIVE,
        });
    }

    if (!user.emailVerified) {
        throw new ApiError({
            statusCode: HTTP_STATUS.FORBIDDEN,
            message: AUTH_MESSAGES.EMAIL_NOT_VERIFIED,
            errorCode: ERROR_CODES.AUTH_EMAIL_NOT_VERIFIED,
        });
    }

    if (
        user.accountStatus ===
        AccountStatus.PENDING_APPROVAL
    ) {
        throw new ApiError({
            statusCode: HTTP_STATUS.FORBIDDEN,
            message: AUTH_MESSAGES.ACCOUNT_PENDING_APPROVAL,
            errorCode: ERROR_CODES.AUTH_ACCOUNT_PENDING_APPROVAL,
        });
    }

    if (
        user.accountStatus !== AccountStatus.ACTIVE
    ) {
        throw new ApiError({
            statusCode: HTTP_STATUS.FORBIDDEN,
            message: AUTH_MESSAGES.ACCOUNT_INACTIVE,
            errorCode: ERROR_CODES.AUTH_ACCOUNT_INACTIVE,
        });
    }

    const passwordValid = await comparePassword(
        input.password,
        user.passwordHash,
    );

    if (!passwordValid) {
        throw new ApiError({
            statusCode: HTTP_STATUS.UNAUTHORIZED,
            message: AUTH_MESSAGES.INVALID_CREDENTIALS,
            errorCode: ERROR_CODES.AUTH_INVALID_CREDENTIALS,
        });
    }

    const updatedUser =
        await authRepository.updateUser(
            String(user._id),
            {
                lastLoginAt: new Date(),
            },
        );

    if (!updatedUser) {
        throw new ApiError({
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: USER_MESSAGES.USER_NOT_FOUND,
            errorCode: ERROR_CODES.USER_NOT_FOUND,
        });
    }

    const token = generateAccessToken({
        userId: String(updatedUser._id),
        role: updatedUser.role,
    });

    return {
        user: mapUserResponse(updatedUser),
        token,
    };
};


/**
 * Forgot password.
 *
 * Deliberately does not reveal whether email exists.
 */
export const forgotPassword = async (
    input: ForgotPasswordInput,
): Promise<void> => {
    const user = await authRepository.findUserByEmail(
        input.email,
    );

    /*
     * Always return success when user doesn't exist.
     * This prevents email enumeration.
     */
    if (!user) {
        return;
    }

    await authRepository.invalidateActiveOtps(
        String(user._id),
        TokenPurpose.PASSWORD_RESET,
    );

    const otp = generateOtp();
    const otpHash = await hashOtp(otp);

    await authRepository.createOtp({
        userId: user._id,
        otpHash,
        purpose: TokenPurpose.PASSWORD_RESET,
        expiresAt: getOtpExpiryDate(),
        attempts: 0,
        usedAt: null,
    });

    await sendPasswordResetOtpEmail({
        to: user.email,
        fullName: user.fullName,
        otp,
    });
};


/**
 * Verify password reset OTP.
 */
export const verifyResetOtp = async (
    input: VerifyResetOtpInput,
): Promise<VerifyResetOtpResponse> => {
    const user = await authRepository.findUserByEmail(
        input.email,
    );

    if (!user) {
        throw new ApiError({
            statusCode: HTTP_STATUS.BAD_REQUEST,
            message: PASSWORD_MESSAGES.RESET_TICKET_INVALID,
            errorCode: ERROR_CODES.OTP_INVALID,
        });
    }

    const otp = await authRepository.findLatestActiveOtp(
        String(user._id),
        TokenPurpose.PASSWORD_RESET,
    );

    if (!otp) {
        throw new ApiError({
            statusCode: HTTP_STATUS.GONE,
            message: PASSWORD_MESSAGES.RESET_TICKET_EXPIRED,
            errorCode: ERROR_CODES.OTP_EXPIRED,
        });
    }

    if (
        otp.attempts >=
        CONFIG.OTP_MAX_ATTEMPTS
    ) {
        throw new ApiError({
            statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
            message: VERIFICATION_MESSAGES.OTP_MAX_ATTEMPTS,
            errorCode: ERROR_CODES.OTP_MAX_ATTEMPTS,
        });
    }

    const isOtpValid = await compareOtp(
        input.otp,
        otp.otpHash,
    );

    if (!isOtpValid) {
        const updatedOtp =
            await authRepository.incrementOtpAttempts(
                String(otp._id),
            );

        if (
            updatedOtp &&
            updatedOtp.attempts >=
            CONFIG.OTP_MAX_ATTEMPTS
        ) {
            throw new ApiError({
                statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
                message: VERIFICATION_MESSAGES.OTP_MAX_ATTEMPTS,
                errorCode: ERROR_CODES.OTP_MAX_ATTEMPTS,
            });
        }

        throw new ApiError({
            statusCode: HTTP_STATUS.BAD_REQUEST,
            message: VERIFICATION_MESSAGES.OTP_INVALID,
            errorCode: ERROR_CODES.OTP_INVALID,
        });
    }

    const resetTicket = generateResetTicket({
        userId: String(user._id),
        purpose: TokenPurpose.PASSWORD_RESET,
    });

    return {
        resetTicket,
    };
};


/**
 * Reset password using reset ticket.
 */
export const resetPassword = async (
    input: ResetPasswordInput,
): Promise<void> => {
    let ticketPayload;

    try {
        ticketPayload = verifyResetTicket(
            input.resetTicket,
        );
    } catch {
        throw new ApiError({
            statusCode: HTTP_STATUS.UNAUTHORIZED,
            message: PASSWORD_MESSAGES.RESET_TICKET_INVALID,
            errorCode: ERROR_CODES.AUTH_TOKEN_INVALID,
        });
    }

    const user = await authRepository.findUserById(
        ticketPayload.userId,
    );

    if (!user) {
        throw new ApiError({
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: USER_MESSAGES.USER_NOT_FOUND,
            errorCode: ERROR_CODES.USER_NOT_FOUND,
        });
    }

    const passwordHash = await hashPassword(
        input.newPassword,
    );

    const recentHistories =
        await authRepository.findRecentPasswordHistories(
            String(user._id),
            CONFIG.PASSWORD_HISTORY_LIMIT,
        );

    for (const history of recentHistories) {
        const reused = await comparePassword(
            input.newPassword,
            history.passwordHash,
        );

        if (reused) {
            throw new ApiError({
                statusCode: HTTP_STATUS.BAD_REQUEST,
                message: PASSWORD_MESSAGES.SAME_AS_OLD,
                errorCode: ERROR_CODES.PWD_SAME_AS_OLD,
            });
        }
    }

    await authRepository.createPasswordHistory({
        userId: user._id,
        passwordHash: user.passwordHash,
    });

    await authRepository.updateUser(
        String(user._id),
        {
            passwordHash,
        },
    );

    await authRepository.invalidateActiveOtps(
        String(user._id),
        TokenPurpose.PASSWORD_RESET,
    );

    await sendPasswordChangedEmail({
        to: user.email,
        fullName: user.fullName,
    });
};


/**
 * Change password for logged-in user.
 */
export const changePassword = async (
    userId: string,
    input: ChangePasswordInput,
): Promise<void> => {
    const user = await authRepository.findUserById(
        userId,
    );

    if (!user) {
        throw new ApiError({
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: USER_MESSAGES.USER_NOT_FOUND,
            errorCode: ERROR_CODES.USER_NOT_FOUND,
        });
    }

    const currentPasswordValid =
        await comparePassword(
            input.currentPassword,
            user.passwordHash,
        );

    if (!currentPasswordValid) {
        throw new ApiError({
            statusCode: HTTP_STATUS.BAD_REQUEST,
            message: PASSWORD_MESSAGES.CURRENT_WRONG,
            errorCode: ERROR_CODES.PWD_CURRENT_WRONG,
        });
    }

    const samePassword =
        await comparePassword(
            input.newPassword,
            user.passwordHash,
        );

    if (samePassword) {
        throw new ApiError({
            statusCode: HTTP_STATUS.BAD_REQUEST,
            message: PASSWORD_MESSAGES.SAME_AS_OLD,
            errorCode: ERROR_CODES.PWD_SAME_AS_OLD,
        });
    }

    const recentHistories =
        await authRepository.findRecentPasswordHistories(
            userId,
            CONFIG.PASSWORD_HISTORY_LIMIT,
        );

    for (const history of recentHistories) {
        const reused = await comparePassword(
            input.newPassword,
            history.passwordHash,
        );

        if (reused) {
            throw new ApiError({
                statusCode: HTTP_STATUS.BAD_REQUEST,
                message: PASSWORD_MESSAGES.SAME_AS_OLD,
                errorCode: ERROR_CODES.PWD_SAME_AS_OLD,
            });
        }
    }

    const newPasswordHash =
        await hashPassword(
            input.newPassword,
        );

    await authRepository.createPasswordHistory({
        userId: user._id,
        passwordHash: user.passwordHash,
    });

    await authRepository.updateUser(
        userId,
        {
            passwordHash: newPasswordHash,
        },
    );

    await sendPasswordChangedEmail({
        to: user.email,
        fullName: user.fullName,
    });
};


/**
 * Get current authenticated user.
 */
export const getMe = async (
    userId: string,
): Promise<AuthUserResponse> => {
    const user = await authRepository.findUserById(
        userId,
    );

    if (!user) {
        throw new ApiError({
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: USER_MESSAGES.USER_NOT_FOUND,
            errorCode: ERROR_CODES.USER_NOT_FOUND,
        });
    }

    return mapUserResponse(user);
};


/**
 * Logout is stateless with the current JWT design.
 */
export const  logout = async (): Promise<void> => {
    return;
};


// ============================================================
// PRIVATE HELPERS
// ============================================================

const createVerificationOtp = async (
    userId: string,
): Promise<void> => {

    await authRepository.invalidateActiveOtps(
        userId,
        TokenPurpose.EMAIL_VERIFICATION,
    );

    const otp = generateOtp();

    const otpHash = await hashOtp(otp);

    await authRepository.createOtp({
        userId: new Types.ObjectId(userId),
        otpHash,
        purpose: TokenPurpose.EMAIL_VERIFICATION,
        expiresAt: getOtpExpiryDate(),
        attempts: 0,
    });

    // Email sending will be connected here
    // through the email module.
};


const generateEmployeeCode = async (): Promise<string> => {

    const employeeCount =
        await Employee.countDocuments();

    const nextNumber =
        employeeCount + 1;

    return `EMP-${String(nextNumber).padStart(4, "0")}`;
};