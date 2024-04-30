import { db } from '../../db';
import { PullFailedError } from '../errors';
import { listAccountAssignments } from '../helper';
import { PullAssignmentData } from '../validations';

export const pullAssignmentsService = async ({ force }: PullAssignmentData) => {
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
      throw new PullFailedError([
        'Cannot synchronize assignments during freeze time',
      ]);
    }
  }

  const data = await listAccountAssignments();
  console.log('ListAccountAssignments: ', data);

  await db.$transaction(async (trx) => {
    await trx.accountAssignment.deleteMany();

    await trx.accountAssignment.createMany({
      data,
    });
  });
};
