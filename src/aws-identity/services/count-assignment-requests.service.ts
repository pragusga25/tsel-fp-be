import { db } from '../../db';
import { CountAssignmentRequestsData } from '../validations';

export const countAssignmentRequestsService = async ({
  status,
}: CountAssignmentRequestsData) => {
  const count = await db.assignmentRequest.count({
    where: {
      status,
    },
  });

  return { result: { count } };
};
