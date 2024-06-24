import { IJwtPayload } from '../../__shared__/interfaces';
import { db } from '../../db';
import { listAwsAccountsService } from './list-aws-accounts.service';
import { listPermissionSetsService } from './list-permission-sets.service';

export const getAssignmentUserRequestFormDataService = async (
  currentUser: IJwtPayload
) => {
  const permissionSetsPromise = listPermissionSetsService(currentUser);
  const awsAccountsPromise = listAwsAccountsService();
  const timeInHoursPromise = db.timeInHour.findMany();

  const [permissionSets, awsAccounts, timeInHours] = await Promise.all([
    permissionSetsPromise,
    awsAccountsPromise,
    timeInHoursPromise,
  ]);

  return {
    result: {
      permissionSets: permissionSets.result,
      awsAccounts: awsAccounts.result.filter((aa) =>
        aa.name.toLowerCase().startsWith('prod')
      ),
      times: timeInHours.map((t) => t.timeInHour),
    },
  };
};
