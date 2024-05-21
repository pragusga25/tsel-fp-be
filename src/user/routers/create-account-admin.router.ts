import { Router } from 'express';
import {
  adminOnlyMiddleware,
  asyncErrorHandler,
  validationBodyMiddleware,
} from '../../__middlewares__';
import { IAuthRequest } from '../../__shared__/interfaces';
import { createAccountAdminService } from '../services';
import { CreateAccountAdminSchema } from '../validations';

export const createAccountAdminRouter = Router();
createAccountAdminRouter.post(
  '/admins.create',
  adminOnlyMiddleware,
  validationBodyMiddleware(CreateAccountAdminSchema),
  asyncErrorHandler(async (req: IAuthRequest, res) => {
    const payload = req.body;
    await createAccountAdminService(payload);
    res.status(200).send({
      ok: true,
    });
  })
);
