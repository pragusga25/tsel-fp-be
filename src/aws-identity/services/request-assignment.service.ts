import { db } from '../../db';
import { OperationFailedError } from '../errors';
import { RequestAssignmentData } from '../validations';

export const requestAssignmentService = async (data: RequestAssignmentData) => {
  const { requesterId, principalAwsAccountUserId } = data;
  const requester = await db.user.findUnique({
    where: {
      id: requesterId,
    },
  });

  if (!requester) {
    throw new OperationFailedError(['Requester not found']);
  }

  const principalAwsAccount = await db.principalAwsAccountUser.findFirst({
    where: {
      id: principalAwsAccountUserId,
      userId: requesterId,
    },
    select: {
      principalType: true,
      principalId: true,
      awsAccountId: true,
    },
  });

  if (!principalAwsAccount) {
    throw new OperationFailedError(['PrincipalAwsAccountUser not found']);
  }

  const { principalAwsAccountUserId: n, ...rest } = data;

  const result = await db.assignmentRequest.create({
    data: {
      ...rest,
      ...principalAwsAccount,
      requestedAt: new Date(),
    },
    select: {
      id: true,
    },
  });

  return { result };
};
