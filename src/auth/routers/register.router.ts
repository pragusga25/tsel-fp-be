import { Router } from 'express';
import { registerService } from '../services';
import {
  adminOnlyMiddleware,
  asyncErrorHandler,
  validationBodyMiddleware,
} from '../../__middlewares__';
import { RegisterSchema } from '../validations';

export const registerRouter = Router();
registerRouter.post(
  '/auth.register',
  adminOnlyMiddleware,
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
