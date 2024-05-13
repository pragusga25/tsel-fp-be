import { Router } from 'express';
import { listPermissionSetsService } from '../services';
import { asyncErrorHandler } from '../../__middlewares__';

export const listPermissionSetsRouter = Router();
listPermissionSetsRouter.get(
  '/permission-sets.list',

  asyncErrorHandler(async (_req, res) => {
    const result = await listPermissionSetsService();

    res.status(200).send({
      ok: true,
      ...result,
    });
  })
);
