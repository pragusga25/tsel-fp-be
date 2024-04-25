import { asyncErrorHandler } from './../../__middlewares__/error.middleware';
import { Router } from 'express';
import { requestAssignmentService } from '../services';
import { validationBodyMiddleware } from '../../__middlewares__';
import { RequestAssignmentSchema } from '../validations';

export const requestAssignmentRouter = Router();
requestAssignmentRouter.post(
  '/aws-identity/assignments.request',
  validationBodyMiddleware(RequestAssignmentSchema),
  asyncErrorHandler(async (req, res) => {
    const payload = req.body;
    const result = await requestAssignmentService(
      'clvdi6hny00006tax3b6skaer',
      '1',
      payload
    );
    res.status(200).send({
      ok: true,
      ...result,
    });
  })
);
