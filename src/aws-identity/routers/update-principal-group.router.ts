import { Router } from 'express';
import { updatePrincipalGroupService } from '../services';
import {
  adminOnlyMiddleware,
  asyncErrorHandler,
  validationBodyMiddleware,
} from '../../__middlewares__';
import { UpdatePrincipalGroupSchema } from '../validations';
import { IAuthRequest } from '../../__shared__/interfaces';

export const updatePrincipalGroupRouter = Router();
updatePrincipalGroupRouter.post(
  '/principals.groups.update',
  adminOnlyMiddleware,
  validationBodyMiddleware(UpdatePrincipalGroupSchema),
  asyncErrorHandler(async (req: IAuthRequest, res) => {
    const payload = req.body;
    await updatePrincipalGroupService(payload);

    res.status(200).send({
      ok: true,
    });
  })
);
