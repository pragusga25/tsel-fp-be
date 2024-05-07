import { Router } from 'express';
import {
  asyncErrorHandler,
  authMiddleware,
  validationBodyMiddleware,
} from '../../__middlewares__';
import { IAuthRequest } from '../../__shared__/interfaces';
import { updateUserPasswordService } from '../services';
import { UpdateUserPasswordSchema } from '../validations';

export const updateUserPasswordRouter = Router();
updateUserPasswordRouter.post(
  '/users.password.update',
  authMiddleware,
  validationBodyMiddleware(UpdateUserPasswordSchema),
  asyncErrorHandler(async (req: IAuthRequest, res) => {
    const payload = {
      ...req.body,
      userId: req.user!.id,
    };
    await updateUserPasswordService(payload);
    res.status(200).send({
      ok: true,
    });
  })
);
