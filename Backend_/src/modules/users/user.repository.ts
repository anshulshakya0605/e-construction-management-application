import { FilterQuery, Types } from "mongoose";
import { IUser, User } from "../../models";
import { UserListQuery } from "./user.types";


export const findUsers = async(query: UserListQuery): Promise<{users: IUser[]; total: number}> => {

    const {page = 1, limit = 20, search, role, city, emailVerified, accountStatus, isActive } = query;

    const filter: FilterQuery<IUser> = {};

    if (search) {
        filter.$or = [
            {email: {$regex: search, $options: 'i'}},
            {fullName: {$regex: search, $options: 'i'}},
            {phone: {$regex: search, $options: 'i'}},
        ]
    }

    if (role) filter.role = role;
    if(city) filter.city = city;
    if(accountStatus) filter.accountStatus = accountStatus;
    
    if(typeof isActive === 'boolean') filter.isActive = isActive;
    if(typeof emailVerified === 'boolean') filter.emailVerified = emailVerified;

   const [users, total] = await Promise.all([
        User.find(filter)
        .sort({createdAt: -1})
        .skip((page - 1) * limit)
        .limit(limit),
        User.countDocuments(filter)
    ])

    return {
        users: users as IUser[],
        total
    };
};

export const findUserById = async(id: string) => {
    if (!Types.ObjectId.isValid(id)) return null;

        return User.findById(id).lean();

};

export const updateUserStatus = async(
    id: string,
    isActive: boolean
) => {
    return User.findByIdAndUpdate(
            id,
            { $set: { isActive } },
            { new: true, runValidators: true },
        ).lean();
};

export const updateUserRole = async(
    id: string,
    role: IUser['role']
) => {
    return User.findByIdAndUpdate(
            id,
            { $set: { role } },
            { new: true, runValidators: true },
        ).lean();
};

export const findUserStats = async() => {
    const [totalUsers, roleStats, activeUsers, inActiveUsers] =
            await Promise.all([
                User.countDocuments(),

                User.aggregate([
                    {
                        $group: {
                            _id: "$role",
                            count: { $sum: 1 },
                        },
                    },
                ]),

                User.countDocuments({ isActive: true }),
                User.countDocuments({ isActive: false }),
            ]);

        const roleCounts = Object.fromEntries(
            roleStats.map((item) => [item._id, item.count]),
        );

        return {
            totalUsers,
            totalAdmins: roleCounts.ADMIN ?? 0,
            totalEmployees: roleCounts.EMPLOYEE ?? 0,
            totalClients: roleCounts.CLIENT ?? 0,
            activeUsers,
            inActiveUsers,
        };
}

export const deleteUser = async (id: string) => {
    
    if (!Types.ObjectId.isValid(id)) return;

    return User.findByIdAndUpdate(id,
        {$set: {isActive: false}},
        {new: true, runValidators: true}
    ).lean()
}
