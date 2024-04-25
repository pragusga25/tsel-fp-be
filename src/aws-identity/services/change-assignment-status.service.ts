import { AssignmentRequestStatus, PrincipalType } from '@prisma/client';
import { db } from '../../db';
import {
  AssignmentRequestNotFoundError,
  AssignmentRequestNotPendingError,
} from '../errors';

type Data = {
  permissionSetArns: string[];
  principalId: string;
  principalType: PrincipalType;
};

export const changeAssignmentStatusService = async (
  responderId: string,
  id: string,
  status: AssignmentRequestStatus,
  cb?: (data: Data) => unknown
) => {
  await db.$transaction(async (trx) => {
    const currentData = await db.assignmentRequest.findUnique({
      where: {
        id,
      },
      select: {
        status: true,
      },
    });

    if (!currentData) {
      throw new AssignmentRequestNotFoundError();
    }

    if (currentData.status !== 'PENDING') {
      throw new AssignmentRequestNotPendingError([
        `The assignment request is in ${currentData.status} status.`,
      ]);
    }

    const data = await trx.assignmentRequest.update({
      where: {
        id,
      },
      data: {
        responderId,
        status: status,
        respondedAt: new Date(),
      },
      select: {
        permissionSetArns: true,
        principalId: true,
        principalType: true,
      },
    });

    cb?.(data);
  });
};
