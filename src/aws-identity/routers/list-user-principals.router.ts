import { Router } from 'express';
import { listUserPrincipalsService } from '../services';

export const listUserPrincipalsRouter = Router();
listUserPrincipalsRouter.get('/principals.users.list', async (req, res) => {
  const result = await listUserPrincipalsService();

  res.status(200).send({
    ok: true,
    ...result,
  });
});
