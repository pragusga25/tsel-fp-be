import { Router } from 'express';
import { schedulerDetachAssignmentUserRequestService } from '../services';
import { apiKeyMiddleware, asyncErrorHandler } from '../../__middlewares__';
import { IAuthRequest } from '../../__shared__/interfaces';

export const schedulerDetachAssignmentUserRequestRouter = Router();
schedulerDetachAssignmentUserRequestRouter.post(
  '/scheduler.detach-assignment-user-request',
  apiKeyMiddleware,
  asyncErrorHandler(async (req: IAuthRequest, res) => {
    await schedulerDetachAssignmentUserRequestService(
      req.query.id as unknown as string
    );

    res.status(200).send({
      ok: true,
    });
  })
);
