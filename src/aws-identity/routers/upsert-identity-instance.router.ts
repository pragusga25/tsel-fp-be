import { Router } from 'express';
import { upsertIdentityInstanceService } from '../services';

export const upsertIdentityInstanceRouter = Router();
upsertIdentityInstanceRouter.post(
  '/aws-identity/identity-instance.upsert',
  async (req, res) => {
    const payload = req.body;
    await upsertIdentityInstanceService(payload);

    res.status(200).send({
      ok: true,
    });
  }
);
