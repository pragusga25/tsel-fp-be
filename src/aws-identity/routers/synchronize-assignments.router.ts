import { Router } from 'express';
import { synchronizeAssignmentsService } from '../services';
import {
  asyncErrorHandler,
  validationBodyMiddleware,
} from '../../__middlewares__';
import { SynchronizeAssignmentSchema } from '../validations';

export const synchronizeAssignmentsRouter = Router();
synchronizeAssignmentsRouter.post(
  '/aws-identity/assignments.synchronize',
  validationBodyMiddleware(SynchronizeAssignmentSchema),
  asyncErrorHandler(async (req, res) => {
    const payload = req.body;
    await synchronizeAssignmentsService(payload);

    res.status(200).send({
      ok: true,
    });
  })
);
