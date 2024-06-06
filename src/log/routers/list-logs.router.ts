import { Router } from 'express';
import { adminOnlyMiddleware } from '../../__middlewares__';
import { IAuthRequest } from '../../__shared__/interfaces';
import { listLogsService } from '../services';

export const listLogsRouter = Router();
listLogsRouter.get(
  '/logs.list',
  adminOnlyMiddleware,
  async (_req: IAuthRequest, res) => {
    const result = await listLogsService();
    res.status(200).send({
      ok: true,
      ...result,
    });
  }
);
