import { Router } from 'express';
import {
  adminOnlyMiddleware,
  asyncErrorHandler,
  validationBodyMiddleware,
} from '../../__middlewares__';
import { AcceptAssignmentUserRequestSchema } from '../validations';
import { IAuthRequest } from '../../__shared__/interfaces';
import { acceptAssignmentUserRequestService } from '../services/accept-assignment-user-request.service';

export const acceptAssignmentUserRequestRouter = Router();
acceptAssignmentUserRequestRouter.post(
  '/assignment-user-requests.accept',
  adminOnlyMiddleware,
  validationBodyMiddleware(AcceptAssignmentUserRequestSchema),
  asyncErrorHandler(async (req: IAuthRequest, res) => {
    const payload = req.body;
    await acceptAssignmentUserRequestService(payload, req.user!.id);

    res.status(200).send({
      ok: true,
    });
  })
);
