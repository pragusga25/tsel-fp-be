import { Router } from 'express';
import { schedulerFreezeAssignmentsService } from '../services';
import { apiKeyMiddleware, asyncErrorHandler } from '../../__middlewares__';
import { IAuthRequest } from '../../__shared__/interfaces';

export const schedulerFreezeAssignmentsRouter = Router();
schedulerFreezeAssignmentsRouter.post(
  '/scheduler.freeze',
  apiKeyMiddleware,
  asyncErrorHandler(async (req: IAuthRequest, res) => {
    await schedulerFreezeAssignmentsService(req.body.name, res);

    res.status(200).send({
      ok: true,
    });
  })
);
