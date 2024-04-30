import { Router } from 'express';
import { adminOnlyMiddleware, asyncErrorHandler } from '../../__middlewares__';
import { listPrincipalsService } from '../services';

export const listPrincipalsRouter = Router();
listPrincipalsRouter.get(
  '/principals.list',
  adminOnlyMiddleware,
  asyncErrorHandler(async (_req, res) => {
    const result = await listPrincipalsService();
    res.status(200).send({
      ok: true,
      ...result,
    });
  })
);
