import { Router } from 'express';
import { countAssignmentRequestsService } from '../services';
import {
  asyncErrorHandler,
  rootOrApproverMiddleware,
  validationQueryMiddleware,
} from '../../__middlewares__';
import {
  CountAssignmentRequestsData,
  CountAssignmentRequestsSchema,
} from '../validations';
import { IAuthRequest } from '../../__shared__/interfaces';

export const countAssignmentRequestsRouter = Router();
countAssignmentRequestsRouter.get(
  '/assignment-requests.count',
  rootOrApproverMiddleware(false),
  validationQueryMiddleware(CountAssignmentRequestsSchema),
  asyncErrorHandler(async (req: IAuthRequest, res) => {
    const hasAccess = !!req.user?.isRoot || !!req.user?.isApprover;
    const query = req.query as CountAssignmentRequestsData;
    const result = hasAccess
      ? await countAssignmentRequestsService(query)
      : { result: { count: 0 } };

    res.status(200).send({
      ok: true,
      ...result,
    });
  })
);
