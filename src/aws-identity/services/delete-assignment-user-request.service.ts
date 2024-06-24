import { Role } from '@prisma/client';
import { IJwtPayload } from '../../__shared__/interfaces';
import { db } from '../../db';
import { DeleteAssignmentUserRequestData } from '../validations';

export const deleteAssignmentUserRequestService = async (
  data: DeleteAssignmentUserRequestData,
  currentUser: IJwtPayload
) => {
  const { role } = currentUser;

  if (role === Role.USER) {
    await db.assignmentUserRequest.deleteMany({
      where: {
        id: data.id,
        status: 'PENDING',
        requesterId: currentUser.id,
      },
    });

    return;
  }

  await db.assignmentUserRequest.deleteMany({
    where: {
      id: data.id,
      OR: [
        {
          status: {
            in: ['PENDING', 'REJECTED'],
          },
        },
        {
          status: 'ACCEPTED',
          endAt: {
            lt: new Date(),
          },
        },
      ],
    },
  });
};
