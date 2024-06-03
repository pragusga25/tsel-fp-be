import { Router } from 'express';
import { pushOneAssignmentService } from '../services';
import {
  adminOnlyMiddleware,
  asyncErrorHandler,
  validationBodyMiddleware,
} from '../../__middlewares__';
import { PushOneAssignmentSchema } from '../validations';

export const pushOneAssignmentRouter = Router();
pushOneAssignmentRouter.post(
  '/assignments.push-one',
  adminOnlyMiddleware,
  validationBodyMiddleware(PushOneAssignmentSchema),
  asyncErrorHandler(async (req, res) => {
    const payload = req.body;
    // await pushOneAssignmentService(payload);
    res.on('finish', async () => {
      await pushOneAssignmentService(payload);
    });

    res.status(200).send({
      ok: true,
    });
  })
);
