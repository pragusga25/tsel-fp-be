import { Router } from 'express';
import { listPermissionSetsService } from '../services';
import { asyncErrorHandler, authMiddleware } from '../../__middlewares__';
import { IAuthRequest } from '../../__shared__/interfaces';

export const listPermissionSetsRouter = Router();
listPermissionSetsRouter.get(
  '/permission-sets.list',
  authMiddleware,
  asyncErrorHandler(async (req: IAuthRequest, res) => {
    const result = await listPermissionSetsService(req.user!);

    res.status(200).send({
      ok: true,
      ...result,
    });
  })
);
