import { db } from '../../db';
import { RequestAssignmentData } from '../validations';

export const requestAssignmentService = async (data: RequestAssignmentData) => {
  const result = await db.assignmentRequest.create({
    data: {
      ...data,
      requestedAt: new Date(),
    },
    select: {
      id: true,
    },
  });

  return { result };
};
