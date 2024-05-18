import { Router } from 'express';
import { listGroupPrincipalsService } from '../services';

export const listGroupPrincipalsRouter = Router();
listGroupPrincipalsRouter.get('/principals.groups.list', async (req, res) => {
  const result = await listGroupPrincipalsService();

  res.status(200).send({
    ok: true,
    ...result,
  });
});
