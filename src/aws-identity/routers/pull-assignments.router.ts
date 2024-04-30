import { Router } from 'express';
import { pullAssignmentsService } from '../services';
import {
  adminOnlyMiddleware,
  asyncErrorHandler,
  validationBodyMiddleware,
} from '../../__middlewares__';
import { PullAssignmentSchema } from '../validations';

export const pullAssignmentsRouter = Router();
pullAssignmentsRouter.post(
  '/assignments.pull',
  adminOnlyMiddleware,
  validationBodyMiddleware(PullAssignmentSchema),
  asyncErrorHandler(async (req, res) => {
    const payload = req.body;
    await pullAssignmentsService(payload);

    res.status(200).send({
      ok: true,
    });
  })
);
