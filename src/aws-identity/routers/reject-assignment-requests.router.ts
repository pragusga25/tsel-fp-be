import { Router } from 'express';
import { rejectAssignmentRequestService } from '../services';
import {
  adminOnlyMiddleware,
  validationBodyMiddleware,
} from '../../__middlewares__';
import { RejectAssignmentRequestsSchema } from '../validations';
import { IAuthRequest } from '../../__shared__/interfaces';

export const rejectAssignmentRequestsRouter = Router();
rejectAssignmentRequestsRouter.post(
  '/assignment-requests.reject',
  adminOnlyMiddleware,
  validationBodyMiddleware(RejectAssignmentRequestsSchema),
  async (req: IAuthRequest, res) => {
    const { ids } = req.body;

    await Promise.all(
      ids.map((id: string) => rejectAssignmentRequestService(req.user!.id, id))
    );

    res.status(200).send({
      ok: true,
    });
  }
);
