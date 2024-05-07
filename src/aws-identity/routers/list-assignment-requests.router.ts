import { Router } from 'express';
import { listAssignmentRequestsService } from '../services';
import { adminOnlyMiddleware, asyncErrorHandler } from '../../__middlewares__';
import { IAuthRequest } from '../../__shared__/interfaces';

export const listAssignmentRequestsRouter = Router();
listAssignmentRequestsRouter.get(
  '/assignment-requests.list',
  adminOnlyMiddleware,
  asyncErrorHandler(async (req: IAuthRequest, res) => {
    const result = await listAssignmentRequestsService();

    res.status(200).send({
      ok: true,
      ...result,
    });
  })
);
