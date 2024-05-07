import { Router } from 'express';
import { getIdentityInstanceService } from '../services';
import { adminOnlyMiddleware, asyncErrorHandler } from '../../__middlewares__';

export const getIdentityInstanceRouter = Router();
getIdentityInstanceRouter.get(
  '/identity-instance.get',
  adminOnlyMiddleware,
  asyncErrorHandler(async (_req, res) => {
    const result = await getIdentityInstanceService();

    res.status(200).send({
      ok: true,
      ...result,
    });
  })
);
