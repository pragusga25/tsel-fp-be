import { Router } from 'express';
import {
  adminOnlyMiddleware,
  asyncErrorHandler,
  validationBodyMiddleware,
} from '../../__middlewares__';
import { DeleteAccountAssignmentSchema } from '../validations';
import { deleteAssignmentService } from '../services';

export const deleteAssignmentRouter = Router();
deleteAssignmentRouter.post(
  '/assignments.delete',
  adminOnlyMiddleware,
  validationBodyMiddleware(DeleteAccountAssignmentSchema),
  asyncErrorHandler(async (req, res) => {
    const payload = req.body;
    await deleteAssignmentService(payload);

    res.status(200).send({
      ok: true,
    });
  })
);
