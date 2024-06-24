import { Router } from 'express';
import { createTimeInHourService } from '../services';
import {
  adminOnlyMiddleware,
  asyncErrorHandler,
  validationBodyMiddleware,
} from '../../__middlewares__';
import { CreateTimeInHourSchema } from '../validations';
import { IAuthRequest } from '../../__shared__/interfaces';

export const createTimeInHourRouter = Router();
createTimeInHourRouter.post(
  '/time-in-hours.create',
  adminOnlyMiddleware,
  validationBodyMiddleware(CreateTimeInHourSchema),
  asyncErrorHandler(async (req: IAuthRequest, res) => {
    const payload = req.body;
    await createTimeInHourService(payload, req.user!.id);

    res.status(201).send({
      ok: true,
    });
  })
);
