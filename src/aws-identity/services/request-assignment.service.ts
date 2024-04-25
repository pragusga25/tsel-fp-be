import { db } from '../../db';
import { RequestAssignmentData } from '../validations';

export const requestAssignmentService = async (
  requesterId: string,
  principalId: string,
  data: RequestAssignmentData
) => {
  const result = await db.assignmentRequest.create({
    data: {
      requesterId,
      principalId,
      ...data,
      requestedAt: new Date(),
    },
    select: {
      id: true,
    },
  });

  return { result };
};
