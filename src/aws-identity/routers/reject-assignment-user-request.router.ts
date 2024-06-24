import { Router } from 'express';
import {
  adminOnlyMiddleware,
  asyncErrorHandler,
  validationBodyMiddleware,
} from '../../__middlewares__';
import { RejectAssignmentUserRequestSchema } from '../validations';
import { IAuthRequest } from '../../__shared__/interfaces';
import { rejectAssignmentUserRequestService } from '../services/reject-assignment-user-request.service';

export const rejectAssignmentUserRequestRouter = Router();
rejectAssignmentUserRequestRouter.post(
  '/assignment-user-requests.reject',
  adminOnlyMiddleware,
  validationBodyMiddleware(RejectAssignmentUserRequestSchema),
  asyncErrorHandler(async (req: IAuthRequest, res) => {
    const payload = req.body;
    await rejectAssignmentUserRequestService(payload, req.user!.id);

    res.status(200).send({
      ok: true,
    });
  })
);
