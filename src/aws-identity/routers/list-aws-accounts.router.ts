import { Router } from 'express';
import { adminOnlyMiddleware, asyncErrorHandler } from '../../__middlewares__';
import { listAwsAccountsService } from '../services';

export const listAwsAccountsRouter = Router();
listAwsAccountsRouter.get(
  '/aws-accounts.list',
  adminOnlyMiddleware,
  asyncErrorHandler(async (_req, res) => {
    const result = await listAwsAccountsService();
    res.status(200).send({
      ok: true,
      ...result,
    });
  })
);
