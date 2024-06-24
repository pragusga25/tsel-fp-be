import { Router } from 'express';
import { asyncErrorHandler, userOnlyMiddleware } from '../../__middlewares__';
import { getAssignmentUserRequestFormDataService } from '../services';
import { IAuthRequest } from '../../__shared__/interfaces';

export const getAssignmentUserRequestFormDataRouter = Router();
getAssignmentUserRequestFormDataRouter.get(
  '/assignment-user-requests.get-form-data',
  userOnlyMiddleware,
  asyncErrorHandler(async (req: IAuthRequest, res) => {
    const result = await getAssignmentUserRequestFormDataService(req.user!);
    res.status(200).send({
      ok: true,
      ...result,
    });
  })
);
