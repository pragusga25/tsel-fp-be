import { db } from '../../db';
import { EditAccountAssignmentData } from '../validations';

export const editAccountAssignmentService = async (
  data: EditAccountAssignmentData
) => {
  const { id, permissionSets } = data;

  await db.accountAssignment.update({
    where: { id },
    data: {
      permissionSets: {
        set: permissionSets,
      },
    },
  });
};
