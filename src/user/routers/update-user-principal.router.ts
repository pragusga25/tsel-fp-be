import { Router } from 'express';
import {
  adminOnlyMiddleware,
  asyncErrorHandler,
  validationBodyMiddleware,
} from '../../__middlewares__';
import { IAuthRequest } from '../../__shared__/interfaces';
import { updateUserPrincipalService } from '../services';
import { UpdateUserPrincipalSchema } from '../validations';

export const updateUserPrincipalRouter = Router();
updateUserPrincipalRouter.post(
  '/users.principal.update',
  adminOnlyMiddleware,
  validationBodyMiddleware(UpdateUserPrincipalSchema),
  asyncErrorHandler(async (req: IAuthRequest, res) => {
    const payload = req.body;
    await updateUserPrincipalService(payload);
    res.status(200).send({
      ok: true,
    });
  })
);
