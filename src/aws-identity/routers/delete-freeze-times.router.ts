import { Router } from 'express';
import { deleteFreezeTimesService } from '../services';
import {
  adminOnlyMiddleware,
  asyncErrorHandler,
  validationBodyMiddleware,
} from '../../__middlewares__';
import { DeleteFreezeTimesSchema } from '../validations';
import { IAuthRequest } from '../../__shared__/interfaces';

export const deleteFreezeTimesRouter = Router();
deleteFreezeTimesRouter.post(
  '/freeze-times.delete',
  adminOnlyMiddleware,
  validationBodyMiddleware(DeleteFreezeTimesSchema),
  asyncErrorHandler(async (req: IAuthRequest, res) => {
    const payload = req.body;
    await deleteFreezeTimesService(payload);

    res.status(200).send({
      ok: true,
    });
  })
);
