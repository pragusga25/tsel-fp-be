import { acceptAssignmentsRouter } from './accept-assignments.router';
import { getIdentityInstanceRouter } from './get-identity-instance.router';
import { listAssignmentsRouter } from './list-assignments.router';
import { listGroupsRouter } from './list-groups.router';
import { listInstancesRouter } from './list-instances.router';
import { listPermissionSetsRouter } from './list-permission-sets.router';
import { listPrincipalsRouter } from './list-principals.router';
import { rejectAssignmentsRouter } from './reject-assignments.router';
import { requestAssignmentRouter } from './request-assignment.router';
import { pullAssignmentsRouter } from './pull-assignments.router';
import { upsertIdentityInstanceRouter } from './upsert-identity-instance.router';
import { pushAssignmentsRouter } from './push-assignments.router';
import { createFreezeTimeRouter } from './create-freeze-time.router';
import { listFreezeTimesRouter } from './list-freeze-times.router';

export const awsIdentityRouters = [
  listGroupsRouter,
  listInstancesRouter,
  getIdentityInstanceRouter,
  upsertIdentityInstanceRouter,
  pullAssignmentsRouter,
  requestAssignmentRouter,
  acceptAssignmentsRouter,
  listPermissionSetsRouter,
  rejectAssignmentsRouter,
  listAssignmentsRouter,
  listPrincipalsRouter,
  pushAssignmentsRouter,
  createFreezeTimeRouter,
  listFreezeTimesRouter,
];
