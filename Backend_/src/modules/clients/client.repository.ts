import { Types } from "mongoose";
import { Client, IClient, Site } from "../../models";
import { ClientListQuery } from "./client.types";


export const findClients = async(query: ClientListQuery): Promise<IClient[]> => {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    return Client.find()
    .populate("userId", "email fullName phone city role accountStatus isActive emailVerified")
    .sort({createdAt: -1})
    .skip((page - 1) * limit)
    .limit(limit)
}

export const countClients = async (): Promise<number> => {
    return Client.countDocuments();
}

export const findClientById = async (clientId: string): Promise<IClient | null> => {
    return Client.findById(clientId)
    .populate("userId", "email fullName phone city role accountStatus isActive emailVerified")
}

export const findClientByUserId = async (userId: string) => {
    if (!Types.ObjectId.isValid(userId)) {
        return null
    }

    return Client.findOne({
        userId: new Types.ObjectId(userId)
    })
}

export const findClientSites = async (clientId: string) => {
    return Site.find({clientId}).sort({createdAt: -1}).lean();
}

export const deleteClient = async (
  clientId: string,
): Promise<IClient | null> => {
  return Client.findByIdAndDelete(clientId);
};