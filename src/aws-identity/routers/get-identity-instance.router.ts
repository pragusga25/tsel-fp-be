import { Router } from 'express';
import { getIdentityInstanceService } from '../services';
import { asyncErrorHandler } from '../../__middlewares__';

export const getIdentityInstanceRouter = Router();
getIdentityInstanceRouter.get(
  '/aws-identity/identity-instance.get',
  asyncErrorHandler(async (_req, res) => {
    const result = await getIdentityInstanceService();

    res.status(200).send({
      ok: true,
      ...result,
    });
  })
);
