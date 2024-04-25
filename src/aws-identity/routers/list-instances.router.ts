import { Router } from 'express';
import { listInstancesService } from '../services';

export const listInstancesRouter = Router();
listInstancesRouter.get('/instances.list', async (req, res) => {
  const result = await listInstancesService();

  res.status(200).send({
    ok: true,
    ...result,
  });
});
