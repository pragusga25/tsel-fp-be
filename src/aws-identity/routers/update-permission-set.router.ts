import { Router } from 'express';
import { updatePermissionSetService } from '../services';
import {
  adminOnlyMiddleware,
  asyncErrorHandler,
  validationBodyMiddleware,
} from '../../__middlewares__';
import { UpdatePermissionSetSchema } from '../validations';
import { IAuthRequest } from '../../__shared__/interfaces';

export const updatePermissionSetRouter = Router();
updatePermissionSetRouter.post(
  '/permission-sets.update',
  adminOnlyMiddleware,
  validationBodyMiddleware(UpdatePermissionSetSchema),
  asyncErrorHandler(async (req: IAuthRequest, res) => {
    const payload = req.body;
    await updatePermissionSetService(payload);

    res.status(200).send({
      ok: true,
    });
  })
);
