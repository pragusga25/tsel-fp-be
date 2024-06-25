import { Router } from 'express';
import {
  adminOnlyMiddleware,
  validationQueryMiddleware,
} from '../../__middlewares__';
import { IAuthRequest } from '../../__shared__/interfaces';
import { listLogsService } from '../services';
import { ListLogsData, ListLogsSchema } from '../validations';

export const listLogsRouter = Router();
listLogsRouter.get(
  '/logs.list',

  adminOnlyMiddleware,
  validationQueryMiddleware(ListLogsSchema),
  async (req: IAuthRequest, res) => {
    const query = req.query as unknown as ListLogsData;

    const result = await listLogsService(query);
    res.status(200).send({
      ok: true,
      ...result,
    });
  }
);
