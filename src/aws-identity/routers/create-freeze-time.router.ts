import { Router } from 'express';
import { createFreezeTimeService } from '../services';
import {
  adminOnlyMiddleware,
  asyncErrorHandler,
  validationBodyMiddleware,
} from '../../__middlewares__';
import { CreateFreezeTimeSchema } from '../validations';
import { IAuthRequest } from '../../__shared__/interfaces';

export const createFreezeTimeRouter = Router();
createFreezeTimeRouter.post(
  '/freeze-times.create',
  adminOnlyMiddleware,
  validationBodyMiddleware(CreateFreezeTimeSchema),
  asyncErrorHandler(async (req: IAuthRequest, res) => {
    const payload = req.body;
    const result = await createFreezeTimeService({
      ...payload,
      creatorId: req.user!.id,
    });

    res.status(201).send({
      ok: true,
      ...result,
    });
  })
);
