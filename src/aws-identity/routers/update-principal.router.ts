import { Router } from 'express';
import { updatePrincipalService } from '../services';
import {
  adminOnlyMiddleware,
  asyncErrorHandler,
  validationBodyMiddleware,
} from '../../__middlewares__';
import { UpdatePrincipalSchema } from '../validations';
import { IAuthRequest } from '../../__shared__/interfaces';

export const updatePrincipalRouter = Router();
updatePrincipalRouter.post(
  '/principals.update',
  adminOnlyMiddleware,
  validationBodyMiddleware(UpdatePrincipalSchema),
  asyncErrorHandler(async (req: IAuthRequest, res) => {
    const payload = req.body;
    await updatePrincipalService(payload);

    res.status(200).send({
      ok: true,
    });
  })
);
