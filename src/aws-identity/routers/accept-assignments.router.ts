import { Router } from 'express';
import { acceptAssignmentService } from '../services';
import {
  asyncErrorHandler,
  validationBodyMiddleware,
} from '../../__middlewares__';
import { AcceptAssignmentSchema } from '../validations';

export const acceptAssignmentsRouter = Router();
acceptAssignmentsRouter.post(
  '/aws-identity/assignments.accept',
  validationBodyMiddleware(AcceptAssignmentSchema),
  asyncErrorHandler(async (req, res) => {
    const { ids } = req.body;
    await Promise.all(
      ids.map((id: string) =>
        acceptAssignmentService('clvd8lpfc0000ua4vlq4imdp3', id)
      )
    );

    res.status(200).send({
      ok: true,
    });
  })
);
