import { Router } from 'express';
import { countAssignmentRequestsService } from '../services';
import {
  adminOnlyMiddleware,
  asyncErrorHandler,
  validationQueryMiddleware,
} from '../../__middlewares__';
import {
  CountAssignmentRequestsData,
  CountAssignmentRequestsSchema,
} from '../validations';

export const countAssignmentRequestsRouter = Router();
countAssignmentRequestsRouter.get(
  '/assignment-requests.count',
  adminOnlyMiddleware,
  validationQueryMiddleware(CountAssignmentRequestsSchema),
  asyncErrorHandler(async (req, res) => {
    const query = req.query as CountAssignmentRequestsData;
    const result = await countAssignmentRequestsService(query);

    res.status(200).send({
      ok: true,
      ...result,
    });
  })
);
