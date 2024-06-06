import { Router } from 'express';
import {
  adminOnlyMiddleware,
  asyncErrorHandler,
  validationBodyMiddleware,
} from '../../__middlewares__';
import { IAuthRequest } from '../../__shared__/interfaces';
import { createApproversService } from '../services';
import { CreateApproversSchema } from '../validations';

export const createApproversRouter = Router();
createApproversRouter.post(
  '/approvers.create',
  adminOnlyMiddleware,
  validationBodyMiddleware(CreateApproversSchema),
  asyncErrorHandler(async (req: IAuthRequest, res) => {
    const payload = req.body;
    await createApproversService(payload, req.user);
    res.status(200).send({
      ok: true,
    });
  })
);
