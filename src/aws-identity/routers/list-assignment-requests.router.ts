import { Router } from 'express';
import { listAssignmentRequestsService } from '../services';
import {
  asyncErrorHandler,
  rootOrApproverMiddleware,
} from '../../__middlewares__';
import { IAuthRequest } from '../../__shared__/interfaces';

export const listAssignmentRequestsRouter = Router();
listAssignmentRequestsRouter.get(
  '/assignment-requests.list',
  rootOrApproverMiddleware(false),
  asyncErrorHandler(async (req: IAuthRequest, res) => {
    const hasAccess = !!req.user?.isRoot || !!req.user?.isApprover;

    const result = hasAccess ? await listAssignmentRequestsService() : [];

    res.status(200).send({
      ok: true,
      ...result,
    });
  })
);
