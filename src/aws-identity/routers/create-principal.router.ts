import { Router } from 'express';
import { createPrincipalService } from '../services';
import {
  adminOnlyMiddleware,
  asyncErrorHandler,
  validationBodyMiddleware,
} from '../../__middlewares__';
import { CreatePrincipalSchema } from '../validations';
import { IAuthRequest } from '../../__shared__/interfaces';

export const createPrincipalRouter = Router();
createPrincipalRouter.post(
  '/principals.create',
  adminOnlyMiddleware,
  validationBodyMiddleware(CreatePrincipalSchema),
  asyncErrorHandler(async (req: IAuthRequest, res) => {
    const payload = req.body;
    const result = await createPrincipalService(payload);

    res.status(201).send({
      ok: true,
      ...result,
    });
  })
);
