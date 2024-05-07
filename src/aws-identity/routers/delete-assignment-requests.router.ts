import { Router } from 'express';
import { deleteAssignmentRequestsService } from '../services';
import {
  asyncErrorHandler,
  authMiddleware,
  validationBodyMiddleware,
} from '../../__middlewares__';
import { DeleteAssignmentRequestsSchema } from '../validations';
import { IAuthRequest } from '../../__shared__/interfaces';

export const deleteAssignmentRequestsRouter = Router();
deleteAssignmentRequestsRouter.post(
  '/assignment-requests.delete',
  authMiddleware,
  validationBodyMiddleware(DeleteAssignmentRequestsSchema),
  asyncErrorHandler(async (req: IAuthRequest, res) => {
    const payload = req.body;
    await deleteAssignmentRequestsService({
      ...payload,
      userId: req.user!.id,
      role: req.user!.role,
    });

    res.status(200).send({
      ok: true,
    });
  })
);
