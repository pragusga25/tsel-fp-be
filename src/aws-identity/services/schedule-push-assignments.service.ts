import { Response } from 'express';
import { getLocaleDateString } from '../../__shared__/utils';
import { db } from '../../db';
import { OperationFailedError } from '../errors';
import { pushAssignmentsService } from './push-assignments.service';

export const schedulePushAssignmentsService = async (res?: Response) => {
  const currentDate = getLocaleDateString(new Date(), {
    format: 'yyyy-mm-dd',
  });
  const now = new Date(currentDate);

  const assignmentsPromise = db.accountAssignment.findMany();

  const freezeTimePromise = db.freezeTime.findFirst({
    where: {
      AND: [{ startTime: { lte: now } }, { endTime: { gt: now } }],
    },
  });

  const [dbAssignments, freezeTime] = await Promise.all([
    assignmentsPromise,
    freezeTimePromise,
  ]);

  if (dbAssignments.length === 0) {
    throw new OperationFailedError([
      'No account assignments found. Please pull account assignments first.',
    ]);
  }

  if (freezeTime) {
    throw new OperationFailedError([
      'There is an active freeze time. Please wait until the freeze time ends.',
    ]);
  }

  if (res) {
    res.on('finish', async () => {
      await pushAssignmentsService();
    });
  } else {
    await pushAssignmentsService();
  }
};
