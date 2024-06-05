import { Router } from 'express';
import {
  adminOnlyMiddleware,
  asyncErrorHandler,
  validationBodyMiddleware,
} from '../../__middlewares__';
import { IAuthRequest } from '../../__shared__/interfaces';
import { createAccountAdminBulkService } from '../services';
import { CreateAccountAdminBulkSchema } from '../validations';

export const createAccountAdminBulkRouter = Router();
createAccountAdminBulkRouter.post(
  '/admins.create-bulk',
  adminOnlyMiddleware,
  validationBodyMiddleware(CreateAccountAdminBulkSchema),
  asyncErrorHandler(async (req: IAuthRequest, res) => {
    const payload = req.body;
    await createAccountAdminBulkService(payload);
    res.status(200).send({
      ok: true,
    });
  })
);
