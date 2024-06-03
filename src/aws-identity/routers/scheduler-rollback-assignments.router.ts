import { Router } from 'express';
import { schedulerRollbackAssignmentsService } from '../services';
import { apiKeyMiddleware, asyncErrorHandler } from '../../__middlewares__';
import { IAuthRequest } from '../../__shared__/interfaces';

export const schedulerRollbackAssignmentsRouter = Router();
schedulerRollbackAssignmentsRouter.post(
  '/scheduler.rollback',
  apiKeyMiddleware,
  asyncErrorHandler(async (req: IAuthRequest, res) => {
    await schedulerRollbackAssignmentsService(req.body.name, res);

    res.status(200).send({
      ok: true,
    });
  })
);
