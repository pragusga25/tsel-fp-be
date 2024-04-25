import { Router } from 'express';
import { rejectAssignmentService } from '../services';

export const rejectAssignmentsRouter = Router();
rejectAssignmentsRouter.post(
  '/aws-identity/assignments.reject',
  async (req, res) => {
    const { ids } = req.body;

    await Promise.all(
      ids.map((id: string) =>
        rejectAssignmentService('clvd8lpfc0000ua4vlq4imdp3', id)
      )
    );

    res.status(200).send({
      ok: true,
    });
  }
);
