import { Response, Router } from 'express';
import { rejectAssignmentRequestService } from '../services';
import {
  rootOrApproverMiddleware,
  validationBodyMiddleware,
} from '../../__middlewares__';
import { RejectAssignmentRequestsSchema } from '../validations';
import { IAuthRequest } from '../../__shared__/interfaces';

export const rejectAssignmentRequestsRouter = Router();
rejectAssignmentRequestsRouter.post(
  '/assignment-requests.reject',
  rootOrApproverMiddleware(),
  validationBodyMiddleware(RejectAssignmentRequestsSchema),
  async (req: IAuthRequest, res: Response) => {
    const { ids } = req.body;

    await Promise.all(
      ids.map((id: string) => rejectAssignmentRequestService(req.user!.id, id))
    );

    res.status(200).send({
      ok: true,
    });
  }
);
