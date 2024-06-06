import { Router } from 'express';
import { adminOnlyMiddleware } from '../../__middlewares__';
import { IAuthRequest } from '../../__shared__/interfaces';
import { listApproversService } from '../services';

export const listApproversRouter = Router();
listApproversRouter.get(
  '/approvers.list',
  adminOnlyMiddleware,
  async (_req: IAuthRequest, res) => {
    const result = await listApproversService();
    console.log(result);
    res.status(200).send({
      ok: true,
      ...result,
    });
  }
);
