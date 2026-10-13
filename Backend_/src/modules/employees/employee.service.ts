import { EmployeeListQuery, EmployeeResponse, EmployeeWithUser, RejectEmployeeInput, UpdateEmployeeInput } from "./employee.types";
import * as employeeRepository from './employee.repository.js'
import { ApiError } from "../../utils/ApiError";
import { EMPLOYEE_MESSAGES, ERROR_CODES, HTTP_STATUS, USER_MESSAGES } from "../../shared/constants";
import { AccountStatus } from "../../shared/enums";

const mapEmployeeResponse = (employee: EmployeeWithUser): EmployeeResponse => {
    return {
        id: String(employee._id),
        userId: String(employee.userId._id),
        email: employee.userId.email,
        fullName: employee.userId.fullName,
        phone: employee.userId.phone,
        city: employee.userId.city,
        trade: employee.trade,
        employeeCode: employee.employeeCode,
        joiningDate: employee.joiningDate,
        isAvailable: employee.isAvailable,
        accountStatus: employee.userId.accountStatus,
        emailVerified: employee.userId.emailVerified,
        isActive: employee.userId.isActive,
        approvedById: employee.approvedById
            ? String(employee.approvedById)
            : undefined,
        approvedAt: employee.approvedAt,
        rejectionReason: employee.rejectionReason,
        createdAt: employee.createdAt,
        updatedAt: employee.updatedAt
    }
}

export const getEmployeeById = async (
    employeeId: string
): Promise<EmployeeResponse> =>{

    const employee = await employeeRepository.findEmployeeByIdWithUser(employeeId);

    if (!employee) {
        throw new ApiError({
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: EMPLOYEE_MESSAGES.EMPLOYEE_NOT_FOUND,
            errorCode: ERROR_CODES.EMP_NOT_FOUND
        })
    }

    return mapEmployeeResponse(employee as unknown as EmployeeWithUser)

}

export const updateEmployee = async (
    employeeId: string,
    input: UpdateEmployeeInput
): Promise<EmployeeResponse> => {

    const employee = await employeeRepository.findEmployeeById(employeeId);
    if (!employee) {
        throw new ApiError({
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: EMPLOYEE_MESSAGES.EMPLOYEE_NOT_FOUND,
            errorCode: ERROR_CODES.EMP_NOT_FOUND
        })
    }

    const updatedEmployee = await employeeRepository.updateEmployee(employeeId, input);

    if (!updatedEmployee) {
        throw new ApiError({
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: EMPLOYEE_MESSAGES.EMPLOYEE_NOT_FOUND,
            errorCode: ERROR_CODES.EMP_NOT_FOUND
        })
    }

    return getEmployeeById(employeeId);

}

export const approveEmployee = async (
    employeeId: string,
    adminUserId: string
): Promise<EmployeeResponse> => {

    const employee = await employeeRepository.findEmployeeById(employeeId);

    if (!employee) {
        throw new ApiError({
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: EMPLOYEE_MESSAGES.EMPLOYEE_NOT_FOUND,
            errorCode: ERROR_CODES.EMP_NOT_FOUND
        })
    }

    const user = await employeeRepository.findUserById(String(employee.userId))

    if (!user) {
        throw new ApiError({
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: USER_MESSAGES.USER_NOT_FOUND,
            errorCode: ERROR_CODES.USER_NOT_FOUND
        })
    }

    if (user.accountStatus !== AccountStatus.PENDING_APPROVAL && user.accountStatus !== AccountStatus.REJECTED) {
        throw new ApiError({
            statusCode: HTTP_STATUS.BAD_REQUEST,
            message: EMPLOYEE_MESSAGES.EMPLOYEE_INVALID_APPROVAL,
            errorCode: ERROR_CODES.EMP_ALREADY_REVIEWED
        })
    }

    await employeeRepository.approveEmployee(employeeId, adminUserId);
    await employeeRepository.updateUserAccountStatus(String(employee.userId), AccountStatus.ACTIVE)

    return getEmployeeById(employeeId);

}

export const rejectEmployee = async (
    employeeId: string,
    input: RejectEmployeeInput
): Promise<EmployeeResponse | null> => {

    const employee = await employeeRepository.findEmployeeById(employeeId);

    if (!employee) {
        throw new ApiError({
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: EMPLOYEE_MESSAGES.EMPLOYEE_NOT_FOUND,
            errorCode: ERROR_CODES.EMP_NOT_FOUND
        })
    }

    const user = await employeeRepository.findUserById(String(employee.userId));

    if (!user) {
        throw new ApiError({
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: USER_MESSAGES.USER_NOT_FOUND,
            errorCode: ERROR_CODES.USER_NOT_FOUND
        })
    }

    if (user.accountStatus === AccountStatus.PENDING_APPROVAL) {
        throw new ApiError({
            statusCode: HTTP_STATUS.BAD_REQUEST,
            message: EMPLOYEE_MESSAGES.EMPLOYEE_INVALID_APPROVAL,
            errorCode: ERROR_CODES.EMP_ALREADY_REVIEWED
        })
    }

    const rejected = await employeeRepository.rejectedEmployee(employeeId, String(input.rejectionReason));

    if (!rejected) {
        throw new ApiError({
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: EMPLOYEE_MESSAGES.EMPLOYEE_NOT_FOUND,
            errorCode: ERROR_CODES.EMP_NOT_FOUND
        })
    }

   const updatedUser = await employeeRepository.updateUserAccountStatus(
        String(employee.userId),
        AccountStatus.REJECTED
    )

    if (!updatedUser) {
        throw new ApiError({
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: USER_MESSAGES.USER_NOT_FOUND,
            errorCode: ERROR_CODES.USER_NOT_FOUND
        })
    }

    return getEmployeeById(employeeId);

}

export const getEmployees = async (
    query: EmployeeListQuery,
) => {

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const userIds =
        await employeeRepository.findEmployeeUserIds({
            city: query.city,
            accountStatus: query.accountStatus,
        });

    if (userIds.length === 0) {
        return {
            data: [],
            pagination: {
                page,
                limit,
                total: 0,
                totalPages: 0,
            },
        };
    }

    const [employees, total] = await Promise.all([
        employeeRepository.findEmployeesByUserIds(
            userIds,
            {
                trade: query.trade,
                availability: query.availability,
            },
            page,
            limit,
        ),

        employeeRepository.countEmployeeByUserIds(
            userIds,
            {
                trade: query.trade,
                availability: query.availability,
            },
        ),
    ]);

    const data = employees.map((employee) =>
        mapEmployeeResponse(
            employee as unknown as EmployeeWithUser,
        ),
    );

    return {
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};