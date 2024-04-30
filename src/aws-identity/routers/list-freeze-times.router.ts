import { Router } from 'express';
import { adminOnlyMiddleware, asyncErrorHandler } from '../../__middlewares__';
import { listFreezeTimesService } from '../services';

export const listFreezeTimesRouter = Router();
listFreezeTimesRouter.get(
  '/freeze-times.list',
  adminOnlyMiddleware,
  asyncErrorHandler(async (_req, res) => {
    const result = await listFreezeTimesService();
    res.status(200).send({
      ok: true,
      ...result,
    });
  })
);
