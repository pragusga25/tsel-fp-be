import { Router } from 'express';
import { registerService } from '../services';
import {
  asyncErrorHandler,
  validationBodyMiddleware,
} from '../../__middlewares__';
import { RegisterSchema } from '../validations';

export const registerRouter = Router();
registerRouter.post(
  '/auth.register',
  validationBodyMiddleware(RegisterSchema),
  asyncErrorHandler(async (req, res) => {
    const payload = req.body;
    const result = await registerService(payload);

    res.status(201).send({
      ok: true,
      ...result,
    });
  })
);
