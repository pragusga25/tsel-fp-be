import { Router } from 'express';
import { listPermissionSetsService } from '../services';

export const listPermissionSetsRouter = Router();
listPermissionSetsRouter.get('/permission-sets.list', async (_req, res) => {
  const result = await listPermissionSetsService();

  res.status(200).send({
    ok: true,
    ...result,
  });
});
