import { Router } from 'express';
import { adminOnlyMiddleware, asyncErrorHandler } from '../../__middlewares__';
import { IAuthRequest } from '../../__shared__/interfaces';
import { synchronizeAccountUserService } from '../services';

export const synchronizeAccountUserRouter = Router();
synchronizeAccountUserRouter.post(
  '/users.synchronize',
  adminOnlyMiddleware,
  asyncErrorHandler(async (req: IAuthRequest, res) => {
    await synchronizeAccountUserService();
    res.status(200).send({
      ok: true,
    });
  })
);
