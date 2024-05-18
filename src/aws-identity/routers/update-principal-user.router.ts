import { Router } from 'express';
import { updatePrincipalUserService } from '../services';
import {
  adminOnlyMiddleware,
  asyncErrorHandler,
  validationBodyMiddleware,
} from '../../__middlewares__';
import { UpdatePrincipalUserSchema } from '../validations';
import { IAuthRequest } from '../../__shared__/interfaces';

export const updatePrincipalUserRouter = Router();
updatePrincipalUserRouter.post(
  '/principals.users.update',
  adminOnlyMiddleware,
  validationBodyMiddleware(UpdatePrincipalUserSchema),
  asyncErrorHandler(async (req: IAuthRequest, res) => {
    const payload = req.body;
    await updatePrincipalUserService(payload);

    res.status(200).send({
      ok: true,
    });
  })
);
