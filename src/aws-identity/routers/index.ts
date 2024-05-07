import { acceptAssignmentRequestsRouter } from './accept-assignment-requests.router';
import { getIdentityInstanceRouter } from './get-identity-instance.router';
import { listAssignmentsRouter } from './list-assignments.router';
import { listGroupsRouter } from './list-groups.router';
import { listInstancesRouter } from './list-instances.router';
import { listPermissionSetsRouter } from './list-permission-sets.router';
import { listPrincipalsRouter } from './list-principals.router';
import { rejectAssignmentRequestsRouter } from './reject-assignment-requests.router';
import { requestAssignmentRouter } from './request-assignment.router';
import { pullAssignmentsRouter } from './pull-assignments.router';
import { upsertIdentityInstanceRouter } from './upsert-identity-instance.router';
import { pushAssignmentsRouter } from './push-assignments.router';
import { createFreezeTimeRouter } from './create-freeze-time.router';
import { listFreezeTimesRouter } from './list-freeze-times.router';
import { listMyPermissionSetsRouter } from './list-my-permission-sets.router';
import { listMyAssignmentRequestsRouter } from './list-my-assignment-requests.router';
import { listAssignmentRequestsRouter } from './list-assignment-requests.router';
import { freezeAssignmentsRouter } from './freeze-assignments.router';
import { schedulePushAssignmentsRouter } from './schedule-push-assignments.router';
import { deleteFreezeTimesRouter } from './delete-freeze-times.router';
import { deleteAssignmentRequestsRouter } from './delete-assignment-requests.router';

export const awsIdentityRouters = [
  listGroupsRouter,
  listInstancesRouter,
  getIdentityInstanceRouter,
  upsertIdentityInstanceRouter,
  pullAssignmentsRouter,
  requestAssignmentRouter,
  acceptAssignmentRequestsRouter,
  listPermissionSetsRouter,
  rejectAssignmentRequestsRouter,
  listAssignmentsRouter,
  listPrincipalsRouter,
  pushAssignmentsRouter,
  createFreezeTimeRouter,
  listFreezeTimesRouter,
  listMyPermissionSetsRouter,
  listMyAssignmentRequestsRouter,
  listAssignmentRequestsRouter,
  schedulePushAssignmentsRouter,
  freezeAssignmentsRouter,
  deleteFreezeTimesRouter,
  deleteAssignmentRequestsRouter,
];
