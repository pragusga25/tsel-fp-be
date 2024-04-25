import { Router } from 'express';
import { listGroupsService } from '../services';

export const listGroupsRouter = Router();
listGroupsRouter.get('/aws-identity/groups.list', async (req, res) => {
  const result = await listGroupsService();

  res.status(200).send({
    ok: true,
    ...result,
  });
});
