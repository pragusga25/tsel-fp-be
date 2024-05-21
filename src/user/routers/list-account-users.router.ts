import { Router } from 'express';
import { adminOnlyMiddleware } from '../../__middlewares__';
import { IAuthRequest } from '../../__shared__/interfaces';
import { listAccountUsersService } from '../services';

export const listAccountUsersRouter = Router();
listAccountUsersRouter.get(
  '/users.list',
  adminOnlyMiddleware,
  async (_req: IAuthRequest, res) => {
    const result = await listAccountUsersService();
    res.status(200).send({
      ok: true,
      ...result,
    });
  }
);
