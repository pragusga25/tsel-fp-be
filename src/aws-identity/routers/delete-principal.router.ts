import { Router } from 'express';
import { deletePrincipalService } from '../services';
import {
  adminOnlyMiddleware,
  asyncErrorHandler,
  validationBodyMiddleware,
} from '../../__middlewares__';
import { DeletePrincipalSchema } from '../validations';
import { IAuthRequest } from '../../__shared__/interfaces';

export const deletePrincipalRouter = Router();
deletePrincipalRouter.post(
  '/principals.delete',
  adminOnlyMiddleware,
  validationBodyMiddleware(DeletePrincipalSchema),
  asyncErrorHandler(async (req: IAuthRequest, res) => {
    const payload = req.body;
    await deletePrincipalService(payload);

    res.status(200).send({
      ok: true,
    });
  })
);
