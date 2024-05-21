import { db } from '../../db';
import { PullFailedError } from '../errors';
import { listAccountAssignmentsv2 } from '../helper';
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

  const awsSccountAssignments = await listAccountAssignmentsv2();

  await db.$transaction(async (trx) => {
    await trx.accountAssignment.deleteMany();
    await trx.accountAssignment.createMany({
      data: awsSccountAssignments.map(
        ({
          awsAccountName,
          principalDisplayName,
          awsAccountId,
          permissionSets,
          ...rest
        }) => ({
          ...rest,
          awsAccountId: awsAccountId!,
          permissionSetArns: permissionSets.map((ps) => ps.arn),
        })
      ),
    });
  });
};
