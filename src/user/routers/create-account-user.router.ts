import { Router } from 'express';
import {
  adminOnlyMiddleware,
  asyncErrorHandler,
  validationBodyMiddleware,
} from '../../__middlewares__';
import { IAuthRequest } from '../../__shared__/interfaces';
import { createAccountUserService } from '../services';
import { CreateAccountUserSchema } from '../validations';

export const createAccountUserRouter = Router();
createAccountUserRouter.post(
  '/users.create',
  adminOnlyMiddleware,
  validationBodyMiddleware(CreateAccountUserSchema),
  asyncErrorHandler(async (req: IAuthRequest, res) => {
    const payload = req.body;
    await createAccountUserService(payload);
    res.status(200).send({
      ok: true,
    });
  })
);
