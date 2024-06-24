import { Router } from 'express';
import { deleteTimeInHourService } from '../services';
import {
  adminOnlyMiddleware,
  asyncErrorHandler,
  validationBodyMiddleware,
} from '../../__middlewares__';
import { DeleteTimeInHourSchema } from '../validations';
import { IAuthRequest } from '../../__shared__/interfaces';

export const deleteTimeInHourRouter = Router();
deleteTimeInHourRouter.post(
  '/time-in-hours.delete',
  adminOnlyMiddleware,
  validationBodyMiddleware(DeleteTimeInHourSchema),
  asyncErrorHandler(async (req: IAuthRequest, res) => {
    const payload = req.body;
    await deleteTimeInHourService(payload);

    res.status(201).send({
      ok: true,
    });
  })
);
