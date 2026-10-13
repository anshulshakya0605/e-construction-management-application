import { FilterQuery } from "mongoose";
import { Employee, IEmployee, IUser, User } from "../../models";
import { EmployeeListQuery, UpdateEmployeeInput } from "./employee.types";
import { AccountStatus, Role } from "../../shared/enums";

export const findUserById = async (userId: string): Promise<IUser | null> => {
    return User.findById(userId)
}

export const findEmployeeById = async (employeeId: string): Promise<IEmployee | null> => {
    return Employee.findById(employeeId);
}

export const findEmployeeByUserId = async (userId: string): Promise<IEmployee | null> => {
    return Employee.findOne({ userId });
}

export const findEmployeeByIdWithUser = async (employeeId: string): Promise<IEmployee | null> => {
    return Employee.findById(employeeId).populate(
        "userId",
        "email fullName phone city role accountStatus isActive emailVerified"
    )
}

export const findEmployees = async (filters: EmployeeListQuery): Promise<IEmployee[]> => {
    const employeeFilter: FilterQuery<IEmployee> = {};

    if (filters.trade) {
        employeeFilter.trade = filters.trade
    }

    if (filters.availability !== undefined) {
        employeeFilter.isAvailable = filters.availability
    }

    const employee = await Employee.find(employeeFilter).sort({ createdAt: -1 }).skip(
        ((filters.page ?? 1) - 1) * (filters.limit ?? 20),
    ).limit(filters.limit ?? 20).lean();

    return employee as IEmployee[];
}

export const findEmployeeUserIds = async (filters: Pick<EmployeeListQuery, "city" | "accountStatus">): Promise<IUser["_id"][]> => {

    const userFilter: FilterQuery<IUser> = {
        role: Role.EMPLOYEE
    };

    if (filters.city) {
        userFilter.city = filters.city
    }

    if (filters.accountStatus) {
        userFilter.accountStatus = filters.accountStatus
    }

    const users = await User.find(userFilter).select("_id").lean()
    return users.map((user) => user._id);
}

export const findEmployeesByUserIds = async (
    userIds: IUser["_id"][],
    filters: Pick<EmployeeListQuery, "trade" | "availability">,
    page: number,
    limit: number,
): Promise<IEmployee[]> => {

    const employeeFilter: FilterQuery<IEmployee> = {
        userId: { $in: userIds }
    }

    if (filters.trade) {
        employeeFilter.trade = filters.trade
    }

    if (filters.availability !== undefined) {
        employeeFilter.isAvailable = filters.availability
    }

    return Employee.find(employeeFilter)
        .populate("userId", "email fullName phone city role accountStatus, isActive emailVerified")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
}

export const countEmployeeByUserIds = async (
    userIds: IUser["_id"][],
    filters: Pick<EmployeeListQuery, "trade" | "availability">
): Promise<number> => {

    const employeeFilter: FilterQuery<IEmployee> = {
        userId: { $in: userIds }
    }

    if (filters.trade) {
        employeeFilter.trade = filters.trade
    }

    if (filters.availability !== undefined) {
        employeeFilter.isAvailable = filters.availability
    }

    return Employee.countDocuments(employeeFilter);

}

export const updateEmployee = async (
    employeeId: string,
    update: UpdateEmployeeInput
): Promise<IEmployee | null> => {

    return Employee.findByIdAndUpdate(employeeId, update,
        {
            new: true,
            runValidators: true
        })

}

export const updateUserAccountStatus = async (
    userId: string,
    accountStatus: AccountStatus
): Promise<IUser | null> => {

    return User.findByIdAndUpdate(
        userId,
        {
            $set: {
                accountStatus,
                isActive: accountStatus === AccountStatus.ACTIVE 
            }
        },
        { new: true, runValidators: true })
}

export const approveEmployee = async (
    employeeId: string,
    approvedById: string
): Promise<IEmployee | null> => {
    return Employee.findByIdAndUpdate(
        employeeId,
        {
            $set: {
                approvedById,
                approvedAt: new Date(),
            },
            $unset: {
                rejectionReason: ""
            }
        },
        {
            new: true,
            runValidators: true
        }
    )
}


export const rejectedEmployee = async (
    employeeId: string,
    rejectionReason: string,
): Promise<IEmployee | null> => {

    return Employee.findByIdAndUpdate(
        employeeId,
        {
            $set: {
                rejectionReason
            },
            $unset: {
                approvedAt: "",
                approvedById: ""
            }
        },
        {
            new: true,
            runValidators: true
        }
    )
}

export const countEmployees = async (
    filter: FilterQuery<IEmployee>
): Promise<number> => {
    return Employee.countDocuments(filter);
}

