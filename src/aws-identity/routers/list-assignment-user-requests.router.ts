import { Router } from 'express';

import { asyncErrorHandler, authMiddleware } from '../../__middlewares__';
import { IAuthRequest } from '../../__shared__/interfaces';
import { listAssignmentUserRequestsService } from '../services/list-assignment-user-requests.service';

export const listAssignmentUserRequestsRouter = Router();
listAssignmentUserRequestsRouter.get(
  '/assignment-user-requests.list',
  authMiddleware,
  asyncErrorHandler(async (req: IAuthRequest, res) => {
    const result = await listAssignmentUserRequestsService(req.user!);

    res.status(200).send({
      ok: true,
      ...result,
    });
  })
);
