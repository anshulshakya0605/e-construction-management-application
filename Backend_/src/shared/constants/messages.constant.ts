export const AUTH_MESSAGES = {
    REGISTER_SUCCESS: "Registration successful.",
    LOGIN_SUCCESS: "Login successful.",
    INVALID_CREDENTIALS: "Invalid email or password.",
    LOGOUT_SUCCESS: "Logout successful.",
    ME_FETCHED: "Current user fetched successfully.",
    TOKEN_MISSING: "Authentication token is missing.",
    TOKEN_INVALID: "Authentication token is invalid.",
    TOKEN_EXPIRED: "Authentication token has expired.",
    FORBIDDEN_ROLE: "You do not have permission to access this resource.",
    ACCOUNT_INACTIVE: "Your account is inactive.",
    EMAIL_NOT_VERIFIED: "Please verify your email address.",
    ACCOUNT_PENDING_APPROVAL: "Your account is waiting for admin approval.",
} as const;

export const AUTH_VALIDATION_MESSAGES = {
    EMAIL_INVALID: "Please provide a valid email address.",
    PASSWORD_TOO_SHORT: "Password is too short.",
    PASSWORD_TOO_LONG: "Password is too long.",
    FULL_NAME_REQUIRED: "Full name is required.",
    OTP_INVALID: "OTP must contain only digits.",
    OTP_LENGTH_INVALID: "Invalid OTP length.",
    RESET_TICKET_REQUIRED: "Reset ticket is required.",
    PHONE_INVALID: "Invalid phone number.",
} as const;

export const REGISTER_MESSAGES = {
    EMAIL_EXISTS: "An account with this email already exists.",
    PHONE_EXISTS: "An account with this phone number already exists.",
    WEAK_PASSWORD: "Password does not meet the required strength.",
    WELCOME_EMAIL_SENT: "Welcome email sent successfully.",
} as const;

export const VERIFICATION_MESSAGES = {
    OTP_SENT: "Verification OTP sent successfully.",
    OTP_VERIFIED: "OTP verified successfully.",
    OTP_INVALID: "Invalid OTP.",
    OTP_EXPIRED: "OTP has expired.",
    OTP_MAX_ATTEMPTS: "Maximum OTP attempts exceeded.",
    EMAIL_VERIFIED_SUCCESS: "Email verified successfully.",
    RESEND_SUCCESS: "Verification OTP resent successfully.",
    ALREADY_VERIFIED: "Already Verify"
} as const;

export const PASSWORD_MESSAGES = {
    FORGOT_EMAIL_SENT: "If the account exists, a password reset OTP has been sent.",
    RESET_SUCCESS: "Password reset successfully.",
    CHANGE_SUCCESS: "Password changed successfully.",
    CURRENT_WRONG: "Current password is incorrect.",
    SAME_AS_OLD: "New password must be different from the current password.",
    RESET_TICKET_INVALID: "Password reset ticket is invalid.",
    RESET_TICKET_EXPIRED: "Password reset ticket has expired.",
    INVALID_RESET_OTP: 'Invalid Reset OTP',
    REUSED_PASSWORD: 'Reused Password '
} as const;

export const USER_MESSAGES = {
    USER_FETCHED: "User fetched successfully.",
    USERS_FETCHED: "Users fetched successfully.",
    USER_UPDATED: "User updated successfully.",
    USER_DELETED: "User deleted successfully.",
    USER_NOT_FOUND: "User not found.",
    USER_DEACTIVATED: "User deactivated successfully.",
    USER_ACTIVATED: "User activated successfully.",
    USER_ID_INVALID: "User id is invalid."
} as const;

export const EMPLOYEE_MESSAGES = {
    EMPLOYEE_CREATED: "Employee created successfully.",
    EMPLOYEE_FETCHED: "Employee fetched successfully.",
    EMPLOYEES_FETCHED: "Employees fetched successfully.",
    EMPLOYEE_UPDATED: "Employee updated successfully.",
    EMPLOYEE_NOT_FOUND: "Employee not found.",
    EMPLOYEE_NOT_ACTIVE: "Employee not active",
    EMPLOYEE_APPROVED: "Employee approved successfully.",
    EMPLOYEE_INVALID_APPROVAL: "Employee Invalid Approval",
    EMPLOYEE_REJECTED: "Employee rejected successfully.",
    TRADE_REQUIRED: "Employee trade is required.",
    EMPLOYEE_INVALID_ID: "Employee id is invalid."
} as const;

export const CLIENT_MESSAGES = {
    CLIENT_CREATED: "Client created successfully.",
    CLIENT_FETCHED: "Client fetched successfully.",
    CLIENTS_FETCHED: "Clients fetched successfully.",
    CLIENT_UPDATED: "Client updated successfully.",
    CLIENT_NOT_FOUND: "Client not found.",
    CLIENT_ACCESS_DENIED: "Client access denied",
    CLIENT_EMAIL_EXISTS: 'Client email exists',
    INVALID_CLIENT_ID: "Invalid client id.",
} as const;

export const INQUIRY_MESSAGES = {
    INQUIRY_SUBMITTED: "Inquiry submitted successfully.",
    INQUIRY_FETCHED: "Inquiry fetched successfully.",
    INQUIRIES_FETCHED: "Inquiries fetched successfully.",
    INQUIRY_NOT_FOUND: "Inquiry not found.",
    INQUIRY_STATUS_UPDATED: "Inquiry status updated successfully.",
    INQUIRY_CONVERTED: "Inquiry converted successfully.",
    INQUIRY_ALREADY_CONVERTED: "Inquiry has already been converted.",
    INQUIRY_ASSIGNED: 'Inquiry assigned successful',
    INQUIRY_DELETE: 'Inquiry deleted successfully'
} as const;

export const SITE_MESSAGES = {
    SITE_CREATED: "Site created successfully.",
    SITE_FETCHED: "Site fetched successfully.",
    SITES_FETCHED: "Sites fetched successfully.",
    SITE_UPDATED: "Site updated successfully.",
    SITE_DELETED: "Site deleted successfully.",
    SITE_NOT_FOUND: "Site not found.",
    SITE_ACCESS_DENIED: "You do not have access to this site.",
    SITE_PROGRESS_FETCHED: "Site progress fetched successfully.",
    INVALID_SITE_ID: "Site id is invalid"
} as const;

export const TASK_MESSAGES = {
    TASK_CREATED: "Task created successfully.",
    TASK_FETCHED: "Task fetched successfully.",
    TASKS_FETCHED: "Tasks fetched successfully.",
    TASK_UPDATED: "Task updated successfully.",
    TASK_STATUS_UPDATED: "Task status updated successfully.",
    TASK_DELETED: "Task deleted successfully.",
    TASK_NOT_FOUND: "Task not found.",
    TASK_INVALID_TRANSITION: "Invalid task status transition.",
    TASK_ACCESS_DENIED: "Task access denied.",
    TASK_INVALID_ID: "Task id is invalid."
} as const;

export const FLOOR_PLAN_MESSAGES = {
    FP_CREATED: "Floor plan created successfully.",
    FP_FETCHED: "Floor plan fetched successfully.",
    FPS_FETCHED: "Floor plans fetched successfully.",
    FP_UPDATED: "Floor plan updated successfully.",
    FP_APPROVED: "Floor plan approved successfully.",
    FP_REJECTED: "Floor plan rejected successfully.",
    FP_DELETED: "Floor plan deleted successfully.",
    FP_NOT_FOUND: "Floor plan not found.",
    FP_ALREADY_REVIEWED: "Floor plan has already been reviewed.",
    FP_ALREADY_APPROVED: "Approved floor plans cannot be edited. Create a new version instead.",
} as const;

export const MAP_MESSAGES = {
    MAP_SITES_FETCHED: "Sites fetched successfully.",
    MAP_SITE_FETCHED: "Site fetched successfully.",
    NEARBY_SITES_FETCHED: "Nearby sites fetched successfully.",
    CITY_SUMMARY_FETCHED: "City summary fetched successfully.",
} as const;

export const EMAIL_MESSAGES = {
    WELCOME_SUBJECT: "Welcome to Real Estate Management Platform",
    VERIFY_OTP_SUBJECT: "Email Verification OTP",
    RESET_OTP_SUBJECT: "Password Reset OTP",
    PASSWORD_CHANGED_SUBJECT: "Password Changed Successfully",
} as const;

export const GENERIC_MESSAGES = {
    RESOURCE_ALREADY_EXISTS: "Resource already exists",
    ROUTE_NOT_FOUND: "Route not found.",
    INTERNAL_ERROR: "Something went wrong.",
    VALIDATION_ERROR: "Validation failed.",
    UNAUTHORIZED: "Authentication required.",
    FORBIDDEN: "You do not have permission to access this resource.",
    RATE_LIMIT_EXCEEDED: "Too many requests. Please try again later.",
} as const;