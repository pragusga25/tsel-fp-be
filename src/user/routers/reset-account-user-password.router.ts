import { Router } from 'express';
import {
  adminOnlyMiddleware,
  asyncErrorHandler,
  validationBodyMiddleware,
} from '../../__middlewares__';
import { IAuthRequest } from '../../__shared__/interfaces';
import { ResetAccountUserPasswordSchema } from '../validations';
import { resetAccountUserPasswordService } from '../services';

export const resetAccountUserPasswordRouter = Router();
resetAccountUserPasswordRouter.post(
  '/users.password.reset',
  adminOnlyMiddleware,
  validationBodyMiddleware(ResetAccountUserPasswordSchema),
  asyncErrorHandler(async (req: IAuthRequest, res) => {
    const payload = req.body;
    await resetAccountUserPasswordService(payload, req.user);
    res.status(200).send({
      ok: true,
    });
  })
);
