import { Router } from 'express';
import {
  asyncErrorHandler,
  authMiddleware,
  validationBodyMiddleware,
} from '../../__middlewares__';
import { IAuthRequest } from '../../__shared__/interfaces';
import { UpdateAccountPasswordSchema } from '../validations';
import { updateAccountPasswordService } from '../services';

export const updateAccountPasswordRouter = Router();
updateAccountPasswordRouter.post(
  '/accounts.password.update',
  authMiddleware,
  validationBodyMiddleware(UpdateAccountPasswordSchema),
  asyncErrorHandler(async (req: IAuthRequest, res) => {
    const payload = {
      ...req.body,
      userId: req.user!.id,
    };
    await updateAccountPasswordService(payload);
    res.status(200).send({
      ok: true,
    });
  })
);
