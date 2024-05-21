import { db } from '../../db';
import { EditAccountAssignmentData } from '../validations';

export const editAccountAssignmentService = async (
  data: EditAccountAssignmentData
) => {
  const { id, permissionSetArns } = data;

  await db.accountAssignment.update({
    where: { id },
    data: {
      permissionSetArns,
    },
  });
};
