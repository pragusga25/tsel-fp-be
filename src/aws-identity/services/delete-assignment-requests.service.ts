import { Role } from '@prisma/client';
import { db } from '../../db';
import { DeleteAssignmentRequestsData } from '../validations';

export const deleteAssignmentRequestsService = async (
  data: DeleteAssignmentRequestsData
) => {
  const { userId, ids, role } = data;

  await db.assignmentRequest.deleteMany({
    where: {
      requesterId: role === Role.USER ? userId : undefined,
      id: {
        in: ids,
      },
      status:
        role === Role.USER
          ? 'PENDING'
          : {
              not: 'PENDING',
            },
    },
  });
};
