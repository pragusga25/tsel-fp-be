import { Router } from 'express';
import { listUserAssignmentsService } from '../services';
import { adminOnlyMiddleware, asyncErrorHandler } from '../../__middlewares__';

export const listUserAssignmentsRouter = Router();
listUserAssignmentsRouter.get(
  '/assignments.users.list',
  adminOnlyMiddleware,
  asyncErrorHandler(async (_req, res) => {
    const result = await listUserAssignmentsService();

    res.status(200).send({
      ok: true,
      ...result,
    });
  })
);
