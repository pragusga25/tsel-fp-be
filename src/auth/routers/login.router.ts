import { Router } from 'express';
import { loginService } from '../services';
import {
  asyncErrorHandler,
  validationBodyMiddleware,
} from '../../__middlewares__';
import { LoginSchema } from '../validations';
import { HttpUtil } from '../../__shared__/utils';

export const loginRouter = Router();
loginRouter.post(
  '/auth.login',
  validationBodyMiddleware(LoginSchema),
  asyncErrorHandler(async (req, res) => {
    const payload = req.body;
    const {
      result: { accessToken, refreshToken, user },
    } = await loginService(payload);
    HttpUtil.attachRefreshToken(res, refreshToken);

    res.status(200).send({
      ok: true,
      result: {
        accessToken,
        user,
      },
    });
  })
);
