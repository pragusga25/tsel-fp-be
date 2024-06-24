import { acceptAssignmentRequestsRouter } from './accept-assignment-requests.router';
import { getIdentityInstanceRouter } from './get-identity-instance.router';
import { listAssignmentsRouter } from './list-assignments.router';
import { listGroupPrincipalsRouter } from './list-group-principals.router';
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
import { countAssignmentRequestsRouter } from './count-assignment-requests.router';
import { editAccountAssignmentRouter } from './edit-account-assignment.router';
import { pushOneAssignmentRouter } from './push-one-assignment.router';
import { createPrincipalRouter } from './create-principal.router';
import { deletePrincipalRouter } from './delete-principal.router';
import { updatePrincipalRouter } from './update-principal.router';
import { deleteAssignmentRouter } from './delete-assignment.router';
import { listPrincipalsNotInDbRouter } from './list-principals-not-in-db.router';
import { createAssignmentRouter } from './create-assignment.router';
import { listUserPrincipalsRouter } from './list-user-principals.router';
import { createUserPrincipalRouter } from './create-user-principal.router';
import { createGroupPrincipalRouter } from './create-group-principal.router';
import { updatePrincipalUserRouter } from './update-principal-user.router';
import { updatePrincipalGroupRouter } from './update-principal-group.router';
import { listAwsAccountsRouter } from './list-aws-accounts.router';
import { listUserAssignmentsRouter } from './list-user-assignments.router';
import { listGroupAssignmentsRouter } from './list-group-assignments.router';
import { schedulerRollbackAssignmentsRouter } from './scheduler-rollback-assignments.router';
import { schedulerFreezeAssignmentsRouter } from './scheduler-freeze-assignments.router';
import { updatePermissionSetRouter } from './update-permission-set.router';
import { getAssignmentUserRequestFormDataRouter } from './get-assignment-user-request-data-form';
import { listTimeInHoursRouter } from './list-time-in-hours.router';
import { deleteTimeInHourRouter } from './delete-time-in-hour.router';
import { createTimeInHourRouter } from './create-time-in-hour.router';
import { createAssignmentUserRequestRouter } from './create-assignment-user-request.router';
import { listAssignmentUserRequestsRouter } from './list-assignment-user-requests.router';
import { deleteAssignmentUserRequestRouter } from './delete-assignment-user-request.router';
import { acceptAssignmentUserRequestRouter } from './accept-assignment-user-request.router';
import { rejectAssignmentUserRequestRouter } from './reject-assignment-user-request.router';
import { schedulerDetachAssignmentUserRequestRouter } from './scheduler-detach-assignment-user-request.router';

export const awsIdentityRouters = [
  listGroupPrincipalsRouter,
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
  countAssignmentRequestsRouter,
  editAccountAssignmentRouter,
  pushOneAssignmentRouter,
  createPrincipalRouter,
  deletePrincipalRouter,
  updatePrincipalRouter,
  deleteAssignmentRouter,
  listPrincipalsNotInDbRouter,
  createAssignmentRouter,
  listUserPrincipalsRouter,
  createUserPrincipalRouter,
  createGroupPrincipalRouter,
  updatePrincipalUserRouter,
  updatePrincipalGroupRouter,
  listAwsAccountsRouter,
  listUserAssignmentsRouter,
  listGroupAssignmentsRouter,
  schedulerFreezeAssignmentsRouter,
  schedulerRollbackAssignmentsRouter,
  updatePermissionSetRouter,
  getAssignmentUserRequestFormDataRouter,
  listTimeInHoursRouter,
  deleteTimeInHourRouter,
  createTimeInHourRouter,
  createAssignmentUserRequestRouter,
  listAssignmentUserRequestsRouter,
  deleteAssignmentUserRequestRouter,
  acceptAssignmentUserRequestRouter,
  rejectAssignmentUserRequestRouter,
  schedulerDetachAssignmentUserRequestRouter,
];
