import { db } from '../../db';
import { OperationFailedError } from '../errors';
import { RequestAssignmentData } from '../validations';

export const requestAssignmentService = async (data: RequestAssignmentData) => {
  const requesterPrincipal = await db.user.findUnique({
    where: {
      id: data.requesterId,
    },
    select: {
      principalId: true,
      principalType: true,
      principalDisplayName: true,
    },
  });

  if (!requesterPrincipal) {
    throw new OperationFailedError(['Requester not found']);
  }

  if (!requesterPrincipal.principalId || !requesterPrincipal.principalType) {
    throw new OperationFailedError(['Requester principal not found']);
  }

  const result = await db.assignmentRequest.create({
    data: {
      ...data,
      requestedAt: new Date(),
      principalId: requesterPrincipal.principalId,
      principalType: requesterPrincipal.principalType,
      principalDisplayName: requesterPrincipal.principalDisplayName,
    },
    select: {
      id: true,
    },
  });

  return { result };
};
