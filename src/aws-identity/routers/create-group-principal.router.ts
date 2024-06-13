import { Router } from 'express';
import { createGroupPrincipalService } from '../services';
import {
  adminOnlyMiddleware,
  asyncErrorHandler,
  validationBodyMiddleware,
} from '../../__middlewares__';
import { CreateGroupPrincipalSchema } from '../validations';
import { IAuthRequest } from '../../__shared__/interfaces';

export const createGroupPrincipalRouter = Router();
createGroupPrincipalRouter.post(
  '/principals.groups.create',
  adminOnlyMiddleware,
  validationBodyMiddleware(CreateGroupPrincipalSchema),
  asyncErrorHandler(async (req: IAuthRequest, res) => {
    const payload = req.body;
    const result = await createGroupPrincipalService(payload, req.user);

    res.status(201).send({
      ok: true,
      ...result,
    });
  })
);
