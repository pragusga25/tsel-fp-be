import { Router } from 'express';
import { listMyPermissionSetsService } from '../services';
import { asyncErrorHandler, userOnlyMiddleware } from '../../__middlewares__';
import { IAuthRequest } from '../../__shared__/interfaces';

export const listMyPermissionSetsRouter = Router();
listMyPermissionSetsRouter.get(
  '/permission-sets.my-list',
  userOnlyMiddleware,
  asyncErrorHandler(async (req: IAuthRequest, res) => {
    const result = await listMyPermissionSetsService(req.user!.id);

    res.status(200).send({
      ok: true,
      ...result,
    });
  })
);
