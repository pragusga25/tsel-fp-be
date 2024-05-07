import { Router } from 'express';
import { upsertIdentityInstanceService } from '../services';
import { validationBodyMiddleware } from '../../__middlewares__';
import { IdentityInstanceSchema } from '../validations';

export const upsertIdentityInstanceRouter = Router();
upsertIdentityInstanceRouter.post(
  '/identity-instance.upsert',
  validationBodyMiddleware(IdentityInstanceSchema),
  async (req, res) => {
    const payload = req.body;
    await upsertIdentityInstanceService(payload);

    res.status(200).send({
      ok: true,
    });
  }
);
