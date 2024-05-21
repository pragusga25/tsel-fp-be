import { Router } from 'express';
import {
  adminOnlyMiddleware,
  asyncErrorHandler,
  validationBodyMiddleware,
} from '../../__middlewares__';
import { IAuthRequest } from '../../__shared__/interfaces';
import { updateAccountUserService } from '../services';
import { UpdateAccountUserSchema } from '../validations';

export const updateAccountUserRouter = Router();
updateAccountUserRouter.post(
  '/users.update',
  adminOnlyMiddleware,
  validationBodyMiddleware(UpdateAccountUserSchema),
  asyncErrorHandler(async (req: IAuthRequest, res) => {
    const payload = req.body;
    await updateAccountUserService(payload);
    res.status(200).send({
      ok: true,
    });
  })
);
