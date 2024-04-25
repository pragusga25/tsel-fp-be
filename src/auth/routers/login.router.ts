import { Router } from 'express';
import { loginService } from '../services';
import {
  asyncErrorHandler,
  validationBodyMiddleware,
} from '../../__middlewares__';
import { LoginSchema } from '../validations';

export const loginRouter = Router();
loginRouter.post(
  '/auth.login',
  validationBodyMiddleware(LoginSchema),
  asyncErrorHandler(async (req, res) => {
    const payload = req.body;
    const result = await loginService(payload);

    res.status(200).send({
      ok: true,
      ...result,
    });
  })
);
