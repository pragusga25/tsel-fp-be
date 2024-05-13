import { Router } from 'express';
import { adminOnlyMiddleware, asyncErrorHandler } from '../../__middlewares__';
import { listPrincipalsNotInDbService } from '../services';

export const listPrincipalsNotInDbRouter = Router();
listPrincipalsNotInDbRouter.get(
  '/principals.list-not-in-db',
  adminOnlyMiddleware,
  asyncErrorHandler(async (_req, res) => {
    const result = await listPrincipalsNotInDbService();
    res.status(200).send({
      ok: true,
      ...result,
    });
  })
);
