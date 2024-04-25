import { acceptAssignmentsRouter } from './accept-assignments.router';
import { getIdentityInstanceRouter } from './get-identity-instance.router';
import { listGroupsRouter } from './list-groups.router';
import { listInstancesRouter } from './list-instances.router';
import { listPermissionSetsRouter } from './list-permission-sets.router';
import { rejectAssignmentsRouter } from './reject-assignments.router';
import { requestAssignmentRouter } from './request-assignment.router';
import { synchronizeAssignmentsRouter } from './synchronize-assignments.router';
import { upsertIdentityInstanceRouter } from './upsert-identity-instance.router';

export const awsIdentityRouters = [
  listGroupsRouter,
  listInstancesRouter,
  getIdentityInstanceRouter,
  upsertIdentityInstanceRouter,
  synchronizeAssignmentsRouter,
  requestAssignmentRouter,
  acceptAssignmentsRouter,
  listPermissionSetsRouter,
  rejectAssignmentsRouter,
];
