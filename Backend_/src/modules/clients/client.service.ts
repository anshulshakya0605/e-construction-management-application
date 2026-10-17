import { ClientListQuery, ClientResponse, ClientWithUser } from "./client.types";
import * as clientRepository from './client.repository'
import { ApiError } from "../../utils/ApiError";
import { CLIENT_MESSAGES, ERROR_CODES, HTTP_STATUS } from "../../shared/constants";
import { string } from "zod/v4";
import { Role } from "../../shared/enums";

const mapClientResponse = (client: ClientWithUser): ClientResponse => {
    return {
        id: String(client._id),
        userId: String(client.userId._id),
        email: client.userId.email,
        fullName: client.userId.fullName,
        phone: client.userId.phone,
        city: client.userId.city,
        role: client.userId.role,
        accountStatus: client.userId.accountStatus,
        isActive: client.userId.isActive,
        emailVerified: client.userId.emailVerified,
        companyName: client.companyName,
        gstNumber: client.gstNumber,
        convertedFromInquiryId: client.convertedFromInquiryId?.toString(),
        createdAt: client.createdAt,
        updatedAt: client.updatedAt
    }
}

export const getClients = async (query: ClientListQuery) => {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const [clients, total] = await Promise.all([
        clientRepository.findClients({
            page, limit
        }),
        clientRepository.countClients(),
    ])

    const data = clients.map((client) => mapClientResponse(client as unknown as ClientWithUser));
    return {
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    }
}

export const getClientById = async (clientId: string): Promise<ClientResponse> => {
    const client = await clientRepository.findClientById(clientId);
    if (!client) {
        throw new ApiError({
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: CLIENT_MESSAGES.CLIENT_NOT_FOUND,
            errorCode: ERROR_CODES.CLIENT_NOT_FOUND
        })
    }

    return mapClientResponse(
        client as unknown as ClientWithUser
    )
}

export const getClientSites = async (
    clientId: string, 
    requesterUserId: string,
    requesterRole: Role
) => {

     const client = await clientRepository.findClientById(clientId);
    if (!client) {
        throw new ApiError({
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: CLIENT_MESSAGES.CLIENT_NOT_FOUND,
            errorCode: ERROR_CODES.CLIENT_NOT_FOUND
        })
    }

    const clientUserId = String(client.userId._id);

    if (
    requesterRole !== Role.ADMIN &&
    clientUserId !== requesterUserId
  ) {
    throw new ApiError({
        statusCode: HTTP_STATUS.FORBIDDEN,
        message: CLIENT_MESSAGES.CLIENT_ACCESS_DENIED,
        errorCode: ERROR_CODES.CLIENT_ACCESS_DENIED
    });
  }

  return clientRepository.findClientSites(String(client._id));

}