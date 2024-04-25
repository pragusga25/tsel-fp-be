import { db } from '../../db';
import { SynchronizationFailedError } from '../errors';
import { listAccountAssignments } from '../helper';
import { SynchronizeAssignmentData } from '../validations';

export const synchronizeAssignmentsService = async ({
  force,
}: SynchronizeAssignmentData) => {
  const checkFreezeTime = !force;
  if (checkFreezeTime) {
    const now = new Date();

    const todayFreezeTime = await db.freezeTime.findFirst({
      where: {
        startTime: {
          lte: now,
        },
        endTime: {
          gte: now,
        },
      },
    });

    if (todayFreezeTime) {
      throw new SynchronizationFailedError([
        'Cannot synchronize assignments during freeze time',
      ]);
    }
  }

  const data = await listAccountAssignments();

  await db.$transaction(async (trx) => {
    await trx.accountAssignment.deleteMany();

    await trx.accountAssignment.createMany({
      data,
    });
  });
};
