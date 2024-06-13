import { Router } from 'express';
import { createUserPrincipalService } from '../services';
import {
  adminOnlyMiddleware,
  asyncErrorHandler,
  validationBodyMiddleware,
} from '../../__middlewares__';
import { CreateUserPrincipalSchema } from '../validations';
import { IAuthRequest } from '../../__shared__/interfaces';

export const createUserPrincipalRouter = Router();
createUserPrincipalRouter.post(
  '/principals.users.create',
  adminOnlyMiddleware,
  validationBodyMiddleware(CreateUserPrincipalSchema),
  asyncErrorHandler(async (req: IAuthRequest, res) => {
    const payload = req.body;
    const result = await createUserPrincipalService(payload, req.user);

    res.status(201).send({
      ok: true,
      ...result,
    });
  })
);
