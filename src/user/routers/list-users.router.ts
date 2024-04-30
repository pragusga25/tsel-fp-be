import { Router } from 'express';
import { adminOnlyMiddleware } from '../../__middlewares__';
import { IAuthRequest } from '../../__shared__/interfaces';
import { listUsersService } from '../services';

export const listUsersRouter = Router();
listUsersRouter.get(
  '/users.list',
  adminOnlyMiddleware,
  async (_req: IAuthRequest, res) => {
    const result = await listUsersService();
    res.status(200).send({
      ok: true,
      ...result,
    });
  }
);
