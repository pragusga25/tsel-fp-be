import { IJwtPayload } from '../../__shared__/interfaces';
import { createLog } from '../../__shared__/utils';
import { db } from '../../db';
import { UserNotApproverError } from '../errors';
import { DeleteApproverData } from '../validations';

export const deleteApproverService = async (
  data: DeleteApproverData,
  currentUser?: IJwtPayload
) => {
  const approver = await db.user.findUnique({
    where: {
      id: data.userId,
    },
    select: {
      isApprover: true,
    },
  });

  const isApprover = approver?.isApprover;
  if (!isApprover) {
    throw new UserNotApproverError();
  }

  const deletedApprover = await db.user.update({
    data: {
      isApprover: false,
    },
    where: {
      id: data.userId,
    },
    select: {
      name: true,
      username: true,
    },
  });

  const logMessage = `${currentUser?.name} menghapus ${deletedApprover.name} dengan username: ${deletedApprover.username} dari list approver.`;
  await createLog(logMessage);
};
