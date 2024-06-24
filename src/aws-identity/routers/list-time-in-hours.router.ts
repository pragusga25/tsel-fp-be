import { Router } from 'express';

import { asyncErrorHandler, authMiddleware } from '../../__middlewares__';
import { IAuthRequest } from '../../__shared__/interfaces';
import { listTimeInHoursService } from '../services/list-time-in-hours.service';

export const listTimeInHoursRouter = Router();
listTimeInHoursRouter.get(
  '/time-in-hours.list',
  authMiddleware,
  asyncErrorHandler(async (_req: IAuthRequest, res) => {
    const result = await listTimeInHoursService();

    res.status(200).send({
      ok: true,
      ...result,
    });
  })
);
