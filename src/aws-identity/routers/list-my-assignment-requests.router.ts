import { Router } from 'express';
import { listMyAssignmentRequestsService } from '../services';
import { asyncErrorHandler, userOnlyMiddleware } from '../../__middlewares__';
import { IAuthRequest } from '../../__shared__/interfaces';

export const listMyAssignmentRequestsRouter = Router();
listMyAssignmentRequestsRouter.get(
  '/assignment-requests.my-list',
  userOnlyMiddleware,
  asyncErrorHandler(async (req: IAuthRequest, res) => {
    const result = await listMyAssignmentRequestsService(req.user!.id);

    res.status(200).send({
      ok: true,
      ...result,
    });
  })
);
