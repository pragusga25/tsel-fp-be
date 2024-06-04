import { db } from '../../db';
import { OperationFailedError } from '../errors';
import { RequestAssignmentData } from '../validations';

export const requestAssignmentService = async (data: RequestAssignmentData) => {
  const { requesterId, principalGroupId, awsAccountId, ...rest } = data;
  const requester = await db.user.findUnique({
    where: {
      id: requesterId,
    },
  });

  if (!requester) {
    throw new OperationFailedError(['Requester not found']);
  }

  const result = await db.assignmentRequest.create({
    data: {
      ...rest,
      requestedAt: new Date(),
      principalId: principalGroupId,
      awsAccountId,
      requesterId,
    },
    select: {
      id: true,
    },
  });

  return { result };
};
