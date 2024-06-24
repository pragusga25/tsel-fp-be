import { Router } from 'express';
import {
  asyncErrorHandler,
  authMiddleware,
  validationBodyMiddleware,
} from '../../__middlewares__';
import { CreateAssignmentUserRequestSchema } from '../validations';
import { IAuthRequest } from '../../__shared__/interfaces';
import { createAssignmentUserRequestService } from '../services/create-assignment-user-request.service';

export const createAssignmentUserRequestRouter = Router();
createAssignmentUserRequestRouter.post(
  '/assignment-user-requests.create',
  authMiddleware,
  validationBodyMiddleware(CreateAssignmentUserRequestSchema),
  asyncErrorHandler(async (req: IAuthRequest, res) => {
    const payload = req.body;
    await createAssignmentUserRequestService(payload, req.user!.id);

    res.status(201).send({
      ok: true,
    });
  })
);
