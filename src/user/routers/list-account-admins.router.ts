import { Router } from 'express';
import { adminOnlyMiddleware } from '../../__middlewares__';
import { IAuthRequest } from '../../__shared__/interfaces';
import { listAccountAdminsService } from '../services';

export const listAccountAdminsRouter = Router();
listAccountAdminsRouter.get(
  '/admins.list',
  adminOnlyMiddleware,
  async (_req: IAuthRequest, res) => {
    const result = await listAccountAdminsService();
    res.status(200).send({
      ok: true,
      ...result,
    });
  }
);
