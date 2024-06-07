import { Router } from 'express';
import { acceptAssignmentRequestService } from '../services';
import {
  asyncErrorHandler,
  rootOrApproverMiddleware,
  validationBodyMiddleware,
} from '../../__middlewares__';
import { AcceptAssignmentRequestsSchema } from '../validations';
import { IAuthRequest } from '../../__shared__/interfaces';

export const acceptAssignmentRequestsRouter = Router();
acceptAssignmentRequestsRouter.post(
  '/assignment-requests.accept',
  rootOrApproverMiddleware(),
  validationBodyMiddleware(AcceptAssignmentRequestsSchema),
  asyncErrorHandler(async (req: IAuthRequest, res) => {
    const { ids, operation } = req.body;
    await Promise.all(
      ids.map((id: string) =>
        acceptAssignmentRequestService(req.user!.id, id, operation)
      )
    );

    res.status(200).send({
      ok: true,
    });
  })
);
