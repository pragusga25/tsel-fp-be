import { Router } from 'express';
import {
  asyncErrorHandler,
  authMiddleware,
  validationBodyMiddleware,
} from '../../__middlewares__';
import { DeleteAssignmentUserRequestSchema } from '../validations';
import { IAuthRequest } from '../../__shared__/interfaces';
import { deleteAssignmentUserRequestService } from '../services/delete-assignment-user-request.service';

export const deleteAssignmentUserRequestRouter = Router();
deleteAssignmentUserRequestRouter.post(
  '/assignment-user-requests.delete',
  authMiddleware,
  validationBodyMiddleware(DeleteAssignmentUserRequestSchema),
  asyncErrorHandler(async (req: IAuthRequest, res) => {
    const payload = req.body;
    await deleteAssignmentUserRequestService(payload, req.user!);

    res.status(200).send({
      ok: true,
    });
  })
);
